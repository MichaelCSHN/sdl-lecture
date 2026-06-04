/**
 * Case Engine — stateful GP-powered SDL session manager.
 *
 * Wraps the GaussianProcess + acquisition functions from bo_engine
 * into a session with init/recommend/observe/reset/seeded-replay.
 */

import {
  GaussianProcess,
  expectedImprovement,
  setBORngSeed,
  uniformBORandom,
  type LiveCase,
} from '@/lib/bo_engine';

// ============================================================
// Types
// ============================================================

export interface ExperimentRecord {
  iteration: number;
  params: number[]; // actual parameter values (in case-native units)
  observation: number;
  bestSoFar: number;
}

export interface Recommendation {
  params: number[];
  predictedMean: number;
  predictedStd: number;
  acquisitionValue: number;
  acquisitionType: 'EI' | 'UCB';
  /** Human-readable explanation of why this point was chosen */
  explanation: string;
}

export interface CaseSessionState {
  caseId: string;
  seed: number;
  iteration: number;
  history: ExperimentRecord[];
  currentRecommendation: Recommendation | null;
  bestObservation: number;
  bestParams: number[];
  phase: 'idle' | 'has-recommendation' | 'observing';
}

// ============================================================
// Session Manager
// ============================================================

export class CaseSession {
  readonly caseDef: LiveCase;
  private gp: GaussianProcess;
  private seed: number;
  private _state: CaseSessionState;
  private normalize: boolean;

  constructor(caseDef: LiveCase, seed: number = 42) {
    this.caseDef = caseDef;
    this.seed = seed;
    this.normalize = caseDef.params.length > 1;

    const ls = caseDef.lengthScale ?? 0.25;
    this.gp = new GaussianProcess(ls, 1.0, 1e-4);

    this._state = {
      caseId: caseDef.id,
      seed,
      iteration: 0,
      history: [],
      currentRecommendation: null,
      bestObservation: -Infinity,
      bestParams: [],
      phase: 'idle',
    };

    // Seed the RNG
    setBORngSeed(seed);

    // Generate initial recommendation from prior
    this.recommend();
  }

  get state(): Readonly<CaseSessionState> {
    return this._state;
  }

  // ---- Recommend next point ----

  recommend(): Recommendation {
    const nParams = this.caseDef.params.length;

    // Fit GP on current history
    if (this._state.history.length > 0) {
      const X = this._state.history.map((r) =>
        this.normalize
          ? r.params.map((v, i) =>
              this.scaleToUnit(v, this.caseDef.params[i].min, this.caseDef.params[i].max)
            )
          : r.params
      );
      const y = this._state.history.map((r) => r.observation);
      this.gp.fit(X, y);
    }

    // Candidate grid search for best acquisition value
    const candidates = this.generateCandidates(nParams);
    let bestAcq = -Infinity;
    let bestCandidate: number[] = candidates[0];
    let bestMean = 0;
    let bestStd = 0;

    const yBest = this._state.history.length > 0
      ? Math.max(...this._state.history.map((r) => r.observation))
      : 0;

    const xi = 0.01; // exploration parameter for EI

    for (const cand of candidates) {
      const normCand = this.normalize
        ? cand.map((v, i) =>
            this.scaleToUnit(v, this.caseDef.params[i].min, this.caseDef.params[i].max)
          )
        : cand;
      const pred = this.gp.predict(normCand);
      const ei = expectedImprovement(pred.mean, pred.std, yBest, xi);
      if (ei > bestAcq) {
        bestAcq = ei;
        bestCandidate = cand;
        bestMean = pred.mean;
        bestStd = pred.std;
      }
    }

    const rec: Recommendation = {
      params: bestCandidate.map((v) => Math.round(v * 100) / 100),
      predictedMean: Math.round(bestMean * 100) / 100,
      predictedStd: Math.round(bestStd * 100) / 100,
      acquisitionValue: Math.round(bestAcq * 10000) / 10000,
      acquisitionType: 'EI',
      explanation: this.buildExplanation(bestMean, bestStd, yBest, bestAcq),
    };

    this._state.currentRecommendation = rec;
    this._state.phase = 'has-recommendation';

    return rec;
  }

