export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: '讨论 A-Lab 结果时，最稳妥的事实口径是什么？',
    options: [
      '直接沿用原始 41/58 声称作为最终结论',
      '只说机器人连续运行 17 天，不讨论材料结果',
      '区分原始声称 41/58、Nature 修正记录 36/57 和后续争议',
      '把所有争议都视为无关细节',
    ],
    correct: 2,
    explanation: 'A-Lab 的课堂表述应区分原论文原始声称、Nature 当前修正记录和后续再分析争议，不能把原始 41/58 声称当作最终结论。',
  },
  {
    id: 2,
    question: '贝叶斯优化（BO）的核心思想是什么？',
    options: [
      '随机搜索所有可能的实验条件',
      '基于概率模型智能选择下一个实验点',
      '按照固定网格扫描参数空间',
      '仅依赖人类专家的直觉判断',
    ],
    correct: 1,
    explanation: 'BO 使用高斯过程等概率代理模型来估计目标函数的分布，并通过采集函数智能地选择下一个实验点，平衡探索与利用。',
  },
  {
    id: 3,
    question: 'SDL 闭环的标准抽象 DMTA-L 中，"L"代表什么？',
    options: ['Loop（循环）', 'Learn（学习）', 'Laboratory（实验室）', 'Language（语言）'],
    correct: 1,
    explanation: 'DMTA-L = Design（设计）- Make（合成）- Test（测试）- Analyze（分析）- Learn（学习），其中 Learn 是闭环的关键反馈环节。',
  },
  {
    id: 4,
    question: 'A-Lab 案例中，最需要审查的关键表征证据是什么？',
    options: ['透射电镜（TEM）', 'X射线衍射（XRD）', '原子力显微镜（AFM）', '核磁共振（NMR）'],
    correct: 1,
    explanation: 'A-Lab 依赖自动 XRD 与后续判相来判断合成结果，因此 XRD 证据、结构解释和独立验证是审查重点。',
  },
  {
    id: 5,
    question: 'Jim Gray 提出的科学"第四范式"是指什么？',
    options: [
      '理论科学',
      '计算科学',
      '数据密集型科学',
      'AI 自主科学',
    ],
    correct: 2,
    explanation: 'Jim Gray 提出四范式：第一范式（实验）、第二范式（理论）、第三范式（计算模拟）、第四范式（数据密集型科学发现）。',
  },
];
