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

const SYNTHETIC_CHANNEL_SPECS = [
  { id: 'syn-430', peak_nm: 430, fwhm_nm: 70, price: 8.5, lifetime_hours: 24000, power_max_w: 0.75, sourcePumpNm: 405, note: '补足 400–460 nm，并与 405/450/470 nm 窄带通道形成重叠。' },
  { id: 'syn-480', peak_nm: 480, fwhm_nm: 75, price: 8.8, lifetime_hours: 23500, power_max_w: 0.75, sourcePumpNm: 430, note: '补足蓝青过渡区，增强 450–530 nm 的连续覆盖。' },
  { id: 'syn-530', peak_nm: 530, fwhm_nm: 80, price: 9.2, lifetime_hours: 23000, power_max_w: 0.75, sourcePumpNm: 450, note: '增强绿光主峰附近覆盖，减少 500–560 nm 的稀疏感。' },
  { id: 'syn-580', peak_nm: 580, fwhm_nm: 90, price: 9.8, lifetime_hours: 22000, power_max_w: 0.72, sourcePumpNm: 470, note: '桥接黄绿到琥珀区间，增强 540–630 nm 的重叠度。' },
  { id: 'syn-630', peak_nm: 630, fwhm_nm: 95, price: 10.5, lifetime_hours: 21000, power_max_w: 0.68, sourcePumpNm: 470, note: '增强红光覆盖，降低 590/625/680 nm 之间的间隙感。' },
  { id: 'syn-690', peak_nm: 690, fwhm_nm: 105, price: 11.3, lifetime_hours: 19500, power_max_w: 0.62, sourcePumpNm: 505, note: '补足红边区和深红区，为 650–740 nm 提供更连续桥接。' },
  { id: 'syn-750', peak_nm: 750, fwhm_nm: 115, price: 12.2, lifetime_hours: 18000, power_max_w: 0.56, sourcePumpNm: 530, note: '增强 710–810 nm 的宽谱覆盖，连接红边与近红外平台。' },
  { id: 'syn-820', peak_nm: 820, fwhm_nm: 125, price: 13.6, lifetime_hours: 16000, power_max_w: 0.48, sourcePumpNm: 560, note: '增强植被近红外平台覆盖，抬高 780–870 nm 的重叠度。' },
  { id: 'syn-890', peak_nm: 890, fwhm_nm: 130, price: 15.0, lifetime_hours: 13500, power_max_w: 0.38, sourcePumpNm: 590, note: '补足 850–940 nm，减少近红外尾段的局部稀疏。' },
  { id: 'syn-960', peak_nm: 960, fwhm_nm: 110, price: 17.0, lifetime_hours: 11000, power_max_w: 0.28, sourcePumpNm: 620, note: '补足 920–1000 nm 长波尾段，使全库覆盖延伸到 1000 nm。' },
] as const;

const SYNTHETIC_BROAD_CHANNELS: LedChannel[] = SYNTHETIC_CHANNEL_SPECS.map((spec) => ({
  id: spec.id,
  name: `${spec.peak_nm} nm 合成宽谱 LED`,
  family: '合成宽谱 LED',
  peak_nm: spec.peak_nm,
  fwhm_nm: spec.fwhm_nm,
  wavelength_nm: WAVELENGTH_GRID,
  spd: broadenedSyntheticSpd(spec.peak_nm, spec.fwhm_nm),
  price: spec.price,
  lifetime_hours: spec.lifetime_hours,
  power_max_w: spec.power_max_w,
  isSynthetic: true,
  sourcePumpNm: spec.sourcePumpNm,
  note: spec.note,
}));

export const FULL_LED_LIBRARY: LedChannel[] = [...NARROW_LED_CHANNELS, ...SYNTHETIC_BROAD_CHANNELS]
  .sort((a, b) => a.peak_nm - b.peak_nm);

export const LED_DISCLAIMER =
  '当前 LED 库用于课程级遥感定标光源设计演示，不是采购级器件数据库。窄带通道采用高斯近似；价格、寿命、最大功率为教学级典型值。';

export const PHOSPHOR_DISCLAIMER =
  '“合成宽谱 LED”用于模拟荧光转换或宽谱封装带来的展宽效果。当前版本把它们排成覆盖 400–1000 nm 的单峰宽谱阵列，并保证相邻通道具有足够重叠。';