  // ---- Observe (run experiment) ----

  observe(params?: number[]): ExperimentRecord {
    const useParams = params ?? this._state.currentRecommendation?.params;
    if (!useParams || useParams.length === 0) {
      throw new Error('No parameters to observe. Call recommend() first or provide params.');
    }

    // Evaluate objective function
    const rawObservation = this.caseDef.objectiveFn([...useParams]);
    const observation = Math.round(rawObservation * 100) / 100;

    const iter = this._state.history.length + 1;
    const bestSoFar = Math.max(
      observation,
      this._state.history.length > 0
        ? Math.max(...this._state.history.map((r) => r.observation))
        : -Infinity
    );

    const record: ExperimentRecord = {
      iteration: iter,
      params: [...useParams],
      observation,
      bestSoFar,
    };

    this._state.history.push(record);

    if (observation > this._state.bestObservation) {
      this._state.bestObservation = observation;
      this._state.bestParams = [...useParams];
    }

    this._state.iteration = iter;
    this._state.phase = 'observing';

    return record;
  }

  // ---- Run N steps automatically ----

  runSteps(n: number): ExperimentRecord[] {
    const records: ExperimentRecord[] = [];
    for (let i = 0; i < n; i++) {
      this.recommend();
      const rec = this._state.currentRecommendation;
      if (!rec) break;
      const record = this.observe(rec.params);
      records.push(record);
    }
    // Re-recommend after the run for display
    this.recommend();
    return records;
  }

  // ---- Reset ----

  reset(newSeed?: number): void {
    if (newSeed !== undefined) {
      this.seed = newSeed;
    }
    setBORngSeed(this.seed);

    const ls = this.caseDef.lengthScale ?? 0.25;
    this.gp = new GaussianProcess(ls, 1.0, 1e-4);

    this._state = {
      caseId: this.caseDef.id,
      seed: this.seed,
      iteration: 0,
      history: [],
      currentRecommendation: null,
      bestObservation: -Infinity,
      bestParams: [],
      phase: 'idle',
    };

    this.recommend();
  }

  // ---- Private helpers ----

  private generateCandidates(_nParams: number): number[][] {
    // Deterministic uniform candidates using seeded RNG
    const n = 200;
    const candidates: number[][] = [];
    for (let i = 0; i < n; i++) {
      const point = this.caseDef.params.map((p) => {
        const u = uniformBORandom(); // uniform [0,1), respects seed
        return p.min + u * (p.max - p.min);
      });
      candidates.push(point);
    }
    return candidates;
  }

  private scaleToUnit(value: number, min: number, max: number): number {
    const range = max - min;
    if (range === 0) return 0;
    return (value - min) / range;
  }

  private buildExplanation(
    predictedMean: number,
    predictedStd: number,
    yBest: number,
    acqValue: number
  ): string {
    if (this._state.history.length === 0) {
      return `Initial exploration: no prior observations. Selected point from prior distribution (prior mean ~${predictedMean.toFixed(1)}, uncertainty ${predictedStd.toFixed(1)}).`;
    }
    const isExploration = predictedStd > 5;
    const isExploitation = predictedMean > yBest && predictedStd < 3;
    if (isExploitation) {
      return `Exploitation: high predicted value (${predictedMean.toFixed(1)}) with low uncertainty (std ${predictedStd.toFixed(1)}). Model is confident this region outperforms current best (${yBest.toFixed(1)}).`;
    }
    if (isExploration) {
      return `Exploration: high uncertainty (std ${predictedStd.toFixed(1)}). Model is uncertain about this region — worth sampling to reduce uncertainty even though predicted mean (${predictedMean.toFixed(1)}) is moderate.`;
    }
    return `Balanced choice: predicted mean ${predictedMean.toFixed(1)}, std ${predictedStd.toFixed(1)}, EI = ${acqValue.toFixed(4)}. Current best = ${yBest.toFixed(1)}.`;
  }
}
