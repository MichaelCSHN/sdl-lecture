/**
 * Course structure metadata.
 * Defines the full curriculum — lectures, modules, learning objectives.
 * The lecture MVP is a subset (marked by lecturePath: true).
 */

export interface LectureMeta {
  id: string;
  num: string;
  title: string;
  titleCn: string;
  module: 'A' | 'B' | 'C';
  /** route with optional hash fragment for in-page anchor navigation */
  route: string;
  lecturePath: boolean; // included in 3-hour lecture MVP
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
      'The historical role of experimentation in science. Why experiment remains irreplaceable. Why now is the right time to discuss SDL.',
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
      'A unified framework for categorizing MSE experiments: synthesis, processing, characterization, property measurement, functional testing, stability/failure, metrology, and closed-loop.',
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
      'Controlled vs measured variables. Noise, bias, repeatability, uncertainty. Why many AI experiment problems are fundamentally measurement problems first.',
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
      'Experience-driven optimization. Expert knowledge. Why trial-and-error worked for centuries — and where it breaks down.',
  },
  {
    id: 'lecture-05',
    num: '05',
    title: 'Traditional Methods II: DOE',
    titleCn: '传统方法论 II：DOE',
    module: 'B',
    route: '/foundations#doe-vs-sdl',
    lecturePath: true,
    learningObjectives: ['LO4'],
    description:
      'Factors, responses, and constraints. Full factorial, fractional factorial, response surface methods. DOE as the foundation and prehistory of SDL.',
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
      'Synthesis, processing, characterization chains. Instruments, sample handling, data flow. SDL is systems engineering, not just BO.',
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
      'Surrogate models, uncertainty quantification, acquisition functions, closed-loop decision making. Multi-objective SDL. Why the algorithm recommends the next experiment point.',
  },
  {
    id: 'lecture-08',
    num: '08',
    title: 'A-Lab: Real System Analysis',
    titleCn: 'A-Lab 与真实系统分析',
    module: 'C',
    route: '/a-lab',
    lecturePath: true,
    learningObjectives: ['LO6'],
    description:
      'A-Lab case file: problem definition, system architecture, key results, controversy, and lessons. Critical reading of a real SDL system.',
  },
  {
    id: 'lecture-09',
    num: '09',
    title: 'Case Studio',
    titleCn: '案例工作台',
    module: 'C',
    route: '/case-studio',
    lecturePath: true,
    learningObjectives: ['LO7'],
    description:
      'RGB LED benchmark, a reaction optimization case, a materials case. Observe how SDL selects the next experiment from observations and targets.',
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
      'Translate your own research question into a minimum-viable SDL design: objective, parameters, constraints, measurements, strategy, risks.',
  },
];

export const LEARNING_OBJECTIVES: Record<string, { id: string; text: string }> = {
  LO1: {
    id: 'LO1',
    text: 'Understand the historical role, status, and evolution of experiments in MSE.',
  },
  LO2: {
    id: 'LO2',
    text: 'Master the MSE experiment taxonomy and catalog — classify and define common experiments.',
  },
  LO3: {
    id: 'LO3',
    text: 'Understand controlled variables, measured variables, error, repeatability, and uncertainty in experiments.',
  },
  LO4: {
    id: 'LO4',
    text: 'Distinguish the methodological differences and applicable boundaries of heuristics, trial-and-error, DOE, and SDL.',
  },
  LO5: {
    id: 'LO5',
    text: 'Understand the software, hardware, data, and decision elements of the SDL closed loop.',
  },
  LO6: {
    id: 'LO6',
    text: 'Read and critically analyze real SDL case studies.',
  },
  LO7: {
    id: 'LO7',
    text: 'Explain the recommendation logic for the next experiment point in the Case Studio.',
  },
  LO8: {
    id: 'LO8',
    text: 'Translate your own research question into a minimum-viable SDL design draft.',
  },
};

export function getLecturePathLectures(): LectureMeta[] {
  return COURSE_LECTURES.filter((l) => l.lecturePath);
}

export function getLecturesByModule(module: 'A' | 'B' | 'C'): LectureMeta[] {
  return COURSE_LECTURES.filter((l) => l.module === module);
}
