export interface MethodShift {
  title: string;
  from: string;
  to: string;
  summary: string;
  implication: string;
}

export interface HistoricalMilestone {
  era: string;
  title: string;
  summary: string;
  methodGain: string;
  mseEcho: string;
  color: string;
}

export interface MSEBridgeCard {
  title: string;
  body: string;
  implication: string;
  chips: string[];
}

export interface ReadingTrack {
  title: string;
  audience: string;
  description: string;
  steps: string[];
}

export interface CuratedResource {
  title: string;
  author: string;
  year: string;
  category: 'philosophy' | 'design' | 'mse' | 'computation' | 'informatics' | 'online';
  stage: 'lecture' | 'course' | 'deep';
  whyRead: string;
  relevance: string;
}

export const methodShifts: MethodShift[] = [
  {
    title: '第一次跃迁',
    from: '从观察自然',
    to: '到主动干预自然',
    summary:
      '实验的关键不只是“看见了什么”，而是能否通过人为设置条件、隔离变量、重复操作，让自然对问题作答。',
    implication:
      '这一步奠定了实验与纯观察、自然史、思辨哲学的边界，也解释了为什么实验室会成为现代科学的基础设施。',
  },
  {
    title: '第二次跃迁',
    from: '从单因素控制',
    to: '到统计设计与不确定性管理',
    summary:
      '当问题从“这一个因素有没有作用”变成“多个因素如何共同影响结果”时，实验设计不再是排除噪声，而是利用变异来做推断。',
    implication:
      '随机化、重复、区组化和方差分析使实验从工匠经验升级为可审查、可比较、可推广的方法论。',
  },
  {
    title: '第三次跃迁',
    from: '从单次实验',
    to: '到数据驱动的闭环实验',
    summary:
      '在高通量平台、数据库和机器学习支持下，实验不再只验证假设，也开始连续生成假设、筛选条件、更新决策。',
    implication:
      'SDL 不是对实验的替代，而是把“下一步做什么”的决策层部分转交给算法，让实验进入更高频、更大尺度的循环。',
  },
];

