/**
 * LectureContext: 讲者模式的全局状态。
 *
 * 激活方式：
 * 1. URL 参数 `?mode=lecture`
 * 2. 顶部或底部导航中的“讲者模式”开关
 *
 * 快捷键：
 * - `ArrowRight` / `Space`：下一节点
 * - `ArrowLeft`：上一节点
 * - `r`：触发讲者模式重置事件
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';

export interface LectureNode {
  id: number;
  title: string;
  path: string;
  hash?: string;
}

export const LECTURE_NODES: LectureNode[] = [
  { id: 1, title: '课程介绍与学习目标', path: '/' },
  { id: 2, title: '实验的本质与地位', path: '/foundations', hash: '#intro' },
  { id: 3, title: 'MSE 实验图谱', path: '/foundations', hash: '#mse-map' },
  { id: 4, title: '从 OFAT 到 DOE 再到 SDL', path: '/foundations', hash: '#ofat-to-sdl' },
  { id: 5, title: 'SDL 闭环步进演示', path: '/foundations', hash: '#interactive-loop' },
  { id: 6, title: '代理模型（Surrogate）、不确定度（Uncertainty）与采集函数（AF）', path: '/foundations', hash: '#sdl-concepts' },
  { id: 7, title: '采集函数探索器（Acquisition Function Explorer）', path: '/foundations', hash: '#interactive-af' },
  { id: 8, title: 'AI/ML 方法全景：模型、代理与机器人', path: '/ai-methods' },
  { id: 9, title: 'SOTA/前沿：代表系统与现实边界', path: '/frontiers' },
  { id: 10, title: 'A-Lab 问题定义与系统组成', path: '/a-lab', hash: '#problem' },
  { id: 11, title: 'A-Lab 执行闭环与关键结果', path: '/a-lab', hash: '#results' },
  { id: 12, title: 'A-Lab 争议、再分析与 Nature 勘误', path: '/a-lab', hash: '#controversy' },
  { id: 13, title: 'GP-BO 解释与交互演示', path: '/sdl-demo' },
  { id: 14, title: 'Branin 函数：2D 基准与 GP-BO 演示', path: '/case-studio' },
  { id: 15, title: 'LED calibration：多通道多目标案例', path: '/case-studio' },
  { id: 16, title: 'Optical Thin-Film：物理模拟 Pareto 案例', path: '/case-studio' },
];

interface LectureContextValue {
  isLectureMode: boolean;
  toggleLectureMode: () => void;
  currentNode: number;
  totalNodes: number;
  currentNodeDef: LectureNode;
  goNext: () => void;
  goPrev: () => void;
  goToNode: (index: number) => void;
}

const LectureContext = createContext<LectureContextValue | null>(null);

export function LectureProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [isLectureMode, setIsLectureMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?')
      ? new URLSearchParams(window.location.hash.split('?')[1])
      : new URLSearchParams();
    return params.get('mode') === 'lecture' || hashQuery.get('mode') === 'lecture';
  });

  const [currentNode, setCurrentNode] = useState(0);

  const navigateTo = useCallback(
    (index: number) => {
      const node = LECTURE_NODES[index];
      if (!node) return;
      navigate(node.path);
      if (node.hash) {
        const hash = node.hash;
        setTimeout(() => {
          document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 80);
      }
    },
    [navigate]
  );

  const goNext = useCallback(() => {
    setCurrentNode((n) => {
      const next = Math.min(n + 1, LECTURE_NODES.length - 1);
      navigateTo(next);
      return next;
    });
  }, [navigateTo]);

  const goPrev = useCallback(() => {
    setCurrentNode((n) => {
      const prev = Math.max(n - 1, 0);
      navigateTo(prev);
      return prev;
    });
  }, [navigateTo]);

  const goToNode = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, LECTURE_NODES.length - 1));
      setCurrentNode(clamped);
      navigateTo(clamped);
    },
    [navigateTo]
  );

  const toggleLectureMode = useCallback(() => {
    setIsLectureMode((v) => !v);
    if (!isLectureMode) setCurrentNode(0);
  }, [isLectureMode]);

  useEffect(() => {
    if (!isLectureMode) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as Element)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('lecture:reset'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isLectureMode, goNext, goPrev]);

  return (
    <LectureContext.Provider
      value={{
        isLectureMode,
        toggleLectureMode,
        currentNode,
        totalNodes: LECTURE_NODES.length,
        currentNodeDef: LECTURE_NODES[currentNode],
        goNext,
        goPrev,
        goToNode,
      }}
    >
      {children}
    </LectureContext.Provider>
  );
}

export function useLecture() {
  const ctx = useContext(LectureContext);
  if (!ctx) throw new Error('useLecture must be used within LectureProvider');
  return ctx;
}
