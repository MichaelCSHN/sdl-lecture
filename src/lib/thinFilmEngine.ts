import type { LiveCase } from '@/lib/bo_engine';
import { THIN_FILM_MATERIALS, THIN_FILM_WAVELENGTH_NM } from '@/data/thinFilmMaterials';

type Complex = { re: number; im: number };

export interface ThinFilmMetrics {
  objective: number;
  avgInBandAbsorption: number;
  avgShortPassTransmission: number;
  avgLongPassTransmission: number;
  avgInBandReflectance: number;
  totalThicknessNm: number;
  wavelengthsNm: number[];
  reflectance: number[];
  transmittance: number[];
  absorptance: number[];
}

export const THIN_FILM_CASE: LiveCase = {
  id: 'thin_film_absorber',
  name: 'Optical Thin-Film Filter',
  nameEn: 'Optical Thin-Film Filter',
  description:
    'Symmetric SiO2/TiO2/Cr multilayer absorber. Maximize absorption in 650-700 nm while keeping the short- and long-pass regions transmissive.',
  params: [
    { name: 'SiO2 cap', nameEn: 'SiO2 Cap', unit: 'nm', min: 10, max: 180, step: 1, default: 135 },
    { name: 'TiO2 mirror', nameEn: 'TiO2 Mirror', unit: 'nm', min: 10, max: 180, step: 1, default: 80 },
    { name: 'SiO2 spacer', nameEn: 'SiO2 Spacer', unit: 'nm', min: 5, max: 220, step: 1, default: 160 },
    { name: 'Cr absorber', nameEn: 'Cr Absorber', unit: 'nm', min: 4, max: 30, step: 0.5, default: 6 },
  ],
  objectiveFn: (values) => evaluateThinFilmDesign(values).objective,
  noise: 0,
  unit: 'score',
  xlabel: 'SiO2 cap (nm)',
  ylabel: 'TiO2 mirror (nm)',
  domain: [
    [10, 180],
    [10, 180],
    [5, 220],
    [4, 30],
  ],
  lengthScale: 0.22,
};

export const THIN_FILM_LAYER_LABELS = [
  'SiO2 cap',
  'TiO2 mirror',
  'SiO2 spacer',
  'Cr absorber',
  'SiO2 spacer',
  'TiO2 mirror',
  'SiO2 cap',
] as const;

export const THIN_FILM_PROBLEM = {
  inBand: [650, 700] as const,
  shortPass: [400, 620] as const,
  longPass: [730, 1100] as const,
  materials: [
    'SiO2 (Malitson) as the transparent low-index layer',
    'TiO2 (Siefke) as the high-index layer',
    'Cr (Johnson) as the absorbing layer',
  ],
  stack:
    'Air | SiO2(cap) | TiO2(mirror) | SiO2(spacer) | Cr(absorber) | SiO2(spacer) | TiO2(mirror) | SiO2(cap) | SiO2 substrate',
};

const FULL_GRID = THIN_FILM_WAVELENGTH_NM;
const OBJECTIVE_STEP_NM = 5;
const OBJECTIVE_GRID_IDX = FULL_GRID
  .map((wl, idx) => ({ wl, idx }))
  .filter(({ wl }) => (wl - FULL_GRID[0]) % OBJECTIVE_STEP_NM === 0)
  .map(({ idx }) => idx);

const IN_BAND = indexRange(FULL_GRID, 650, 700);
const SHORT_PASS = indexRange(FULL_GRID, 400, 620);
const LONG_PASS = indexRange(FULL_GRID, 730, 1100);
const OBJECTIVE_IN_BAND = IN_BAND.filter((idx) => OBJECTIVE_GRID_IDX.includes(idx));
const OBJECTIVE_SHORT_PASS = SHORT_PASS.filter((idx) => OBJECTIVE_GRID_IDX.includes(idx));
const OBJECTIVE_LONG_PASS = LONG_PASS.filter((idx) => OBJECTIVE_GRID_IDX.includes(idx));

const MATERIAL_ORDER = [
  THIN_FILM_MATERIALS.sio2,
  THIN_FILM_MATERIALS.tio2,
  THIN_FILM_MATERIALS.sio2,
  THIN_FILM_MATERIALS.cr,
  THIN_FILM_MATERIALS.sio2,
  THIN_FILM_MATERIALS.tio2,
  THIN_FILM_MATERIALS.sio2,
] as const;

export function evaluateThinFilmDesign(params: number[]): ThinFilmMetrics {
  const reflectance = new Array<number>(FULL_GRID.length).fill(0);
  const transmittance = new Array<number>(FULL_GRID.length).fill(0);
  const absorptance = new Array<number>(FULL_GRID.length).fill(0);

  for (let idx = 0; idx < FULL_GRID.length; idx++) {
    const { R, T, A } = simulateAtIndex(params, idx);
    reflectance[idx] = R;
    transmittance[idx] = T;
    absorptance[idx] = A;
  }

  const avgInBandAbsorption = meanAt(absorptance, IN_BAND);
  const avgShortPassTransmission = meanAt(transmittance, SHORT_PASS);
  const avgLongPassTransmission = meanAt(transmittance, LONG_PASS);
  const avgInBandReflectance = meanAt(reflectance, IN_BAND);
  const totalThicknessNm = params[0] * 2 + params[1] * 2 + params[2] * 2 + params[3];
  const thicknessPenalty = clamp01((totalThicknessNm - 760) / 840) * 0.03;

  const objective = clamp01(
    0.55 * meanAt(absorptance, OBJECTIVE_IN_BAND) +
      0.225 * meanAt(transmittance, OBJECTIVE_SHORT_PASS) +
      0.225 * meanAt(transmittance, OBJECTIVE_LONG_PASS) -
      thicknessPenalty
  );

  return {
    objective,
    avgInBandAbsorption,
    avgShortPassTransmission,
    avgLongPassTransmission,
    avgInBandReflectance,
    totalThicknessNm,
    wavelengthsNm: FULL_GRID,
    reflectance,
    transmittance,
    absorptance,
  };
}

