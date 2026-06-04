/**
 * 文献启发教学光谱库 — 遥感地面定标案例用。
 *
 * 注意：这些光谱是基于已发表遥感文献中典型反射率特征手工构建的
 * 教学用代表性曲线。它们不是 ECOSTRESS/USGS/ASTER 光谱库的原始下载样本。
 *
 * 每条曲线保留了文献来源标注，用于说明谱形特征的依据。
 * 光谱形状（如植被红边、叶绿素吸收带、土壤单调上升等）基于多篇文献
 * 交叉验证，但逐 nm 数值不代表原始库数据。
 *
 * 所有数据重采样到 400–1000 nm，步长 5 nm（共 121 个波长点）。
 *
 * 如需原始光谱库数据用于研究，请直接访问：
 * - ECOSTRESS: https://speclib.jpl.nasa.gov/
 * - USGS: https://crustal.usgs.gov/speclab/
 * - ASTER: https://speclib.jpl.nasa.gov/
 */

// ============================================================
// 公共波长网格
// ============================================================

export const WAVELENGTH_GRID: number[] = [];
for (let w = 400; w <= 1000; w += 5) WAVELENGTH_GRID.push(w);
export const N_WAVELENGTHS = WAVELENGTH_GRID.length; // 121

// ============================================================
// 目标光谱类型
// ============================================================

export interface TargetSpectrum {
  id: string;
  name: string;
  category: 'vegetation' | 'soil' | 'rock' | 'manmade' | 'water' | 'calibration';
  /** 反射率 (0–1)，长度 = N_WAVELENGTHS */
  reflectance: number[];
  source: string;
  description: string;
  lectureNote: string;
  /** 遥感定标教学中的用途 */
  teachingUse: string;
}

// ============================================================
// 光谱数据
// ============================================================

/**
 * Helper: 构造一条线性插值光谱。
 * @param points [wavelength_nm, reflectance] 关键点数组
 */
function buildSpectrum(points: [number, number][]): number[] {
  const result: number[] = [];
  let pi = 0;
  for (const w of WAVELENGTH_GRID) {
    while (pi < points.length - 2 && points[pi + 1][0] < w) pi++;
    if (pi >= points.length - 1) {
      result.push(points[points.length - 1][1]);
    } else {
      const [w1, r1] = points[pi];
      const [w2, r2] = points[pi + 1];
      const t = w1 === w2 ? 0 : (w - w1) / (w2 - w1);
      result.push(r1 + t * (r2 - r1));
    }
  }
  return result;
}