export const historicalMilestones: HistoricalMilestone[] = [
  {
    era: '前 5 世纪至公元 2 世纪',
    title: '古典时期：系统观察的萌芽',
    summary:
      '希波克拉底学派强调记录与比较病例，亚里士多德建立经验自然分类，盖伦推进解剖与生理实验，但尚未形成“控制变量”的清晰意识。',
    methodGain: '把零散经验组织成可积累的观察传统。',
    mseEcho: '对应今天材料研究中最初级但仍必要的现象识别、分类与经验归纳。',
    color: '#26a69a',
  },
  {
    era: '10 至 12 世纪',
    title: '伊斯兰黄金时代：受控实验的先声',
    summary:
      '伊本·海塞姆在《光学书》中通过隔离变量验证光学理论；伊本·西那提出药物应分别测试，形成临床试验的早期原型。',
    methodGain: '从“观察现象”迈向“为检验而设计条件”。',
    mseEcho: '对应今天表征实验中通过样品制备、几何边界和环境条件来构造可解释证据。',
    color: '#6c63ff',
  },
  {
    era: '17 世纪',
    title: '科学革命：实验成为知识基石',
    summary:
      '培根系统阐述归纳与实验方法，伽利略将测量引入物理，哈维以实验验证血液循环，波义耳建立重复验证与公开见证的规范。',
    methodGain: '把实验从局部技巧上升为现代科学的公共程序。',
    mseEcho: '对应 MSE 中“制备—表征—解释”链条开始具备可复制、可交流的实验规范。',
    color: '#d97706',
  },
  {
    era: '18 世纪',
    title: '第一次临床受控试验',
    summary:
      '詹姆斯·林德将坏血病患者分组比较，发现柠檬汁有效，显示对照设计不仅是逻辑手段，也能转化为社会可用的医学结论。',
    methodGain: '把“对照”明确为识别因果的核心结构。',
    mseEcho: '对应材料性能评估中基线样品、空白样、对照工艺的必要性。',
    color: '#c26b1a',
  },
  {
    era: '19 世纪',
    title: '实验逻辑的哲学奠基',
    summary:
      '密尔提出差异法、同意法与共变法，克劳德·伯纳德明确对照实验在生理学中的地位，强调严格隔离单一变量。',
    methodGain: '把实验从“操作经验”提升为可论证的推理框架。',
    mseEcho: '对应今天我们要求实验不仅有效，还要解释得清楚、变量边界明确。',
    color: '#2f80c9',
  },
  {
    era: '1920 至 1935 年',
    title: '费舍尔革命：统计实验设计诞生',
    summary:
      '费舍尔在农业实验中发展随机化、重复、区组化、析因设计与方差分析，《实验设计》使实验设计成为独立方法论。',
    methodGain: '从“消除变异”转向“利用变异做可靠推断”。',
    mseEcho: '对应现代 DOE、响应面和工艺优化，是材料实验从经验筛选走向统计设计的转折点。',
    color: '#4f8f2f',
  },
  {
    era: '1948 年',
    title: 'RCT 成为临床金标准',
    summary:
      '随机对照试验、双盲和安慰剂对照的制度化，让“实验结论如何被共同体接受”也被纳入方法论的一部分。',
    methodGain: '把偏倚控制纳入实验设计，而非事后补救。',
    mseEcho: '对应跨实验室重复、盲评表征和基准流程，对材料数据可信度提出更高要求。',
    color: '#c03a6b',
  },
  {
    era: '1950 至 1990 年代',
    title: '工业与计算机实验设计',
    summary:
      'Box-Wilson 响应面、田口稳健设计、蒙特卡洛和 D-optimal 设计将实验设计带入复杂工程、多目标约束和计算辅助场景。',
    methodGain: '把实验从“验证”扩展为“面向工程目标的搜索”。',
    mseEcho: '对应合金工艺、热处理窗口、器件参数和多因素性能优化中的工程化实验。',
    color: '#9b9b9b',
  },
  {
    era: '21 世纪至今',
    title: '数字化、自适应与大规模在线实验',
    summary:
      'A/B 测试、自适应临床试验、贝叶斯优化、自然实验和高通量平台共同推动实验进入实时更新、算法参与决策的新阶段。',
    methodGain: '把实验组织成持续学习的闭环系统。',
    mseEcho: '直接通向 SDL：实验、计算、数据库和机器学习共同决定下一步样品与条件。',
    color: '#cf3d3d',
  },
];

export const mseBridgeCards: MSEBridgeCard[] = [
  {
    title: '材料四面体不是静态图，而是实验循环图',
    body:
      '加工/制备、结构、性质、性能四个角点之间，并不是线性因果链，而是被实验不断往返验证的循环系统。',
    implication:
      '这意味着 MSE 的核心难题不是“有没有实验”，而是如何组织实验去穿透四面体中的多层映射。',
    chips: ['Processing', 'Structure', 'Properties', 'Performance'],
  },
  {
    title: '表征把样品变成证据',
    body:
      '合成得到的只是“东西”，表征才把它变成“可讨论的对象”。XRD、SEM、TEM、XPS 等方法决定我们能看见什么、能相信什么。',
    implication:
      '实验史中的测量标准与变量隔离，在 MSE 中具体体现为样品制备标准、仪器校准与谱图解释边界。',
    chips: ['Characterization', 'Calibration', 'Interpretation'],
  },
  {
    title: '性能测试把性质变成工程判断',
    body:
      '材料是否值得继续开发，不取决于一个漂亮的结构图，而取决于在具体载荷、温度、频率或循环条件下是否可靠。',
    implication:
      '这解释了为什么 MSE 中的实验设计天然带有目标函数、约束条件和寿命评估，远比单点验证更接近决策。',
    chips: ['Target', 'Constraint', 'Lifetime'],
  },
  {
    title: '计算与数据没有替代实验，而是改变实验密度',
    body:
      'DFT、Materials Project、高通量筛选和机器学习并不取消实验，而是压缩了“无信息实验”的比例，提高了“值得做的实验”的密度。',
    implication:
      'SDL 的价值不在于自动化本身，而在于让实验从离散动作变成持续更新的搜索过程。',
    chips: ['DFT', 'Database', 'ML', 'Closed Loop'],
  },
];

