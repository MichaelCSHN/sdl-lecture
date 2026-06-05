import { WAVELENGTH_GRID } from './targetSpectra';

export interface LedChannel {
  id: string;
  name: string;
  family: string;
  peak_nm: number;
  fwhm_nm: number;
  wavelength_nm: number[];
  spd: number[];
  price: number;
  lifetime_hours: number;
  power_max_w: number;
  isSynthetic?: boolean;
  sourcePumpNm?: number;
  note?: string;
}

function gaussianSpd(peak: number, fwhm: number): number[] {
  const sigma = fwhm / (2 * Math.sqrt(2 * Math.log(2)));
  return WAVELENGTH_GRID.map((w) => Math.exp(-0.5 * ((w - peak) / sigma) ** 2));
}

function normalizeSpectrum(spd: number[]): number[] {
  const maxVal = Math.max(...spd) || 1;
  return spd.map((v) => v / maxVal);
}

function broadenedSyntheticSpd(peak: number, fwhm: number): number[] {
  return normalizeSpectrum(gaussianSpd(peak, fwhm));
}

const NARROW_LED_CHANNELS: LedChannel[] = [
  { id: 'led-405', name: '405 nm 紫光 LED', family: '窄带 LED', peak_nm: 405, fwhm_nm: 15, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(405, 15), price: 3.5, lifetime_hours: 50000, power_max_w: 0.5 },
  { id: 'led-450', name: '450 nm 皇家蓝 LED', family: '窄带 LED', peak_nm: 450, fwhm_nm: 18, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(450, 18), price: 3.0, lifetime_hours: 50000, power_max_w: 1.0 },
  { id: 'led-470', name: '470 nm 蓝光 LED', family: '窄带 LED', peak_nm: 470, fwhm_nm: 20, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(470, 20), price: 2.5, lifetime_hours: 50000, power_max_w: 1.0 },
  { id: 'led-525', name: '525 nm 绿光 LED', family: '窄带 LED', peak_nm: 525, fwhm_nm: 30, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(525, 30), price: 3.0, lifetime_hours: 40000, power_max_w: 1.0 },
  { id: 'led-560', name: '560 nm 黄绿 LED', family: '窄带 LED', peak_nm: 560, fwhm_nm: 28, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(560, 28), price: 3.5, lifetime_hours: 40000, power_max_w: 0.8 },
  { id: 'led-590', name: '590 nm 琥珀 LED', family: '窄带 LED', peak_nm: 590, fwhm_nm: 22, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(590, 22), price: 3.0, lifetime_hours: 40000, power_max_w: 1.0 },
  { id: 'led-625', name: '625 nm 红光 LED', family: '窄带 LED', peak_nm: 625, fwhm_nm: 18, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(625, 18), price: 2.5, lifetime_hours: 50000, power_max_w: 1.0 },
  { id: 'led-680', name: '680 nm 深红 LED', family: '窄带 LED', peak_nm: 680, fwhm_nm: 20, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(680, 20), price: 3.0, lifetime_hours: 50000, power_max_w: 1.2 },
  { id: 'led-730', name: '730 nm 远红 LED', family: '窄带 LED', peak_nm: 730, fwhm_nm: 25, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(730, 25), price: 5.0, lifetime_hours: 30000, power_max_w: 0.5 },
  { id: 'led-810', name: '810 nm 近红外 LED', family: '窄带 LED', peak_nm: 810, fwhm_nm: 30, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(810, 30), price: 6.0, lifetime_hours: 25000, power_max_w: 0.5 },
  { id: 'led-880', name: '880 nm 近红外 LED', family: '窄带 LED', peak_nm: 880, fwhm_nm: 40, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(880, 40), price: 7.0, lifetime_hours: 20000, power_max_w: 0.3 },
  { id: 'led-970', name: '970 nm 近红外 LED', family: '窄带 LED', peak_nm: 970, fwhm_nm: 50, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(970, 50), price: 10.0, lifetime_hours: 15000, power_max_w: 0.2 },
];

