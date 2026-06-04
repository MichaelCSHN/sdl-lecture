/**
 * LED 通道库 — 遥感定标光源案例用。
 *
 * 课程教学与方案演示用 LED 库，不是采购级器件数据库。
 * 窄带 LED 光谱基于 Gaussian 模型；伪荧光 (PC) 通道为 pump+emission 双峰课程级近似。
 *
 * V2 重构原则：
 * - 窄带 12 个锚点均匀覆盖 400–1000 nm，去除过密重复通道
 * - 宽带 6 个 PC 通道功能正交（不同 pump + 不同桥接区间），去除重叠
 * - 总 18 通道，形成"窄带锚点 + 宽带桥接"结构
 */

import { WAVELENGTH_GRID } from './targetSpectra';

// ============================================================
// Types
// ============================================================

export interface LedChannel {
  id: string; name: string; family: string;
  peak_nm: number; fwhm_nm: number;
  wavelength_nm: number[]; spd: number[];
  price: number; lifetime_hours: number; power_max_w: number;
  isPhosphor?: boolean;
  conversionEfficiency?: number; pumpLeakage?: number;
  emissionPeak?: number; emissionFwhm?: number;
}

// ============================================================
// Gaussian SPD
// ============================================================

function gaussianSpd(peak: number, fwhm: number): number[] {
  const sigma = fwhm / (2 * Math.sqrt(2 * Math.log(2)));
  return WAVELENGTH_GRID.map((w) => Math.exp(-0.5 * ((w - peak) / sigma) ** 2));
}

// ============================================================
// Phosphor SPD
// ============================================================

function phosphorSpd(
  pumpPeak: number, pumpFwhm: number,
  emissionPeak: number, emissionFwhm: number,
  efficiency: number, leakage: number,
): number[] {
  const sigmaP = pumpFwhm / (2 * Math.sqrt(2 * Math.log(2)));
  const sigmaE = emissionFwhm / (2 * Math.sqrt(2 * Math.log(2)));
  return WAVELENGTH_GRID.map((w) => {
    const pump = Math.exp(-0.5 * ((w - pumpPeak) / sigmaP) ** 2);
    const em = Math.exp(-0.5 * ((w - emissionPeak) / sigmaE) ** 2);
    return leakage * pump + efficiency * em;
  });
}

// ============================================================
// Narrow-band LED anchors (12 channels, 400–1000 nm)
// ============================================================

const NARROW_LEDS: LedChannel[] = [
  { id: 'led-405', name: '405 nm Violet', family: 'Violet/Blue', peak_nm: 405, fwhm_nm: 15, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(405, 15), price: 3.5, lifetime_hours: 50000, power_max_w: 0.5 },
  { id: 'led-450', name: '450 nm Royal Blue', family: 'Blue', peak_nm: 450, fwhm_nm: 18, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(450, 18), price: 3.0, lifetime_hours: 50000, power_max_w: 1.0 },
  { id: 'led-470', name: '470 nm Blue', family: 'Blue', peak_nm: 470, fwhm_nm: 20, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(470, 20), price: 2.5, lifetime_hours: 50000, power_max_w: 1.0 },
  { id: 'led-525', name: '525 nm Green', family: 'Green', peak_nm: 525, fwhm_nm: 30, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(525, 30), price: 3.0, lifetime_hours: 40000, power_max_w: 1.0 },
  { id: 'led-560', name: '560 nm Lime', family: 'Green/Yellow', peak_nm: 560, fwhm_nm: 28, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(560, 28), price: 3.5, lifetime_hours: 40000, power_max_w: 0.8 },
  { id: 'led-590', name: '590 nm Amber', family: 'Yellow', peak_nm: 590, fwhm_nm: 22, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(590, 22), price: 3.0, lifetime_hours: 40000, power_max_w: 1.0 },
  { id: 'led-625', name: '625 nm Red', family: 'Red', peak_nm: 625, fwhm_nm: 18, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(625, 18), price: 2.5, lifetime_hours: 50000, power_max_w: 1.0 },
  { id: 'led-680', name: '680 nm Deep Red', family: 'Red', peak_nm: 680, fwhm_nm: 20, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(680, 20), price: 3.0, lifetime_hours: 50000, power_max_w: 1.5 },
  { id: 'led-730', name: '730 nm Far Red', family: 'NIR', peak_nm: 730, fwhm_nm: 25, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(730, 25), price: 5.0, lifetime_hours: 30000, power_max_w: 0.5 },
  { id: 'led-810', name: '810 nm NIR', family: 'NIR', peak_nm: 810, fwhm_nm: 30, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(810, 30), price: 6.0, lifetime_hours: 25000, power_max_w: 0.5 },
  { id: 'led-880', name: '880 nm NIR', family: 'NIR', peak_nm: 880, fwhm_nm: 40, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(880, 40), price: 7.0, lifetime_hours: 20000, power_max_w: 0.3 },
  { id: 'led-970', name: '970 nm NIR', family: 'NIR', peak_nm: 970, fwhm_nm: 50, wavelength_nm: WAVELENGTH_GRID, spd: gaussianSpd(970, 50), price: 10.0, lifetime_hours: 15000, power_max_w: 0.2 },
];