export const readingTracks: ReadingTrack[] = [
  {
    title: '讲座后两小时补强线',
    audience: '刚听完讲座，想把关键框架坐实',
    description:
      '优先建立“实验为何重要、DOE 解决什么、SDL 又改变了什么”这三个判断框架，不急着进入过多数学细节。',
    steps: [
      '先读 Hacking，理解实验不是理论附庸。',
      '再读 Fisher 或 Montgomery，建立实验设计语言。',
      '最后结合 Materials Project 或 A-Lab，理解实验如何进入闭环时代。',
    ],
  },
  {
    title: '研究生方法论线',
    audience: '准备把实验设计真正用于自己的课题',
    description:
      '这条线强调变量控制、统计推断、实验偏倚与可复现性，适合做论文设计、答辩和方法章节写作。',
    steps: [
      'Bernard 与 Mill/Popper 解决“什么算一个好实验”。',
      'Fisher、Box、Montgomery 解决“如何高效组织实验”。',
      'Mayo 帮你回答“为什么这个统计结论值得相信”。',
    ],
  },
  {
    title: 'MSE 实验与表征线',
    audience: '想把历史方法论落到材料研究现场',
    description:
      '从相变、表征、器件性能到失效分析，理解 MSE 里的实验并不是同一种动作，而是一套彼此耦合的方法组合。',
    steps: [
      '先抓住材料四面体与实验类型目录。',
      '再读相变和 TEM 这样的核心教材，建立“加工—结构—性能”映射感。',
      '最后回到自己的课题，判断哪里适合 DOE，哪里需要闭环优化。',
    ],
  },
  {
    title: '计算与数据扩展线',
    audience: '想进一步进入高通量、数据库、AI for Science',
    description:
      '这条线适合在已经理解实验逻辑之后，再讨论计算和数据到底改变了哪一层，而不是把它们误当成替代品。',
    steps: [
      '先用 DFT 或分子模拟教材理解计算对象与边界。',
      '再用 Materials Project 和综述理解数据基础设施。',
      '最后回到 SDL，判断哪些决策可以交给算法，哪些仍必须由实验者把关。',
    ],
  },
];

