import { NavLink } from 'react-router';
import { Video } from 'lucide-react';
import { useLecture } from '@/contexts/LectureContext';

const NAV_ITEMS = [
  { to: '/', label: '首页', exact: true },
  { to: '/course', label: '课程地图' },
  { to: '/foundations', label: '基础（Foundations）' },
  { to: '/ai-methods', label: 'AI/ML 方法' },
  { to: '/frontiers', label: '前沿（SOTA）' },
  { to: '/a-lab', label: 'A-Lab' },
  { to: '/case-studio', label: '案例工作台（Case Studio）' },
  { to: '/methods', label: '8 步工作流' },
  { to: '/design-studio', label: '设计工作室' },
  { to: '/resources', label: '资源（Resources）' },
];

export default function TopNav() {
  const { isLectureMode, toggleLectureMode } = useLecture();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-[rgba(67,97,238,0.15)] hidden lg:flex items-center px-6"
      style={{ background: 'rgba(0,13,29,0.92)', backdropFilter: 'blur(12px)' }}
    >
      <NavLink to="/" className="flex items-center gap-2.5 mr-8 flex-shrink-0 no-underline">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #00f5d4, #4361ee)', color: '#000d1d' }}
        >
          SDL
        </span>
        <span className="text-sm font-semibold tracking-tight text-[#d0d4dc]">
          AI 时代的材料科学实验
        </span>
      </NavLink>

      <nav className="flex items-center gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded text-xs font-mono transition-colors no-underline ${
                isActive
                  ? 'text-[#00f5d4] bg-[rgba(0,245,212,0.08)]'
                  : 'text-[#8a92a3] hover:text-[#d0d4dc] hover:bg-[rgba(67,97,238,0.04)]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggleLectureMode}
        title={isLectureMode ? '退出讲者模式' : '进入讲者模式'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono transition-all ${
          isLectureMode
            ? 'bg-amber-800 text-amber-200 border border-amber-700'
            : 'text-[#8a92a3] border border-[rgba(67,97,238,0.2)] hover:border-amber-700 hover:text-amber-300'
        }`}
      >
        <Video className="w-3.5 h-3.5" />
        {isLectureMode ? '讲者模式 ✓' : '讲者模式'}
      </button>
    </header>
  );
}
