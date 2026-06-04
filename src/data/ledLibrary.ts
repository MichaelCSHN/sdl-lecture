/**
 * LED 通道库 — 遥感定标光源案例用。
 *
 * 这是课程教学与方案演示用 LED 库，不是采购级器件数据库。
 * 光谱基于 Gaussian 模型（峰位、FWHM），价格和寿命为典型参考值。
 *
 * 覆盖 400–1000 nm，18 个通道。
 */

import { WAVELENGTH_GRID } from './targetSpectra';

// ============================================================
// LED 通道类型
// ============================================================

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
}

// ============================================================
// Gaussian SPD 生成
// ============================================================

function gaussianSpd(peak: number, fwhm: number): number[] {
  const sigma = fwhm / (2 * Math.sqrt(2 * Math.log(2)));
  return WAVELENGTH_GRID.map((w) =>
    Math.exp(-0.5 * ((w - peak) / sigma) ** 2)
  );
}

// ============================================================
// LED 库
// ============================================================

export const LED_LIBRARY: LedChannel[] = [
  // ---- 蓝紫区 400–470 nm ----
  {
    id: 'led-405', name: '405 nm Violet', family: 'Violet/Blue',
    peak_nm: 405, fwhm_nm: 15, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(405, 15), price: 3.5, lifetime_hours: 50000, power_max_w: 0.5,
  },
  {
    id: 'led-420', name: '420 nm Violet-Blue', family: 'Violet/Blue',
    peak_nm: 420, fwhm_nm: 15, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(420, 15), price: 3.5, lifetime_hours: 50000, power_max_w: 0.5,
  },
  {
    id: 'led-450', name: '450 nm Royal Blue', family: 'Violet/Blue',
    peak_nm: 450, fwhm_nm: 18, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(450, 18), price: 3.0, lifetime_hours: 50000, power_max_w: 1.0,
  },
  {
    id: 'led-470', name: '470 nm Blue', family: 'Violet/Blue',
    peak_nm: 470, fwhm_nm: 20, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(470, 20), price: 2.5, lifetime_hours: 50000, power_max_w: 1.0,
  },

  // ---- 绿黄区 500–590 nm ----
  {
    id: 'led-505', name: '505 nm Cyan', family: 'Green/Yellow',
    peak_nm: 505, fwhm_nm: 25, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(505, 25), price: 4.0, lifetime_hours: 40000, power_max_w: 0.5,
  },
  {
    id: 'led-525', name: '525 nm Green', family: 'Green/Yellow',
    peak_nm: 525, fwhm_nm: 30, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(525, 30), price: 3.0, lifetime_hours: 40000, power_max_w: 1.0,
  },
  {
    id: 'led-560', name: '560 nm Lime', family: 'Green/Yellow',
    peak_nm: 560, fwhm_nm: 28, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(560, 28), price: 3.5, lifetime_hours: 40000, power_max_w: 0.8,
  },
  {
    id: 'led-590', name: '590 nm Amber', family: 'Green/Yellow',
    peak_nm: 590, fwhm_nm: 22, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(590, 22), price: 3.0, lifetime_hours: 40000, power_max_w: 1.0,
  },

  // ---- 红区 620–700 nm ----
  {
    id: 'led-625', name: '625 nm Red', family: 'Red',
    peak_nm: 625, fwhm_nm: 18, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(625, 18), price: 2.5, lifetime_hours: 50000, power_max_w: 1.0,
  },
  {
    id: 'led-660', name: '660 nm Deep Red', family: 'Red',
    peak_nm: 660, fwhm_nm: 20, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(660, 20), price: 3.0, lifetime_hours: 50000, power_max_w: 1.5,
  },
  {
    id: 'led-680', name: '680 nm Photo Red', family: 'Red',
    peak_nm: 680, fwhm_nm: 20, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(680, 20), price: 3.5, lifetime_hours: 40000, power_max_w: 0.8,
  },

  // ---- 远红/近红外 730–940 nm ----
  {
    id: 'led-730', name: '730 nm Far Red', family: 'NIR',
    peak_nm: 730, fwhm_nm: 25, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(730, 25), price: 5.0, lifetime_hours: 30000, power_max_w: 0.5,
  },
  {
    id: 'led-760', name: '760 nm NIR', family: 'NIR',
    peak_nm: 760, fwhm_nm: 25, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(760, 25), price: 5.5, lifetime_hours: 30000, power_max_w: 0.5,
  },
  {
    id: 'led-810', name: '810 nm NIR', family: 'NIR',
    peak_nm: 810, fwhm_nm: 30, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(810, 30), price: 6.0, lifetime_hours: 25000, power_max_w: 0.5,
  },
  {
    id: 'led-850', name: '850 nm NIR', family: 'NIR',
    peak_nm: 850, fwhm_nm: 35, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(850, 35), price: 6.5, lifetime_hours: 25000, power_max_w: 0.5,
  },
  {
    id: 'led-880', name: '880 nm NIR', family: 'NIR',
    peak_nm: 880, fwhm_nm: 40, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(880, 40), price: 7.0, lifetime_hours: 20000, power_max_w: 0.3,
  },
  {
    id: 'led-940', name: '940 nm NIR', family: 'NIR',
    peak_nm: 940, fwhm_nm: 45, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(940, 45), price: 8.0, lifetime_hours: 20000, power_max_w: 0.3,
  },

  // ---- 近红外扩展 970 nm ----
  {
    id: 'led-970', name: '970 nm NIR', family: 'NIR',
    peak_nm: 970, fwhm_nm: 50, wavelength_nm: WAVELENGTH_GRID,
    spd: gaussianSpd(970, 50), price: 10.0, lifetime_hours: 15000, power_max_w: 0.2,
  },
];

// ============================================================
// LED 数据口径说明（展示在 UI 中的固定文本）
// ============================================================

export const LED_DISCLAIMER =
  '课程教学与方案演示用 LED 库。光谱基于 Gaussian 模型（峰位+FWHM），' +
  '价格与寿命为典型参考值。不是采购级器件数据库。';
