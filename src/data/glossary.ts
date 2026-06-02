export interface GlossaryEntry {
  term: string;
  abbr?: string;
  definition: string;
  definitionEn: string;
}

export const glossary: Record<string, GlossaryEntry> = {
  'SDL': { term: '自主实验室', abbr: 'SDL', definition: 'Self-driving Laboratory：集成AI决策、机器人执行和自动数据分析的闭环实验系统', definitionEn: 'Closed-loop experimental system integrating AI decision-making, robotic execution, and automated data analysis' },
  'BO': { term: '贝叶斯优化', abbr: 'BO', definition: 'Bayesian Optimization：通过概率代理模型（如高斯过程）指导实验方向的高效全局优化算法', definitionEn: 'Efficient global optimization algorithm using probabilistic surrogate models' },
  'GP': { term: '高斯过程', abbr: 'GP', definition: 'Gaussian Process：定义在函数上的概率分布，作为BO中最常用的代理模型', definitionEn: 'Probability distribution over functions, commonly used as surrogate model in BO' },
  'DFT': { term: '密度泛函理论', abbr: 'DFT', definition: 'Density Functional Theory：计算材料电子结构的量子力学第一性原理方法', definitionEn: 'First-principles quantum mechanical method for calculating electronic structure' },
  'HT': { term: '高通量', abbr: 'HT', definition: 'High-Throughput：同时并行处理大量实验样本的技术路线', definitionEn: 'Technology approach processing large numbers of experimental samples in parallel' },
  'XRD': { term: 'X射线衍射', abbr: 'XRD', definition: 'X-ray Diffraction：通过X射线衍射图案分析材料的晶体结构', definitionEn: 'Analyzing crystal structure through X-ray diffraction patterns' },
  'SEM': { term: '扫描电子显微镜', abbr: 'SEM', definition: 'Scanning Electron Microscopy：利用聚焦电子束成像材料表面形貌', definitionEn: 'Imaging material surface morphology with focused electron beam' },
  'TEM': { term: '透射电子显微镜', abbr: 'TEM', definition: 'Transmission Electron Microscopy：透射电子成像分析材料微观结构', definitionEn: 'Analyzing microstructure via transmitted electrons' },
  'CVD': { term: '化学气相沉积', abbr: 'CVD', definition: 'Chemical Vapor Deposition：通过气相化学反应在基底上沉积薄膜', definitionEn: 'Depositing thin films via gas-phase chemical reactions' },
  'PVD': { term: '物理气相沉积', abbr: 'PVD', definition: 'Physical Vapor Deposition：通过物理过程在基底上沉积薄膜', definitionEn: 'Depositing thin films through physical processes' },
  'A-Lab': { term: 'A-Lab', abbr: 'A-Lab', definition: '由LBNL开发的材料科学自主实验室，2023年发表于Nature', definitionEn: 'Lawrence Berkeley National Lab autonomous materials science laboratory, Nature 2023' },
  'DMTA-L': { term: 'DMTA-L闭环', abbr: 'DMTA-L', definition: 'Design-Make-Test-Analyze-Learn：SDL闭环的标准抽象', definitionEn: 'Standard abstraction of SDL closed loop' },
  'MAP': { term: '材料加速平台', abbr: 'MAP', definition: 'Materials Acceleration Platform：SDL的另一常用名称', definitionEn: 'Another common name for SDL' },
  'AC': { term: '加速联盟', abbr: 'AC', definition: 'Acceleration Consortium：多伦多大学领衔的全球SDL研究联盟', definitionEn: 'University of Toronto-led global SDL research consortium' },
  'MP': { term: '材料项目', abbr: 'MP', definition: 'Materials Project：LBNL维护的开放材料计算数据库', definitionEn: 'LBNL-maintained open materials computation database' },
};

export function lookupTerm(text: string): GlossaryEntry | undefined {
  return glossary[text];
}
