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
    question: 'A-Lab 在 17 天内成功合成了多少种新材料？',
    options: ['17 种', '41 种', '100 种', '365 种'],
    correct: 1,
    explanation: 'A-Lab 在 2023 年的演示实验中，17 天内成功合成了 41 种新材料，其中绝大多数是全新发现的化合物。',
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
    question: '以下哪种表征技术已被 A-Lab 实现全自动化？',
    options: ['透射电镜（TEM）', 'X射线衍射（XRD）', '原子力显微镜（AFM）', '核磁共振（NMR）'],
    correct: 1,
    explanation: 'A-Lab 目前实现了 XRD 的全自动原位表征。TEM、AFM 和 NMR 由于样品制备复杂或测量时间长，尚未完全自动化。',
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
