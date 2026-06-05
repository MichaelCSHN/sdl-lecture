/**
 * CaseStudioPage - interactive SDL case collection.
 */

import { useState } from 'react';
import { useLecture } from '@/contexts/LectureContext';
import BraninCaseView from '@/components/BraninCaseView';
import LedCaseView from '@/components/LedCaseView';
import ThinFilmCaseView from '@/components/ThinFilmCaseView';

type CaseId = 'branin' | 'led' | 'thinFilm';

const CASES = [
  {
    id: 'branin' as CaseId,
    label: 'Branin',
    labelEn: 'Branin Function',
    tag: 'Math benchmark · 2D · 3 global optima',
    accent: '#4361ee',
    desc:
      'A clean 2D Bayesian optimization benchmark. Useful for explaining exploration, exploitation, and seed sensitivity.',
  },
  {
    id: 'led' as CaseId,
    label: 'LED Calibration',
    labelEn: 'LED Spectral Calibration',
    tag: 'Remote sensing · multi-channel · multi-objective',
    accent: '#00f5d4',
    desc:
      'Use a 400-1000 nm LED array to match target reflectance spectra while balancing fit quality, cost, power, and channel count.',
  },
  {
    id: 'thinFilm' as CaseId,
    label: 'Optical Thin-Film',
    labelEn: 'Thin-Film Absorber',
    tag: 'Physics simulator · 400-1100 nm · band-stop absorber',
    accent: '#ff6b6b',
    desc:
      'A more realistic optics case driven by transfer-matrix simulation: tune a SiO2/TiO2/Cr stack for strong absorption in 650-700 nm and high out-of-band transmission.',
  },
] as const;

export default function CaseStudioPage() {
  const [activeCase, setActiveCase] = useState<CaseId>('branin');
  const { isLectureMode } = useLecture();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-[#00f5d4] font-mono text-xs tracking-widest mb-2">CASE STUDIO</div>
        <h1 className="text-3xl font-semibold tracking-tight mb-3 text-[#f3f6fb]">SDL closed-loop demos</h1>
        <p className="text-[#8a92a3] text-sm max-w-2xl leading-relaxed mb-6">
          Three SDL cases at different levels: a mathematical benchmark, a high-dimensional engineering calibration task,
          and a realistic physics-driven thin-film design problem. All of them run entirely in the browser.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {CASES.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveCase(item.id)}
              className="flex-1 text-left rounded-xl border p-4 transition-all"
              style={{
                borderColor: activeCase === item.id ? item.accent : 'rgba(67,97,238,0.15)',
                background: activeCase === item.id ? `${item.accent}10` : 'rgba(255,255,255,0.01)',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: activeCase === item.id ? item.accent : '#d0d4dc' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: `${item.accent}18`, color: item.accent }}
                >
                  {item.labelEn}
                </span>
              </div>
              <div
                className="text-[10px] font-mono mb-1.5"
                style={{ color: activeCase === item.id ? item.accent : '#5a6377' }}
              >
                {item.tag}
              </div>
              <p className="text-[11px] text-[#8a92a3] leading-5">{item.desc}</p>
            </button>
          ))}
        </div>

        {isLectureMode && (
          <div className="mt-3 p-3 rounded border border-amber-800 bg-[rgba(120,53,15,0.12)]">
            <p className="text-[10px] text-amber-300 font-mono leading-relaxed">
              <strong>Lecture cue:</strong>{' '}
              {activeCase === 'branin'
                ? 'Reset with different seeds and compare which global optimum the GP converges to.'
                : activeCase === 'led'
                  ? 'Hold the target fixed and swap the surrogate model or objective weights to show how optimization behavior changes.'
                  : 'Use this case to emphasize that the observations come from a real simulator, not a hand-written toy function.'}
            </p>
          </div>
        )}
      </div>

      {activeCase === 'branin' && <BraninCaseView />}
      {activeCase === 'led' && <LedCaseView />}
      {activeCase === 'thinFilm' && <ThinFilmCaseView />}
    </div>
  );
}