export const curatedResources: CuratedResource[] = [
  {
    title: 'Representing and Intervening',
    author: 'Ian Hacking',
    year: '1983',
    category: 'philosophy',
    stage: 'lecture',
    whyRead: '最适合回答“为什么实验本身就能生产知识，而不只是验证理论”。',
    relevance: '帮学生建立实验在科学哲学中的独立地位，是整门讲座最关键的底层支撑之一。',
  },
  {
    title: 'Inventing Temperature',
    author: 'Hasok Chang',
    year: '2004',
    category: 'philosophy',
    stage: 'course',
    whyRead: '通过温度测量史说明：测量标准不是天生存在，而是在循环校准中被做出来的。',
    relevance: '对应材料表征和校准问题，尤其适合连接“测量可信度”和“实验结果可比性”。',
  },
  {
    title: 'Statistical Inference as Severe Testing',
    author: 'Deborah Mayo',
    year: '2018',
    category: 'design',
    stage: 'deep',
    whyRead: '把统计推断与可证伪性结合起来，解释为什么“通过严格检验”比“看起来显著”更重要。',
    relevance: '适合课程后半段讨论实验推断可靠性、模型验证与偏倚控制。',
  },
  {
    title: 'Introduction to the Study of Experimental Medicine',
    author: 'Claude Bernard',
    year: '1865',
    category: 'philosophy',
    stage: 'course',
    whyRead: '经典中的经典，几乎是现代对照实验逻辑的原始文本。',
    relevance: '适合把“单变量隔离”和“人为设问自然”讲成历史可追溯的方法论，而非抽象术语。',
  },
  {
    title: 'The Design of Experiments',
    author: 'R. A. Fisher',
    year: '1935',
    category: 'design',
    stage: 'lecture',
    whyRead: '理解随机化、区组化、析因设计为什么不是技巧，而是推断结构。',
    relevance: '是从试错法走向 DOE 的必经文本，适合讲“利用变异而不是害怕变异”。',
  },
  {
    title: 'Statistics for Experimenters',
    author: 'Box, Hunter and Hunter',
    year: '2005',
    category: 'design',
    stage: 'course',
    whyRead: '比很多统计教材更接近真实实验决策，强调为什么这样设计，而不只教怎么算。',
    relevance: '适合把 DOE 从公式还原为实验策略，和 SDL 决策逻辑形成自然过渡。',
  },
  {
    title: 'Design and Analysis of Experiments',
    author: 'Douglas C. Montgomery',
    year: '2017',
    category: 'design',
    stage: 'course',
    whyRead: '工程上最常用的 DOE 教材，结构清晰，适合快速建立工作语言。',
    relevance: '适合实验室成员形成共同词汇：因子、响应、交互作用、响应面和优化路径。',
  },
  {
    title: 'Phase Transformations in Metals and Alloys',
    author: 'Porter, Easterling and Sherif',
    year: '2009',
    category: 'mse',
    stage: 'course',
    whyRead: '帮助学生真正理解“加工—结构”这条 MSE 核心映射为什么必须依赖实验。',
    relevance: '适合把实验史中的方法论落回相变、组织演化和材料设计现实。',
  },
  {
    title: 'Transmission Electron Microscopy',
    author: 'Williams and Carter',
    year: '2009',
    category: 'mse',
    stage: 'deep',
    whyRead: '最适合说明“表征不是拍图，而是构造证据链”的教材。',
    relevance: '能把实验哲学中的测量、仪器、解释边界，具体化到 MSE 表征现场。',
  },
  {
    title: 'Understanding Molecular Simulation',
    author: 'Frenkel and Smit',
    year: '2002',
    category: 'computation',
    stage: 'deep',
    whyRead: '帮助学生理解计算不是魔法，而是另一种带有假设和边界条件的实验替身。',
    relevance: '适合讲清楚计算与实验各自回答什么问题，以及为什么二者必须闭环。',
  },
  {
    title: 'Density Functional Theory: A Practical Introduction',
    author: 'Sholl and Steckel',
    year: '2009',
    category: 'computation',
    stage: 'course',
    whyRead: '适合非理论背景学生快速把 DFT 放进自己的研究工具箱里。',
    relevance: '能把“计算筛选为何能前置实验”讲成具体能力，而不是口号。',
  },
  {
    title: 'Machine Learning for Molecular and Materials Science',
    author: 'Butler et al.',
    year: '2018',
    category: 'informatics',
    stage: 'lecture',
    whyRead: '最适合作为 AI for Materials 的入口综述，范围广、门槛相对友好。',
    relevance: '适合把“第四范式到 SDL”之间的桥搭起来，让学生知道数据方法真正改变了什么。',
  },
  {
    title: 'The Materials Project: A Materials Genome Approach',
    author: 'Jain et al.',
    year: '2013',
    category: 'informatics',
    stage: 'course',
    whyRead: '说明数据库不是附件，而是现代材料研究的基础设施。',
    relevance: '是理解高通量计算、开放数据与实验筛选如何耦合的代表性文本。',
  },
  {
    title: 'Materials Project',
    author: 'materialsproject.org',
    year: '持续更新',
    category: 'online',
    stage: 'lecture',
    whyRead: '最直接的材料数据库入口，能立刻把“数据范式”从概念变成可操作资源。',
    relevance: '适合配合讲座现场演示“从数据库到实验候选”的思路。',
  },
  {
    title: 'DoITPoMS',
    author: 'University of Cambridge',
    year: '持续更新',
    category: 'online',
    stage: 'course',
    whyRead: '优秀的 MSE 可视化教学资源，适合补充结构、相变、断裂等直观理解。',
    relevance: '适合讲后自学，帮助学生把抽象方法论重新拉回材料对象本身。',
  },
  {
    title: 'Stanford Encyclopedia of Philosophy',
    author: 'SEP',
    year: '持续更新',
    category: 'online',
    stage: 'deep',
    whyRead: '当学生想系统查“Experiment”“Scientific Method”“Philosophy of Statistics”时，这是最稳的学术入口。',
    relevance: '适合做课程后深入阅读的知识索引，而不是课堂主体材料。',
  },
];