const SYNTHETIC_BROAD_CHANNELS: LedChannel[] = [
  {
    id: 'syn-540',
    name: '540 nm 宽谱合成 LED',
    family: '合成宽谱 LED',
    peak_nm: 540,
    fwhm_nm: 85,
    wavelength_nm: WAVELENGTH_GRID,
    spd: broadenedSyntheticSpd(540, 85),
    price: 9.0,
    lifetime_hours: 22000,
    power_max_w: 0.7,
    isSynthetic: true,
    sourcePumpNm: 430,
    note: '用于补足绿光和黄绿区域的宽谱覆盖。',
  },
  {
    id: 'syn-610',
    name: '610 nm 宽谱合成 LED',
    family: '合成宽谱 LED',
    peak_nm: 610,
    fwhm_nm: 105,
    wavelength_nm: WAVELENGTH_GRID,
    spd: broadenedSyntheticSpd(610, 105),
    price: 10.5,
    lifetime_hours: 20000,
    power_max_w: 0.7,
    isSynthetic: true,
    sourcePumpNm: 450,
    note: '用于补足黄橙红过渡区，降低可见段通道数。',
  },
  {
    id: 'syn-720',
    name: '720 nm 宽谱合成 LED',
    family: '合成宽谱 LED',
    peak_nm: 720,
    fwhm_nm: 115,
    wavelength_nm: WAVELENGTH_GRID,
    spd: broadenedSyntheticSpd(720, 115),
    price: 12.0,
    lifetime_hours: 18000,
    power_max_w: 0.6,
    isSynthetic: true,
    sourcePumpNm: 470,
    note: '重点补足植被红边和 680–780 nm 的桥接区域。',
  },
  {
    id: 'syn-820',
    name: '820 nm 宽谱合成 LED',
    family: '合成宽谱 LED',
    peak_nm: 820,
    fwhm_nm: 130,
    wavelength_nm: WAVELENGTH_GRID,
    spd: broadenedSyntheticSpd(820, 130),
    price: 14.0,
    lifetime_hours: 15000,
    power_max_w: 0.45,
    isSynthetic: true,
    sourcePumpNm: 470,
    note: '用于覆盖植被 NIR 平台和 760–880 nm 的宽谱空白。',
  },
  {
    id: 'syn-900',
    name: '900 nm 宽谱合成 LED',
    family: '合成宽谱 LED',
    peak_nm: 900,
    fwhm_nm: 140,
    wavelength_nm: WAVELENGTH_GRID,
    spd: broadenedSyntheticSpd(900, 140),
    price: 16.0,
    lifetime_hours: 12000,
    power_max_w: 0.35,
    isSynthetic: true,
    sourcePumpNm: 520,
    note: '用于增强 850–950 nm 深近红外拟合能力。',
  },
  {
    id: 'syn-960',
    name: '960 nm 宽谱合成 LED',
    family: '合成宽谱 LED',
    peak_nm: 960,
    fwhm_nm: 100,
    wavelength_nm: WAVELENGTH_GRID,
    spd: broadenedSyntheticSpd(960, 100),
    price: 18.0,
    lifetime_hours: 10000,
    power_max_w: 0.25,
    isSynthetic: true,
    sourcePumpNm: 590,
    note: '用于补足 930–1000 nm 长波尾部，对水体和暗目标更有帮助。',
  },
];

export const FULL_LED_LIBRARY: LedChannel[] = [...NARROW_LED_CHANNELS, ...SYNTHETIC_BROAD_CHANNELS];

export const LED_DISCLAIMER =
  '当前 LED 库用于课程级遥感定标光源设计演示，不是采购级器件数据库。窄带通道采用高斯近似；价格、寿命、最大功率为教学级典型值。';

export const PHOSPHOR_DISCLAIMER =
  '“合成宽谱 LED”用于模拟荧光转换或宽谱封装带来的展宽效果。V3 默认采用单峰宽谱近似，不再保留显式双峰泵浦泄漏形状。';
