/**
 * 课程结构元数据。
 * 定义完整课程中的讲座、模块与学习目标。
 * `lecturePath: true` 表示该讲座纳入本次讲授路径。
 */

export interface LectureMeta {
  id: string;
  num: string;
  title: string;
  titleCn: string;
  module: 'A' | 'B' | 'C';
  route: string;
  lecturePath: boolean;
  learningObjectives: string[];
  description: string;
}

export const COURSE_LECTURES: LectureMeta[] = [
  {
    id: 'lecture-01',
    num: '01',
    title: 'Why Re-understand Experiment',
    titleCn: '为什么要重新理解实验',
    module: 'A',
    route: '/foundations#sec-experiment-history',
    lecturePath: true,
    learningObjectives: ['LO1'],
    description: '回到实验在科学中的历史角色，理解为什么实验不可替代，以及为什么现在值得重新讨论 SDL。',
  },
  {
    id: 'lecture-02',
    num: '02',
    title: 'MSE Experiment Taxonomy & Catalog',
    titleCn: 'MSE 实验图谱与目录学',
    module: 'A',
    route: '/foundations#sec-taxonomy',
    lecturePath: true,
    learningObjectives: ['LO2'],
    description: '按实验目的而非材料类别组织 MSE 实验，形成关于合成、加工、表征、测量、测试与校准的统一视角。',
  },
  {
    id: 'lecture-03',
    num: '03',
    title: 'Data, Error & Measurability',
    titleCn: '实验数据、误差与可测性',
    module: 'A',
    route: '/foundations#experiment-logic',
    lecturePath: false,
    learningObjectives: ['LO3'],
    description: '讨论控制变量、测量变量、噪声、偏差、重复性与不确定度，说明很多 AI 实验问题首先是测量问题。',
  },
  {
    id: 'lecture-04',
    num: '04',
    title: 'Traditional Methods I: Heuristics & Trial-and-Error',
    titleCn: '传统方法论 I：经验法与试错法',
    module: 'B',
    route: '/foundations',
    lecturePath: false,
    learningObjectives: ['LO4'],
    description: '理解经验驱动优化为何长期有效，同时明确试错法在高维、昂贵或受约束任务中的失效边界。',
  },
  {
    id: 'lecture-05',
    num: '05',
    title: 'Traditional Methods II: DOE',
    titleCn: '传统方法论 II：实验设计（DOE）',
    module: 'B',
    route: '/foundations#doe-vs-sdl',
    lecturePath: true,
    learningObjectives: ['LO4'],
    description: '从因子、响应和约束出发，理解 DOE 作为 SDL 的方法前史与基础，而不是与之对立的旧方法。',
  },
  {
    id: 'lecture-06',
    num: '06',
    title: 'Experimental Hardware & Workflows',
    titleCn: '实验硬件与实验工作流',
    module: 'B',
    route: '/foundations#autonomy-levels',
    lecturePath: false,
    learningObjectives: ['LO5'],
    description: '从仪器、样品流转到数据流，强调 SDL 是系统工程问题，而不只是 Bayesian Optimization。',
  },
  {
    id: 'lecture-07',
    num: '07',
    title: 'SDL Methodology',
    titleCn: 'SDL 方法论',
    module: 'C',
    route: '/foundations#sec-sdl-concepts',
    lecturePath: true,
    learningObjectives: ['LO5', 'LO6'],
    description: '介绍代理模型、不确定度量化、采集函数与闭环决策，并说明多目标 SDL 的基本任务语言。',
  },
  {
    id: 'lecture-08',
    num: '08',
    title: 'AI/ML Method Landscape',
    titleCn: 'AI/ML 方法全景',
    module: 'C',
    route: '/ai-methods',
    lecturePath: true,
    learningObjectives: ['LO6'],
    description: '把预测代理模型、生成模型、LLM 代理、实验机器人和数据基础设施放进同一张方法地图，而不是只记算法名。',
  },
  {
    id: 'lecture-09',
    num: '09',
    title: 'SOTA Systems & Frontiers',
    titleCn: 'SOTA/前沿：系统、数据与现实边界',
    module: 'C',
    route: '/frontiers',
    lecturePath: true,
    learningObjectives: ['LO7'],
    description: '对照 A-Lab、GNoME、Coscientist、CAMEO/HELAO 等代表性系统，区分前沿能力、工程约束与宣传口径。',
  },
  {
    id: 'lecture-10',
    num: '10',
    title: 'A-Lab: Real System Analysis',
    titleCn: 'A-Lab：真实系统分析',
    module: 'C',
    route: '/a-lab',
    lecturePath: true,
    learningObjectives: ['LO7'],
    description: '拆解 A-Lab 的问题定义、系统架构、结果、争议与教学价值，训练对真实 SDL 系统的批判性阅读。',
  },
  {
    id: 'lecture-11',
    num: '11',
    title: 'Case Studio / GP-BO Lab',
    titleCn: '案例工作台：GP-BO 现场演示',
    module: 'C',
    route: '/case-studio',
    lecturePath: true,
    learningObjectives: ['LO8'],
    description: '通过 Branin、LED calibration、Optical Thin-Film 三类统一案例观察闭环优化如何从观测、更新走向下一次推荐。',
  },
  {
    id: 'lecture-12',
    num: '12',
    title: 'Research Design Studio',
    titleCn: '研究设计工作室',
    module: 'C',
    route: '/design-studio',
    lecturePath: false,
    learningObjectives: ['LO9'],
    description: '把个人研究问题重写为最小 SDL 设计草案，明确目标、参数、约束、测量、策略、风险与验证计划。',
  },
];

export const LEARNING_OBJECTIVES: Record<string, { id: string; text: string }> = {
  LO1: {
    id: 'LO1',
    text: '理解实验在 MSE 中的历史角色、知识地位与演化趋势。',
  },
  LO2: {
    id: 'LO2',
    text: '掌握 MSE 实验图谱与目录学，能够对常见实验进行分类和定义。',
  },
  LO3: {
    id: 'LO3',
    text: '理解实验中的控制变量、测量变量、误差、重复性与不确定度。',
  },
  LO4: {
    id: 'LO4',
    text: '区分试错法、DOE 与 SDL 的方法差异及适用边界。',
  },
  LO5: {
    id: 'LO5',
    text: '理解 SDL 闭环中的软件、硬件、数据与决策要素。',
  },
  LO6: {
    id: 'LO6',
    text: '能够把常见 AI/ML 方法放回 SDL 闭环位置，判断它们解决的是预测、生成、决策还是执行问题。',
  },
  LO7: {
    id: 'LO7',
    text: '能够读懂并批判性分析真实 SDL 与 SOTA 系统案例。',
  },
  LO8: {
    id: 'LO8',
    text: '能够解释案例工作台中下一次实验推荐背后的逻辑。',
  },
  LO9: {
    id: 'LO9',
    text: '能够把自己的研究问题改写为最小 SDL 设计草案。',
  },
};

export function getLecturePathLectures(): LectureMeta[] {
  return COURSE_LECTURES.filter((l) => l.lecturePath);
}

export function getLecturesByModule(module: 'A' | 'B' | 'C'): LectureMeta[] {
  return COURSE_LECTURES.filter((l) => l.module === module);
}