export const TARGET_SPECTRA: TargetSpectrum[] = [
  // ---- 植被 ----
  {
    id: 'green-veg',
    name: '健康绿色植被 (Broadleaf)',
    category: 'vegetation',
    reflectance: buildSpectrum([
      [400, 0.03], [450, 0.02], [500, 0.06], [550, 0.12],  // 绿峰
      [600, 0.08], [650, 0.04], [670, 0.03],                // 叶绿素红吸收
      [700, 0.25], [720, 0.40], [750, 0.48],                 // 红边
      [800, 0.50], [900, 0.52], [1000, 0.48],
    ]),
    source:
      '基于经典植被反射率曲线。参考: Gates et al. (1965) Appl. Opt. 4(1):11-20; ' +
      'Knipling (1970) Remote Sens. Environ. 1(3):155-159; ' +
      'Jensen "Remote Sensing of the Environment" (Pearson, 2007) Fig. 5-6.',
    description: '典型阔叶植被反射率光谱。可见光区叶绿素吸收明显（蓝、红波段低反射），' +
      '绿峰约 550 nm，红边约 700–720 nm 处急剧上升，近红外高反射平台。',
    lectureNote: '适合讲红边（red edge）概念、植被指数（NDVI）的物理基础、' +
      '以及为什么遥感中 NIR 波段对植被监测至关重要。',
    teachingUse: '讲解植被反射特征与叶绿素吸收、红边位置、NIR 平台的关系。',
  },
  {
    id: 'dry-grass',
    name: '干枯植被 (Senescent Grass)',
    category: 'vegetation',
    reflectance: buildSpectrum([
      [400, 0.08], [500, 0.12], [600, 0.18], [700, 0.25],
      [750, 0.32], [800, 0.35], [900, 0.38], [1000, 0.36],
    ]),
    source:
      '基于非光合植被（NPV）反射特征。参考: Asner (1998) Remote Sens. Environ. ' +
      '64(3):234-253; Daughtry et al. (2004) Remote Sens. Environ. 93(1-2):198-210.',
    description: '衰老/干枯草被反射率。无叶绿素吸收特征，无红边，反射率从可见到近红外平缓上升。',
    lectureNote: '适合对比"绿色植被 vs 干枯植被"展示红边的有无如何区分植被状态。' +
      '也适合讲非光合植被（NPV）在遥感燃料评估中的应用。',
    teachingUse: '对比健康植被与衰老植被的反射差异，讲解红边检测原理。',
  },

  // ---- 土壤 ----
  {
    id: 'sandy-loam',
    name: '砂壤土 (Sandy Loam)',
    category: 'soil',
    reflectance: buildSpectrum([
      [400, 0.08], [500, 0.12], [600, 0.18], [700, 0.24],
      [800, 0.30], [900, 0.34], [1000, 0.36],
    ]),
    source:
      '基于典型土壤反射率曲线。参考: Stoner & Baumgardner (1981) ' +
      'Soil Sci. Soc. Am. J. 45(6):1161-1165; ' +
      'Ben-Dor et al. (1999) "Soil Reflectance" in Remote Sensing of Earth Sciences (Wiley).',
    description: '砂壤土反射率随波长单调上升。无植被吸收特征。受有机质含量、水分和铁氧化物影响。',
    lectureNote: '适合展示土壤反射率的"单调递增"特征与植被的"吸收+红边"之间的根本区别。' +
      '也可用于讲解土壤有机质和水分对反射率的影响。',
    teachingUse: '展示土壤背景对植被提取的影响，讲解光谱解混概念。',
  },

  // ---- 岩石 ----
  {
    id: 'granite',
    name: '花岗岩 (Granite)',
    category: 'rock',
    reflectance: buildSpectrum([
      [400, 0.15], [500, 0.20], [600, 0.25], [700, 0.28],
      [800, 0.30], [900, 0.30], [1000, 0.29],
    ]),
    source:
      '基于典型花岗岩反射光谱。参考: Hunt & Salisbury (1970) ' +
      'Mod. Geol. 1:283-300; Clark et al. (1993) "USGS Digital Spectral Library".',
    description: '花岗岩在 VNIR 波段反射率中等偏高，随波长缓慢上升后在 800+ nm 趋于平坦。' +
      '铁氧化物在 500–900 nm 有宽吸收特征。',
    lectureNote: '适合讲岩石/矿物在 VNIR 的宽吸收特征，以及为何区分不同岩性需要 SWIR 波段。',
    teachingUse: '讲解地物分类中岩石 vs 植被 vs 土壤的光谱区分方法。',
  },

  // ---- 人造地物 ----
  {
    id: 'asphalt',
    name: '沥青路面 (Asphalt)',
    category: 'manmade',
    reflectance: buildSpectrum([
      [400, 0.04], [500, 0.05], [600, 0.06], [700, 0.07],
      [800, 0.08], [900, 0.09], [1000, 0.10],
    ]),
    source:
      '基于典型城市材料光谱。参考: Herold et al. (2004) Remote Sens. Environ. ' +
      '93(3):304-318; Heiden et al. (2007) Remote Sens. Environ. 106(3):285-305.',
    description: '沥青在 VNIR 反射率极低（~4–10%），随波长缓慢上升。是城市遥感中的典型暗目标。',
    lectureNote: '适合讲"暗目标"概念，展示为什么某些地物在遥感图像中呈暗色。' +
      '可用于对比"亮目标（混凝土）vs 暗目标（沥青）"的定标需求和不同 SNR 要求。',
    teachingUse: '讲解暗目标在遥感定标中的作用，以及低反射率目标对 SNR 的挑战。',
  },
  {
    id: 'concrete',
    name: '混凝土 (Concrete)',
    category: 'manmade',
    reflectance: buildSpectrum([
      [400, 0.20], [500, 0.22], [600, 0.24], [700, 0.25],
      [800, 0.26], [900, 0.26], [1000, 0.25],
    ]),
    source:
      '基于典型城市材料光谱。参考: Herold et al. (2004); ' +
      'Heiden et al. (2007), 同上。',
    description: '混凝土在 VNIR 反射率中等（~20–26%），光谱平坦。是城市遥感中的典型亮目标。',
    lectureNote: '适合对比"亮目标 vs 暗目标"的定标差异。平坦光谱对定标光源的波段覆盖均匀性要求较高。',
    teachingUse: '展示城市遥感中的典型端元，讲解光谱解混和亚像元分析。',
  },

  // ---- 水体 ----
  {
    id: 'clear-water',
    name: '清水体 (Clear Water)',
    category: 'water',
    reflectance: buildSpectrum([
      [400, 0.06], [500, 0.04], [600, 0.02], [700, 0.01],
      [750, 0.005], [800, 0.003], [850, 0.001], [900, 0.0], [1000, 0.0],
    ]),
    source:
      '基于经典水体反射率。参考: Mobley (1994) "Light and Water" (Academic Press); ' +
      'Pope & Fry (1997) Appl. Opt. 36(33):8710-8723.',
    description: '清水在可见光蓝-绿波段有一定反射，随波长增加急剧衰减。' +
      '近红外波段（>750 nm）几乎完全吸收。',
    lectureNote: '适合讲水体在遥感中的独特光谱特征：NIR 全吸收。' +
      '这是水体提取（如 NDWI）的物理基础。也适合讨论"极低反射率目标的定标精度"。',
    teachingUse: '讲解水体提取的物理基础，以及极低反射率目标对定标光源的挑战。',
  },

  // ---- 校准目标 ----
  {
    id: 'white-panel',
    name: '白板/校准靶 (Spectralon-like)',
    category: 'calibration',
    reflectance: Array(N_WAVELENGTHS).fill(0.98),
    source:
      '基于 Labsphere Spectralon 典型反射率规格。参考: ' +
      'Labsphere Spectralon reflectance targets datasheet; ' +
      'Bruegge et al. (1993) "Reflectance stability analysis of Spectralon".',
    description: '近理想朗伯反射体。400–1000 nm 反射率接近 0.98–0.99，基本平坦。',
    lectureNote: '作为"理想校准目标"的基准线。适合对比展示"为什么真实地物比 Spectralon 难匹配"。' +
      '也适合作为工程的"中性目标"，测试纯光谱合成能力。',
    teachingUse: '展示理想校准目标的特征，讲解反射率标准与定标精度要求。',
  },
];

// ============================================================
// 按类别分组
// ============================================================

export const CATEGORY_LABELS: Record<string, string> = {
  vegetation: '植被',
  soil: '土壤',
  rock: '岩石/地貌',
  manmade: '人造地物',
  water: '水体',
  calibration: '校准目标',
};

export function getSpectraByCategory(cat: string): TargetSpectrum[] {
  return TARGET_SPECTRA.filter((s) => s.category === cat);
}
