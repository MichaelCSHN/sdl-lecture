/**
 * LectureToolbar — amber top bar shown in lecture mode.
 *
 * Appears above the main TopNav when lecture mode is active.
 * Shows: prev / current node name + progress / next / exit buttons.
 */

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLecture } from '@/contexts/LectureContext';

export default function LectureToolbar() {
  const { isLectureMode, currentNode, totalNodes, currentNodeDef, goNext, goPrev, toggleLectureMode } =
    useLecture();

  if (!isLectureMode) return null;

  const isFirst = currentNode === 0;
  const isLast = currentNode === totalNodes - 1;

  return (
    <div
      style={{ background: '#92400e', borderBottom: '1px solid #78350f' }}
      className="fixed top-0 left-0 right-0 z-50 h-10 flex items-center px-4 gap-3 text-amber-100"
    >
      {/* Prev */}
      <button
        onClick={goPrev}
        disabled={isFirst}
        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono
                   hover:bg-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="上一节点 ←"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        上一步
      </button>

      {/* Node info */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <span className="text-[10px] font-mono text-amber-300 shrink-0">
          {currentNode + 1} / {totalNodes}
        </span>
        <span className="text-[11px] font-mono text-amber-100 truncate">
          {currentNodeDef.title}
        </span>
      </div>

      {/* Progress dots */}
      <div className="hidden sm:flex items-center gap-1">
        {Array.from({ length: totalNodes }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === currentNode ? 20 : 6,
              height: 6,
              background: i === currentNode ? '#fcd34d' : i < currentNode ? '#d97706' : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>

      {/* Next */}
      <button
        onClick={goNext}
        disabled={isLast}
        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono
                   hover:bg-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="下一节点 →"
      >
        下一步
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Keyboard hint */}
      <span className="hidden md:flex items-center gap-1 text-[9px] text-amber-400 font-mono">
        <kbd className="px-1 py-0.5 rounded bg-amber-800 text-amber-200">←→</kbd>
        导航
      </span>

      {/* Exit */}
      <button
        onClick={toggleLectureMode}
        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono
                   hover:bg-amber-700 text-amber-300 transition-colors ml-1"
        title="退出讲者模式"
      >
        <X className="w-3 h-3" />
        退出
      </button>
    </div>
  );
}
