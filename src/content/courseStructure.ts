/**
 * 课程结构元数据。
 * 定义完整课程——讲座、模块、学习目标。
 * 讲座路径为子集（lecturePath: true）。
 */

export interface LectureMeta {
  id: string;
  num: string;
  title: string;
  titleCn: string;
  module: 'A' | 'B' | 'C';
  /** 含 hash fragment 的路由，用于页内锚点导航 */
  route: string;
  lecturePath: boolean; // 是否纳入本次讲座
  learningObjectives: string[];
  description: string;
}

export const COURSE_LECTURES: LectureMeta[] = [
  {
    id: 'lecture-01',
    num: '01',
    title: 'Why Re-understand Experiment',
    titleCn: '为什么重新理解实验',
    module: 'A',
    route: '/foundations#sec-experiment-history',
    lecturePath: true,
    learningObjectives: ['LO1'],
    description:
      '实验在科学中的历史角色。为什么实验不可替代。为什么现在适合讨论 SDL。',
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
    description:
      '按目的而非材料类别对 MSE 实验进行分类的统一框架：合成、加工、表征、物性测量、功能测试、稳定性/失效、计量/校准、高通量/闭环。',
  },
  {
    id: 'lecture-03',
    num: '03',
    title: 'Data, Error & Measurability',
    titleCn: '实验数据、误差与可测性',
    module: 'A',
    route: '/foundations',
    lecturePath: false,
    learningObjectives: ['LO3'],
    description:
      '控制变量与测量变量、噪声、偏差、重复性与不确定度。为什么很多 AI 实验问题本质上首先是测量问题。',
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
    description:
      '经验驱动的优化。专家知识的价值。为什么试错法长期有效——以及它的失效边界在哪里。',
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
    description:
      '因子、响应与约束。全因子、部分因子、响应面方法。DOE 作为 SDL 的前史与基础——连续性而非替代。',
  },
  {
    id: 'lecture-06',
    num: '06',
    title: 'Experimental Hardware & Workflows',
    titleCn: '实验硬件与实验工作流',
    module: 'B',
    route: '/foundations',
    lecturePath: false,
    learningObjectives: ['LO5'],
    description:
      '合成、加工、表征链条。仪器、样品流转、数据流。SDL 是系统工程，不只是贝叶斯优化。',
  },
  {
    id: 'lecture-07',
    num: '07',
    title: 'SDL Methodology',
    titleCn: 'SDL 方法论',
    module: 'C',
    route: '/foundations#sec-sdl-concepts',
    lecturePath: true,
    learningObjectives: ['LO5', 'LO7'],
    description:
      '代理模型、不确定度量化、采集函数、闭环决策。多目标 SDL。为什么模型推荐下一个实验点——背后的逻辑。',
  },
  {
    id: 'lecture-08',
    num: '08',
    title: 'A-Lab: Real System Analysis',
    titleCn: 'A-Lab：真实系统分析',
    module: 'C',
    route: '/a-lab',
    lecturePath: true,
    learningObjectives: ['LO6'],
    description:
      'A-Lab 案例档案：问题定义、系统架构、关键结果、学术争议与教学启示。批判性阅读一个真实 SDL 系统。',
  },
  {
    id: 'lecture-09',
    num: '09',
    title: 'Case Studio',
    titleCn: '案例工作台：现场演示',
    module: 'C',
    route: '/case-studio',
    lecturePath: true,
    learningObjectives: ['LO7'],
    description:
      'RGB LED 颜色匹配 benchmark。现场观察 SDL 闭环：参数输入→生成观测→更新模型→推荐下一点→展示历史。',
  },
  {
    id: 'lecture-10',
    num: '10',
    title: 'Research Design Studio',
    titleCn: '研究设计工作室',
    module: 'C',
    route: '/design-studio',
    lecturePath: false,
    learningObjectives: ['LO8'],
    description:
      '把自己的研究问题转写为最小 SDL 设计草案：目标、参数、约束、测量、建议策略、风险与验证计划。',
  },
];

export const LEARNING_OBJECTIVES: Record<string, { id: string; text: string }> = {
  LO1: {
    id: 'LO1',
    text: '理解实验在 MSE 中的历史角色、知识地位与演变趋势。',
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
    text: '区分试错法、DOE 与 SDL 的方法论差异与适用边界。',
  },
  LO5: {
    id: 'LO5',
    text: '理解 SDL 闭环中的软件、硬件、数据与决策要素。',
  },
  LO6: {
    id: 'LO6',
    text: '能够读懂并批判性分析真实 SDL 案例。',
  },
  LO7: {
    id: 'LO7',
    text: '能够解释案例工作台中下一个实验点的推荐逻辑。',
  },
  LO8: {
    id: 'LO8',
    text: '能够把自己的研究问题转写为最小 SDL 设计草案。',
  },
};

export function getLecturePathLectures(): LectureMeta[] {
  return COURSE_LECTURES.filter((l) => l.lecturePath);
}

export function getLecturesByModule(module: 'A' | 'B' | 'C'): LectureMeta[] {
  return COURSE_LECTURES.filter((l) => l.module === module);
}
