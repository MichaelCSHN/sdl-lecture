export interface KGNode {
  id: string;
  label: string;
  labelEn: string;
  type: 'concept' | 'method' | 'person' | 'tool' | 'process' | 'theory';
  description: string;
  descriptionEn: string;
  wikiUrl?: string;
  wikiUrlEn?: string;
}

export interface KGEdge {
  source: string;
  target: string;
  relation: string;
  relationEn: string;
}

export const kgNodes: KGNode[] = [
  // Core SDL concepts
  { id: 'sdl', label: '自主实验室', labelEn: 'Self-driving Lab', type: 'concept', description: '集成AI决策、机器人执行和自动数据分析的闭环实验系统', descriptionEn: 'Closed-loop experimental system integrating AI decision-making, robotic execution, and automated data analysis' },
  { id: 'bo', label: '贝叶斯优化', labelEn: 'Bayesian Optimization', type: 'method', description: '通过概率代理模型指导实验方向的高效优化算法', descriptionEn: 'Efficient optimization algorithm using probabilistic surrogate models to guide experiments', wikiUrl: 'https://zh.wikipedia.org/wiki/贝叶斯优化', wikiUrlEn: 'https://en.wikipedia.org/wiki/Bayesian_optimization' },
  { id: 'gp', label: '高斯过程', labelEn: 'Gaussian Process', type: 'method', description: 'BO中最常用的概率代理模型，定义函数上的概率分布', descriptionEn: 'Probabilistic surrogate model commonly used in BO, defines a distribution over functions', wikiUrl: 'https://zh.wikipedia.org/wiki/高斯过程', wikiUrlEn: 'https://en.wikipedia.org/wiki/Gaussian_process' },
  { id: 'acq', label: '采集函数', labelEn: 'Acquisition Function', type: 'concept', description: '决定BO下一次实验采样位置的策略函数', descriptionEn: 'Strategy function that determines the next sampling location in BO' },
  { id: 'ht', label: '高通量实验', labelEn: 'High-throughput', type: 'concept', description: '同时并行处理大量实验样本的技术路线', descriptionEn: 'Technology approach that processes large numbers of experimental samples in parallel', wikiUrlEn: 'https://en.wikipedia.org/wiki/High-throughput_screening' },
  { id: 'dft', label: '密度泛函理论', labelEn: 'DFT', type: 'method', description: '计算材料电子结构的量子力学方法', descriptionEn: 'Quantum mechanical method for calculating electronic structure of materials', wikiUrl: 'https://zh.wikipedia.org/wiki/密度泛函理论', wikiUrlEn: 'https://en.wikipedia.org/wiki/Density_functional_theory' },
  { id: 'dmtal', label: 'DMTA-L闭环', labelEn: 'Design-Make-Test-Analyze-Learn', type: 'concept', description: 'SDL闭环的标准抽象：设计-合成-测试-分析-学习', descriptionEn: 'Standard abstraction of SDL closed loop' },
  { id: 'robo', label: '实验室自动化', labelEn: 'Lab Automation', type: 'concept', description: '使用机器人和自动化设备执行实验操作', descriptionEn: 'Using robots and automated equipment to perform experimental operations', wikiUrlEn: 'https://en.wikipedia.org/wiki/Laboratory_automation' },

  // Synthesis methods
  { id: 'synth', label: '材料合成', labelEn: 'Synthesis', type: 'process', description: '通过化学反应制备新材料的过程', descriptionEn: 'Process of preparing new materials through chemical reactions' },
  { id: 'cvd', label: '化学气相沉积', labelEn: 'CVD', type: 'method', description: '通过气相化学反应在基底上沉积薄膜', descriptionEn: 'Chemical Vapor Deposition: depositing thin films via gas-phase chemical reactions', wikiUrl: 'https://zh.wikipedia.org/wiki/化学气相沉积', wikiUrlEn: 'https://en.wikipedia.org/wiki/Chemical_vapor_deposition' },
  { id: 'pvd', label: '物理气相沉积', labelEn: 'PVD', type: 'method', description: '通过物理过程沉积薄膜材料', descriptionEn: 'Physical Vapor Deposition: depositing thin films through physical processes', wikiUrl: 'https://zh.wikipedia.org/wiki/物理气相沉积', wikiUrlEn: 'https://en.wikipedia.org/wiki/Physical_vapor_deposition' },
  { id: 'solid', label: '固相合成', labelEn: 'Solid-state Synthesis', type: 'method', description: '高温下固体原料直接反应制备材料', descriptionEn: 'Direct reaction of solid raw materials at high temperature' },
  { id: 'solvothermal', label: '溶剂热合成', labelEn: 'Solvothermal', type: 'method', description: '在密封高压釜中、溶剂存在下加热合成', descriptionEn: 'Synthesis in a sealed autoclave with solvent above boiling point under autogenous pressure' },

  // Characterization methods
  { id: 'chara', label: '材料表征', labelEn: 'Characterization', type: 'process', description: '分析材料的结构、成分和性质', descriptionEn: 'Analyzing the structure, composition, and properties of materials' },
  { id: 'xrd', label: 'X射线衍射', labelEn: 'XRD', type: 'method', description: '通过X射线衍射图案分析晶体结构', descriptionEn: 'Analyzing crystal structure through X-ray diffraction patterns', wikiUrl: 'https://zh.wikipedia.org/wiki/X射线衍射', wikiUrlEn: 'https://en.wikipedia.org/wiki/X-ray_crystallography' },
  { id: 'sem', label: '扫描电镜', labelEn: 'SEM', type: 'method', description: '利用聚焦电子束成像材料表面形貌', descriptionEn: 'Scanning Electron Microscopy: imaging material surface morphology with focused electron beam', wikiUrl: 'https://zh.wikipedia.org/wiki/扫描电子显微镜', wikiUrlEn: 'https://en.wikipedia.org/wiki/Scanning_electron_microscope' },
  { id: 'tem', label: '透射电镜', labelEn: 'TEM', type: 'method', description: '透射电子成像分析材料的微观结构', descriptionEn: 'Transmission Electron Microscopy: analyzing microstructure via transmitted electrons', wikiUrl: 'https://zh.wikipedia.org/wiki/透射电子显微镜', wikiUrlEn: 'https://en.wikipedia.org/wiki/Transmission_electron_microscopy' },
  { id: 'afm', label: '原子力显微镜', labelEn: 'AFM', type: 'method', description: '利用探针扫描材料表面获取纳米级形貌', descriptionEn: 'Atomic Force Microscopy: scanning probe technique for nanoscale surface imaging', wikiUrl: 'https://zh.wikipedia.org/wiki/原子力显微镜', wikiUrlEn: 'https://en.wikipedia.org/wiki/Atomic_force_microscopy' },
  { id: 'xps', label: 'X射线光电子能谱', labelEn: 'XPS', type: 'method', description: '分析材料表面元素组成和化学态', descriptionEn: 'X-ray Photoelectron Spectroscopy: analyzing surface elemental composition and chemical states' },
  { id: 'raman', label: '拉曼光谱', labelEn: 'Raman', type: 'method', description: '基于非弹性光散射分析分子振动模式', descriptionEn: 'Raman Spectroscopy: analyzing molecular vibrational modes based on inelastic light scattering' },

  // Testing
  { id: 'test', label: '性能测试', labelEn: 'Testing', type: 'process', description: '测量材料的力学、电学、热学等性能', descriptionEn: 'Measuring mechanical, electrical, thermal and other properties of materials' },

  // Processing
  { id: 'proc', label: '材料加工', labelEn: 'Processing', type: 'process', description: '对材料进行热处理、成型等加工工艺', descriptionEn: 'Heat treatment, forming and other processing of materials' },
  { id: 'annealing', label: '退火', labelEn: 'Annealing', type: 'method', description: '加热后缓慢冷却以消除应力和改善性能', descriptionEn: 'Heating and slow cooling to relieve stress and improve properties' },

  // Key persons
  { id: 'ceder', label: 'Gerbrand Ceder', labelEn: 'Gerbrand Ceder', type: 'person', description: 'UC Berkeley教授，A-Lab和Materials Project创始人', descriptionEn: 'UC Berkeley professor, founder of A-Lab and Materials Project' },
  { id: 'aspuru', label: 'Alán Aspuru-Guzik', labelEn: 'Alán Aspuru-Guzik', type: 'person', description: '多伦多大学教授，ChemOS和Atlas开发者', descriptionEn: 'University of Toronto professor, developer of ChemOS and Atlas' },
  { id: 'baird', label: 'Sterling Baird', labelEn: 'Sterling Baird', type: 'person', description: 'Honegumi和self-driving-lab-demo开发者', descriptionEn: 'Developer of Honegumi and self-driving-lab-demo' },
  { id: 'galileo', label: '伽利略', labelEn: 'Galileo Galilei', type: 'person', description: '现代科学实验方法之父', descriptionEn: 'Father of modern scientific experimental method', wikiUrl: 'https://zh.wikipedia.org/wiki/伽利略·伽利莱', wikiUrlEn: 'https://en.wikipedia.org/wiki/Galileo_Galilei' },
  { id: 'bacon', label: '弗朗西斯·培根', labelEn: 'Francis Bacon', type: 'person', description: '经验主义科学方法论奠基人', descriptionEn: 'Founder of empirical scientific methodology', wikiUrl: 'https://zh.wikipedia.org/wiki/弗朗西斯·培根', wikiUrlEn: 'https://en.wikipedia.org/wiki/Francis_Bacon' },
  { id: 'popper', label: '卡尔·波普尔', labelEn: 'Karl Popper', type: 'person', description: '提出科学可证伪性原则', descriptionEn: 'Proposed the principle of scientific falsifiability', wikiUrl: 'https://zh.wikipedia.org/wiki/卡尔·波普尔', wikiUrlEn: 'https://en.wikipedia.org/wiki/Karl_Popper' },
  { id: 'kuhn', label: '托马斯·库恩', labelEn: 'Thomas Kuhn', type: 'person', description: '提出科学范式转移理论', descriptionEn: 'Proposed the theory of scientific paradigm shift', wikiUrl: 'https://zh.wikipedia.org/wiki/托马斯·库恩', wikiUrlEn: 'https://en.wikipedia.org/wiki/Thomas_Kuhn' },
  { id: 'gray', label: 'Jim Gray', labelEn: 'Jim Gray', type: 'person', description: '提出科学四范式', descriptionEn: 'Proposed the four paradigms of science', wikiUrlEn: 'https://en.wikipedia.org/wiki/Jim_Gray_(computer_scientist)' },

  // Tools & Platforms
  { id: 'alab', label: 'A-Lab', labelEn: 'A-Lab', type: 'tool', description: 'LBNL开发的材料科学自主实验室', descriptionEn: 'Lawrence Berkeley National Lab autonomous materials science laboratory' },
  { id: 'mp', label: 'Materials Project', labelEn: 'Materials Project', type: 'tool', description: '开放材料计算数据库，60万+用户', descriptionEn: 'Open materials computation database with 600K+ users' },
  { id: 'aybe', label: 'BayBE', labelEn: 'BayBE', type: 'tool', description: 'Merck开源的贝叶斯实验设计工具箱', descriptionEn: 'Merck open-source Bayesian experimental design toolkit' },
  { id: 'honegumi', label: 'Honegumi', labelEn: 'Honegumi', type: 'tool', description: 'BO代码生成器，专为材料科学设计', descriptionEn: 'BO code generator designed for materials science' },
  { id: 'atlas', label: 'Atlas', labelEn: 'Atlas', type: 'tool', description: 'SDL的"大脑"，Python BO库', descriptionEn: '"Brain" of SDL, Python BO library' },
  { id: 'chemos', label: 'ChemOS', labelEn: 'ChemOS', type: 'tool', description: '学术界最广泛使用的SDL编排软件', descriptionEn: 'Most widely used SDL orchestration software in academia' },
  { id: 'coscientist', label: 'Coscientist', labelEn: 'Coscientist', type: 'tool', description: 'GPT-4驱动的自主化学研究系统', descriptionEn: 'GPT-4 driven autonomous chemical research system' },

  // Theories
  { id: 'paradigm4', label: '科学四范式', labelEn: 'Four Paradigms', type: 'theory', description: 'Jim Gray提出的科学研究四范式：实验、理论、计算、数据驱动', descriptionEn: 'Four paradigms of scientific research: experimental, theoretical, computational, data-driven' },
  { id: 'falsifiability', label: '可证伪性', labelEn: 'Falsifiability', type: 'theory', description: 'Popper提出的科学划界标准', descriptionEn: 'Popper\'s criterion of demarcation for science' },
  { id: 'paradigm_shift', label: '范式转移', labelEn: 'Paradigm Shift', type: 'theory', description: 'Kuhn提出的科学革命概念', descriptionEn: 'Kuhn\'s concept of scientific revolution' },
  { id: 'bigsci', label: '大科学', labelEn: 'Big Science', type: 'concept', description: '需要大规模资源和协作的科学研究模式', descriptionEn: 'Scientific research mode requiring large-scale resources and collaboration', wikiUrl: 'https://zh.wikipedia.org/wiki/大科学', wikiUrlEn: 'https://en.wikipedia.org/wiki/Big_Science' },
  { id: 'replication', label: '复现性危机', labelEn: 'Replication Crisis', type: 'concept', description: '科学研究结果难以被独立重复验证的现象', descriptionEn: 'Phenomenon where scientific research results are difficult to independently replicate' },
];