export function describeThinFilmLayers(params: number[]) {
  return [
    { label: 'SiO2', family: 'dielectric-low', thicknessNm: params[0] },
    { label: 'TiO2', family: 'dielectric-high', thicknessNm: params[1] },
    { label: 'SiO2', family: 'dielectric-low', thicknessNm: params[2] },
    { label: 'Cr', family: 'absorber', thicknessNm: params[3] },
    { label: 'SiO2', family: 'dielectric-low', thicknessNm: params[2] },
    { label: 'TiO2', family: 'dielectric-high', thicknessNm: params[1] },
    { label: 'SiO2', family: 'dielectric-low', thicknessNm: params[0] },
  ] as const;
}

function simulateAtIndex(params: number[], idx: number) {
  const wavelengthNm = FULL_GRID[idx];
  const ambient = complex(1, 0);
  const substrate = complex(
    THIN_FILM_MATERIALS.sio2.n[idx],
    THIN_FILM_MATERIALS.sio2.k[idx]
  );

  const stackIndices = [
    ambient,
    ...MATERIAL_ORDER.map((material) => complex(material.n[idx], material.k[idx])),
    substrate,
  ];
  const thicknesses = [params[0], params[1], params[2], params[3], params[2], params[1], params[0]];

  let m11 = complex(1, 0);
  let m12 = complex(0, 0);
  let m21 = complex(0, 0);
  let m22 = complex(1, 0);

  for (let layer = 0; layer < thicknesses.length; layer++) {
    const nLeft = stackIndices[layer];
    const nRight = stackIndices[layer + 1];
    const r = cDiv(cSub(nLeft, nRight), cAdd(nLeft, nRight));
    const t = cDiv(cScale(nLeft, 2), cAdd(nLeft, nRight));

    const i11 = cDiv(complex(1, 0), t);
    const i12 = cDiv(r, t);
    const i21 = cDiv(r, t);
    const i22 = cDiv(complex(1, 0), t);

    [m11, m12, m21, m22] = multiply2x2(m11, m12, m21, m22, i11, i12, i21, i22);

    const beta = cScale(stackIndices[layer + 1], (2 * Math.PI * thicknesses[layer]) / wavelengthNm);
    const p11 = cExp(complex(-beta.im, beta.re));
    const p22 = cExp(complex(beta.im, -beta.re));
    m11 = cMul(m11, p11);
    m12 = cMul(m12, p22);
    m21 = cMul(m21, p11);
    m22 = cMul(m22, p22);
  }

  const nLeft = stackIndices[stackIndices.length - 2];
  const nRight = stackIndices[stackIndices.length - 1];
  const r = cDiv(cSub(nLeft, nRight), cAdd(nLeft, nRight));
  const t = cDiv(cScale(nLeft, 2), cAdd(nLeft, nRight));
  const i11 = cDiv(complex(1, 0), t);
  const i12 = cDiv(r, t);
  const i21 = cDiv(r, t);
  const i22 = cDiv(complex(1, 0), t);
  [m11, m12, m21, m22] = multiply2x2(m11, m12, m21, m22, i11, i12, i21, i22);

  const rTotal = cDiv(m21, m11);
  const tTotal = cDiv(complex(1, 0), m11);
  const R = clamp01(cAbs2(rTotal));
  const T = clamp01(nRight.re * cAbs2(tTotal));
  const A = clamp01(1 - R - T);

  return { R, T, A };
}

function meanAt(values: number[], indices: number[]) {
  let sum = 0;
  for (const idx of indices) sum += values[idx];
  return indices.length ? sum / indices.length : 0;
}

function indexRange(grid: number[], lo: number, hi: number) {
  const indices: number[] = [];
  for (let idx = 0; idx < grid.length; idx++) {
    if (grid[idx] >= lo && grid[idx] <= hi) indices.push(idx);
  }
  return indices;
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function complex(re: number, im: number): Complex {
  return { re, im };
}

function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

function cSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

function cMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function cDiv(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im || 1e-12;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

function cScale(a: Complex, scalar: number): Complex {
  return { re: a.re * scalar, im: a.im * scalar };
}

function cAbs2(a: Complex) {
  return a.re * a.re + a.im * a.im;
}

function cExp(a: Complex): Complex {
  const mag = Math.exp(a.re);
  return { re: mag * Math.cos(a.im), im: mag * Math.sin(a.im) };
}

function multiply2x2(
  a11: Complex,
  a12: Complex,
  a21: Complex,
  a22: Complex,
  b11: Complex,
  b12: Complex,
  b21: Complex,
  b22: Complex
): [Complex, Complex, Complex, Complex] {
  return [
    cAdd(cMul(a11, b11), cMul(a12, b21)),
    cAdd(cMul(a11, b12), cMul(a12, b22)),
    cAdd(cMul(a21, b11), cMul(a22, b21)),
    cAdd(cMul(a21, b12), cMul(a22, b22)),
  ];
}
