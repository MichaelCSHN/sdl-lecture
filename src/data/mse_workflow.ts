export interface WorkflowStep {
  id: string;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  methods: { name: string; nameEn: string; desc: string; automated: boolean }[];
  dataTypes: string[];
}

export const mseWorkflow: WorkflowStep[] = [
  {
    id: 'synthesis',
    label: '合成',
    labelEn: 'Synthesis',
    description: '通过化学反应制备原始材料',
    descriptionEn: 'Preparing raw materials through chemical reactions',
    methods: [
      { name: '固相反应', nameEn: 'Solid-state', desc: '高温下固体直接反应', automated: true },
      { name: '溶胶-凝胶', nameEn: 'Sol-gel', desc: '溶液化学途径制备氧化物', automated: true },
      { name: '溶剂热', nameEn: 'Solvothermal', desc: '高压下溶剂中的结晶', automated: true },
      { name: 'CVD', nameEn: 'CVD', desc: '化学气相沉积制备薄膜', automated: true },
      { name: 'PVD', nameEn: 'PVD', desc: '物理气相沉积', automated: true },
      { name: '熔融法', nameEn: 'Melt synthesis', desc: '高温熔融后冷却', automated: false },
    ],
    dataTypes: ['温度曲线', '反应时间', '前驱体配比', '气氛参数'],
  },
  {
    id: 'preparation',
    label: '制备',
    labelEn: 'Preparation',
    description: '将合成产物加工为可测试的样品形态',
    descriptionEn: 'Processing synthesized products into testable sample forms',
    methods: [
      { name: '压片', nameEn: 'Pelletizing', desc: '粉末压制成型', automated: true },
      { name: '镀膜', nameEn: 'Thin film', desc: '在基底上制备薄膜', automated: true },
      { name: '抛光', nameEn: 'Polishing', desc: '表面处理', automated: false },
      { name: '切片', nameEn: 'Sectioning', desc: '块体材料切割', automated: false },
    ],
    dataTypes: ['尺寸参数', '表面粗糙度', '厚度'],
  },
  {
    id: 'characterization',
    label: '表征',
    labelEn: 'Characterization',
    description: '分析材料的结构、成分和形貌',
    descriptionEn: 'Analyzing structure, composition, and morphology',
    methods: [
      { name: 'XRD', nameEn: 'XRD', desc: '晶体结构分析', automated: true },
      { name: 'SEM', nameEn: 'SEM', desc: '表面形貌成像', automated: true },
      { name: 'TEM', nameEn: 'TEM', desc: '微观结构分析', automated: false },
      { name: 'AFM', nameEn: 'AFM', desc: '纳米级表面形貌', automated: false },
      { name: 'XPS', nameEn: 'XPS', desc: '表面化学成分', automated: true },
      { name: 'Raman', nameEn: 'Raman', desc: '分子振动模式', automated: true },
      { name: 'NMR', nameEn: 'NMR', desc: '局部原子环境', automated: false },
      { name: 'FTIR', nameEn: 'FTIR', desc: '化学键分析', automated: true },
    ],
    dataTypes: ['衍射图谱', '显微图像', '光谱数据', '元素组成'],
  },
  {
    id: 'testing',
    label: '测试',
    labelEn: 'Testing',
    description: '测量材料的各项性能指标',
    descriptionEn: 'Measuring material performance indicators',
    methods: [
      { name: '电学测试', nameEn: 'Electrical', desc: '电导率、介电性', automated: true },
      { name: '力学测试', nameEn: 'Mechanical', desc: '硬度、韧性、强度', automated: false },
      { name: '热学测试', nameEn: 'Thermal', desc: '热导率、热膨胀', automated: true },
      { name: '磁学测试', nameEn: 'Magnetic', desc: '磁化率、矫顽力', automated: true },
      { name: '光学测试', nameEn: 'Optical', desc: '吸收、发射光谱', automated: true },
    ],
    dataTypes: ['性能曲线', '数值指标', '温度依赖性'],
  },
  {
    id: 'processing',
    label: '加工',
    labelEn: 'Processing',
    description: '对材料进行后处理以改善性能',
    descriptionEn: 'Post-processing materials to improve properties',
    methods: [
      { name: '退火', nameEn: 'Annealing', desc: '加热后缓慢冷却', automated: true },
      { name: '淬火', nameEn: 'Quenching', desc: '快速冷却固定亚稳相', automated: true },
      { name: '回火', nameEn: 'Tempering', desc: '中温处理调节性能', automated: false },
      { name: '表面处理', nameEn: 'Surface treatment', desc: '离子注入、涂层', automated: false },
    ],
    dataTypes: ['处理温度', '时间参数', '冷却速率'],
  },
  {
    id: 'manufacturing',
    label: '制造',
    labelEn: 'Manufacturing',
    description: '将材料整合为最终产品或器件',
    descriptionEn: 'Integrating materials into final products or devices',
    methods: [
      { name: '3D打印', nameEn: '3D printing', desc: '增材制造', automated: true },
      { name: '光刻', nameEn: 'Lithography', desc: '微电子器件加工', automated: true },
      { name: '封装', nameEn: 'Packaging', desc: '器件封装保护', automated: false },
    ],
    dataTypes: ['工艺参数', '良率数据', '尺寸精度'],
  },
  {
    id: 'treatment',
    label: '处理',
    labelEn: 'Treatment',
    description: '最终性能调控与质量检验',
    descriptionEn: 'Final performance tuning and quality inspection',
    methods: [
      { name: '老化测试', nameEn: 'Aging test', desc: '长期稳定性评估', automated: true },
      { name: '环境测试', nameEn: 'Environmental', desc: '温湿度循环', automated: true },
      { name: '失效分析', nameEn: 'Failure analysis', desc: '失效模式诊断', automated: false },
    ],
    dataTypes: ['寿命曲线', '失效数据', '环境参数'],
  },
  {
    id: 'assembly',
    label: '装配',
    labelEn: 'Assembly',
    description: '系统集成与最终验证',
    descriptionEn: 'System integration and final validation',
    methods: [
      { name: '器件集成', nameEn: 'Device integration', desc: '多组件组装', automated: false },
      { name: '系统测试', nameEn: 'System test', desc: '整机性能验证', automated: true },
    ],
    dataTypes: ['系统性能', '接口参数', '兼容性数据'],
  },
];