export const kgEdges: KGEdge[] = [
  // SDL core relations
  { source: 'sdl', target: 'bo', relation: '核心算法', relationEn: 'core algorithm' },
  { source: 'sdl', target: 'robo', relation: '依赖技术', relationEn: 'depends on' },
  { source: 'sdl', target: 'ht', relation: '技术路线', relationEn: 'technology route' },
  { source: 'bo', target: 'gp', relation: '使用', relationEn: 'uses' },
  { source: 'bo', target: 'acq', relation: '包含', relationEn: 'includes' },
  { source: 'dmtal', target: 'sdl', relation: '抽象描述', relationEn: 'abstracts' },
  { source: 'sdl', target: 'dft', relation: '预筛选', relationEn: 'pre-screens with' },

  // Synthesis
  { source: 'synth', target: 'cvd', relation: '包含方法', relationEn: 'includes' },
  { source: 'synth', target: 'pvd', relation: '包含方法', relationEn: 'includes' },
  { source: 'synth', target: 'solid', relation: '包含方法', relationEn: 'includes' },
  { source: 'synth', target: 'solvothermal', relation: '包含方法', relationEn: 'includes' },
  { source: 'sdl', target: 'synth', relation: '自动化', relationEn: 'automates' },

  // Characterization
  { source: 'chara', target: 'xrd', relation: '包含方法', relationEn: 'includes' },
  { source: 'chara', target: 'sem', relation: '包含方法', relationEn: 'includes' },
  { source: 'chara', target: 'tem', relation: '包含方法', relationEn: 'includes' },
  { source: 'chara', target: 'afm', relation: '包含方法', relationEn: 'includes' },
  { source: 'chara', target: 'xps', relation: '包含方法', relationEn: 'includes' },
  { source: 'chara', target: 'raman', relation: '包含方法', relationEn: 'includes' },
  { source: 'sdl', target: 'chara', relation: '自动化', relationEn: 'automates' },

  // Testing & Processing
  { source: 'sdl', target: 'test', relation: '自动化', relationEn: 'automates' },
  { source: 'sdl', target: 'proc', relation: '自动化', relationEn: 'automates' },
  { source: 'proc', target: 'annealing', relation: '包含方法', relationEn: 'includes' },

  // Persons
  { source: 'ceder', target: 'alab', relation: '创建', relationEn: 'created' },
  { source: 'ceder', target: 'mp', relation: '创建', relationEn: 'created' },
  { source: 'aspuru', target: 'chemos', relation: '开发', relationEn: 'developed' },
  { source: 'aspuru', target: 'atlas', relation: '开发', relationEn: 'developed' },
  { source: 'baird', target: 'honegumi', relation: '开发', relationEn: 'developed' },
  { source: 'bacon', target: 'paradigm4', relation: '贡献', relationEn: 'contributed to' },
  { source: 'popper', target: 'falsifiability', relation: '提出', relationEn: 'proposed' },
  { source: 'kuhn', target: 'paradigm_shift', relation: '提出', relationEn: 'proposed' },
  { source: 'gray', target: 'paradigm4', relation: '提出', relationEn: 'proposed' },

  // Tools
  { source: 'alab', target: 'mp', relation: '数据依赖', relationEn: 'data dependency' },
  { source: 'alab', target: 'bo', relation: '使用', relationEn: 'uses' },
  { source: 'alab', target: 'sdl', relation: '实例', relationEn: 'instance of' },
  { source: 'aybe', target: 'bo', relation: '实现', relationEn: 'implements' },
  { source: 'honegumi', target: 'bo', relation: '生成', relationEn: 'generates' },
  { source: 'atlas', target: 'sdl', relation: '驱动', relationEn: 'drives' },

  // Theories
  { source: 'paradigm_shift', target: 'sdl', relation: '解释', relationEn: 'explains' },
  { source: 'falsifiability', target: 'replication', relation: '关联', relationEn: 'related to' },
  { source: 'bigsci', target: 'sdl', relation: '演进为', relationEn: 'evolves into' },
  { source: 'ht', target: 'sdl', relation: '演进为', relationEn: 'evolves into' },
];