// ============================================================
// Synthetic PC channels (6, functionally orthogonal)
// ============================================================

const PHOSPHOR_CHANNELS: LedChannel[] = [
  // 1. Violet→Green: 填充 500–600 nm 宽谱，服务植被绿峰 + 通用可见
  {
    id: 'pc-430-540', name: 'PC 430→540 nm (Violet→Green)', family: 'Phosphor',
    peak_nm: 430, fwhm_nm: 20,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(430, 20, 540, 100, 0.72, 0.06),
    price: 9.0, lifetime_hours: 20000, power_max_w: 0.8,
    isPhosphor: true, conversionEfficiency: 0.72, pumpLeakage: 0.06,
    emissionPeak: 540, emissionFwhm: 100,
  },
  // 2. Blue→Orange-Red: 填充 550–700 nm 过渡区，服务植被红边 + 土壤可见段
  {
    id: 'pc-450-610', name: 'PC 450→610 nm (Blue→Orange-Red)', family: 'Phosphor',
    peak_nm: 450, fwhm_nm: 18,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(450, 18, 610, 100, 0.70, 0.06),
    price: 10.0, lifetime_hours: 20000, power_max_w: 0.8,
    isPhosphor: true, conversionEfficiency: 0.70, pumpLeakage: 0.06,
    emissionPeak: 610, emissionFwhm: 100,
  },
  // 3. Blue→Far Red: 桥接 680–750 nm 红边，主要服务植被
  {
    id: 'pc-470-720', name: 'PC 470→720 nm (Blue→Far Red)', family: 'Phosphor',
    peak_nm: 470, fwhm_nm: 20,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(470, 20, 720, 110, 0.60, 0.08),
    price: 12.0, lifetime_hours: 18000, power_max_w: 0.6,
    isPhosphor: true, conversionEfficiency: 0.60, pumpLeakage: 0.08,
    emissionPeak: 720, emissionFwhm: 110,
  },
  // 4. Blue→NIR: 填充 780–900 nm，服务高 NIR 反射目标（植被平台、土壤）
  {
    id: 'pc-470-840', name: 'PC 470→840 nm (Blue→NIR 840)', family: 'Phosphor',
    peak_nm: 470, fwhm_nm: 20,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(470, 20, 840, 130, 0.50, 0.10),
    price: 15.0, lifetime_hours: 12000, power_max_w: 0.4,
    isPhosphor: true, conversionEfficiency: 0.50, pumpLeakage: 0.10,
    emissionPeak: 840, emissionFwhm: 130,
  },
  // 5. Green→Deep NIR: 从绿泵补 850–950 nm，减少蓝泵集中，服务深层 NIR
  {
    id: 'pc-520-900', name: 'PC 520→900 nm (Green→Deep NIR)', family: 'Phosphor',
    peak_nm: 520, fwhm_nm: 30,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(520, 30, 900, 140, 0.45, 0.12),
    price: 17.0, lifetime_hours: 10000, power_max_w: 0.3,
    isPhosphor: true, conversionEfficiency: 0.45, pumpLeakage: 0.12,
    emissionPeak: 900, emissionFwhm: 140,
  },
  // 6. Amber→Deep NIR: 从 590nm 泵补 900–1000 nm，服务远 NIR 暗目标和水体
  {
    id: 'pc-590-950', name: 'PC 590→950 nm (Amber→Deep NIR)', family: 'Phosphor',
    peak_nm: 590, fwhm_nm: 22,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(590, 22, 950, 150, 0.40, 0.12),
    price: 19.0, lifetime_hours: 9000, power_max_w: 0.25,
    isPhosphor: true, conversionEfficiency: 0.40, pumpLeakage: 0.12,
    emissionPeak: 950, emissionFwhm: 150,
  },
];

// ============================================================
// Full library
// ============================================================

export const FULL_LED_LIBRARY: LedChannel[] = [...NARROW_LEDS, ...PHOSPHOR_CHANNELS];

// ============================================================
// Disclaimers
// ============================================================

export const LED_DISCLAIMER =
  '课程教学与方案演示用 LED 库（12 窄带锚点 + 6 功能正交 PC 宽带桥接通道，共 18 通道）。' +
  '窄带 LED 光谱基于 Gaussian 模型。PC 通道为 pump+emission 双峰课程级近似。' +
  '价格与寿命为典型参考值。不是采购级器件数据库。';

export const PHOSPHOR_DISCLAIMER =
  'Synthetic phosphor-converted (PC) 通道为教学级 emulator。' +
  '采用 pump+emission 双 Gaussian 近似，不基于真实荧光粉传输模型。' +
  '6 个 PC 通道功能正交（不同 pump + 不同桥接区间），去除 V1 的重叠设计。';
