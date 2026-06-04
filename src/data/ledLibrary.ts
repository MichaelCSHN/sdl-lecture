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
  /** 是否为伪荧光转换通道（教学级 emulator） */
  isPhosphor?: boolean;
  /** 荧光转换效率 (0-1)，仅 isPhosphor 通道有效 */
  conversionEfficiency?: number;
  /** 泵浦残余比例 (0-1)，仅 isPhosphor 通道有效 */
  pumpLeakage?: number;
  /** 宽带发射峰位 (nm)，仅 isPhosphor 通道有效 */
  emissionPeak?: number;
  /** 宽带发射 FWHM (nm)，仅 isPhosphor 通道有效 */
  emissionFwhm?: number;
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
// Synthetic phosphor-converted channels (教学级 emulator)
// ============================================================

/**
 * 伪荧光 LED SPD 模型:
 *   SPD(lambda) = pump_leakage * Gauss(pump_peak, pump_fwhm)
 *               + conversion_efficiency * Gauss(emission_peak, emission_fwhm)
 *
 * 这是课程级近似——不基于真实荧光粉传输模型。
 * pump 峰模拟窄带 LED 泵浦，emission 峰模拟荧光粉宽带发射。
 */
function phosphorSpd(
  pumpPeak: number, pumpFwhm: number,
  emissionPeak: number, emissionFwhm: number,
  efficiency: number, leakage: number,
): number[] {
  const sigmaPump = pumpFwhm / (2 * Math.sqrt(2 * Math.log(2)));
  const sigmaEm = emissionFwhm / (2 * Math.sqrt(2 * Math.log(2)));
  return WAVELENGTH_GRID.map((w) => {
    const pump = Math.exp(-0.5 * ((w - pumpPeak) / sigmaPump) ** 2);
    const em = Math.exp(-0.5 * ((w - emissionPeak) / sigmaEm) ** 2);
    return leakage * pump + efficiency * em;
  });
}

/** 合成伪荧光通道 */
const PHOSPHOR_CHANNELS: LedChannel[] = [
  {
    id: 'pc-450-560', name: 'PC 450→560 nm (Blue→Yellow)', family: 'Phosphor',
    peak_nm: 450, fwhm_nm: 18,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(450, 18, 560, 100, 0.75, 0.05),
    price: 8.0, lifetime_hours: 25000, power_max_w: 1.0,
    isPhosphor: true, conversionEfficiency: 0.75, pumpLeakage: 0.05,
    emissionPeak: 560, emissionFwhm: 100,
  },
  {
    id: 'pc-450-580', name: 'PC 450→580 nm (Blue→Amber)', family: 'Phosphor',
    peak_nm: 450, fwhm_nm: 18,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(450, 18, 580, 110, 0.72, 0.05),
    price: 8.5, lifetime_hours: 22000, power_max_w: 1.0,
    isPhosphor: true, conversionEfficiency: 0.72, pumpLeakage: 0.05,
    emissionPeak: 580, emissionFwhm: 110,
  },
  {
    id: 'pc-420-540', name: 'PC 420→540 nm (Violet→Green)', family: 'Phosphor',
    peak_nm: 420, fwhm_nm: 15,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(420, 15, 540, 95, 0.70, 0.06),
    price: 9.0, lifetime_hours: 20000, power_max_w: 0.8,
    isPhosphor: true, conversionEfficiency: 0.70, pumpLeakage: 0.06,
    emissionPeak: 540, emissionFwhm: 95,
  },
  {
    id: 'pc-450-650', name: 'PC 450→650 nm (Blue→Deep Red)', family: 'Phosphor',
    peak_nm: 450, fwhm_nm: 18,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(450, 18, 650, 90, 0.65, 0.08),
    price: 10.0, lifetime_hours: 18000, power_max_w: 0.7,
    isPhosphor: true, conversionEfficiency: 0.65, pumpLeakage: 0.08,
    emissionPeak: 650, emissionFwhm: 90,
  },
  {
    id: 'pc-470-750', name: 'PC 470→750 nm (Blue→NIR)', family: 'Phosphor',
    peak_nm: 470, fwhm_nm: 20,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(470, 20, 750, 130, 0.55, 0.10),
    price: 15.0, lifetime_hours: 12000, power_max_w: 0.4,
    isPhosphor: true, conversionEfficiency: 0.55, pumpLeakage: 0.10,
    emissionPeak: 750, emissionFwhm: 130,
  },
  {
    id: 'pc-470-850', name: 'PC 470→850 nm (Blue→Deep NIR)', family: 'Phosphor',
    peak_nm: 470, fwhm_nm: 20,
    wavelength_nm: WAVELENGTH_GRID,
    spd: phosphorSpd(470, 20, 850, 150, 0.45, 0.12),
    price: 18.0, lifetime_hours: 10000, power_max_w: 0.3,
    isPhosphor: true, conversionEfficiency: 0.45, pumpLeakage: 0.12,
    emissionPeak: 850, emissionFwhm: 150,
  },
];

export const FULL_LED_LIBRARY: LedChannel[] = [...LED_LIBRARY, ...PHOSPHOR_CHANNELS];

// ============================================================
// LED 数据口径说明（展示在 UI 中的固定文本）
// ============================================================

export const LED_DISCLAIMER =
  '课程教学与方案演示用 LED 库。窄带 LED 光谱基于 Gaussian 模型（峰位+FWHM），' +
  '伪荧光 (PC) 通道为 pump+emission 双峰课程级近似。' +
  '价格与寿命为典型参考值。不是采购级器件数据库。';

export const PHOSPHOR_DISCLAIMER =
  'Synthetic phosphor-converted (PC) 通道为教学级 emulator。' +
  '采用双 Gaussian（pump + emission）近似，不基于真实荧光粉传输模型。' +
  'pump leakage 与 conversion efficiency 为教学参考值。';