// Layout positions for visualization (pre-computed force-directed-like layout)
export const kgNodePositions: Record<string, { x: number; y: number }> = {
  sdl: { x: 0.5, y: 0.5 },
  bo: { x: 0.35, y: 0.35 },
  gp: { x: 0.25, y: 0.25 },
  acq: { x: 0.45, y: 0.25 },
  ht: { x: 0.65, y: 0.35 },
  dft: { x: 0.75, y: 0.35 },
  dmtal: { x: 0.5, y: 0.65 },
  robo: { x: 0.65, y: 0.55 },
  synth: { x: 0.2, y: 0.6 },
  cvd: { x: 0.1, y: 0.5 },
  pvd: { x: 0.1, y: 0.65 },
  solid: { x: 0.15, y: 0.75 },
  solvothermal: { x: 0.25, y: 0.8 },
  chara: { x: 0.5, y: 0.2 },
  xrd: { x: 0.35, y: 0.1 },
  sem: { x: 0.45, y: 0.08 },
  tem: { x: 0.55, y: 0.08 },
  afm: { x: 0.65, y: 0.1 },
  xps: { x: 0.75, y: 0.15 },
  raman: { x: 0.8, y: 0.25 },
  test: { x: 0.8, y: 0.5 },
  proc: { x: 0.8, y: 0.65 },
  annealing: { x: 0.9, y: 0.6 },
  ceder: { x: 0.3, y: 0.75 },
  aspuru: { x: 0.7, y: 0.75 },
  baird: { x: 0.25, y: 0.45 },
  galileo: { x: 0.1, y: 0.85 },
  bacon: { x: 0.2, y: 0.9 },
  popper: { x: 0.85, y: 0.85 },
  kuhn: { x: 0.75, y: 0.9 },
  gray: { x: 0.6, y: 0.9 },
  alab: { x: 0.4, y: 0.55 },
  mp: { x: 0.6, y: 0.4 },
  aybe: { x: 0.15, y: 0.35 },
  honegumi: { x: 0.15, y: 0.45 },
  atlas: { x: 0.75, y: 0.7 },
  chemos: { x: 0.85, y: 0.75 },
  coscientist: { x: 0.5, y: 0.85 },
  paradigm4: { x: 0.4, y: 0.95 },
  falsifiability: { x: 0.9, y: 0.9 },
  paradigm_shift: { x: 0.7, y: 0.95 },
  bigsci: { x: 0.5, y: 0.35 },
  replication: { x: 0.95, y: 0.85 },
};
