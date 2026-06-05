import { NavLink, useLocation } from 'react-router';
import {
  Beaker,
  BookOpen,
  DraftingCompass,
  FlaskConical,
  Grid3X3,
  Menu,
  Network,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { useLecture } from '@/contexts/LectureContext';

const MAIN_ITEMS = [
  { to: '/', label: '首页', icon: Grid3X3, exact: true },
  { to: '/foundations', label: '基础', icon: BookOpen },
  { to: '/a-lab', label: 'A-Lab', icon: FlaskConical },
  { to: '/case-studio', label: '演示', icon: Beaker },
  { to: '/methods', label: '工作流', icon: Network },
];

const MORE_ITEMS = [
  { to: '/course', label: '课程地图', icon: Grid3X3 },
  { to: '/design-studio', label: 'Design Studio', icon: DraftingCompass },
  { to: '/resources', label: '资源', icon: BookOpen },
];

export default function MobileNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLectureMode, toggleLectureMode } = useLecture();

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{
          background: isLectureMode ? 'rgba(40,20,0,0.97)' : 'rgba(6,22,42,0.94)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${isLectureMode ? 'rgba(183,121,31,0.4)' : 'rgba(67,97,238,0.2)'}`,
        }}
      >
        <div className="flex items-center justify-around px-1 py-1.5">
          {MAIN_ITEMS.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded transition-colors no-underline ${
                  isActive ? 'text-[#00f5d4]' : 'text-[#8a92a3]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[9px] font-mono leading-none">{item.label}</span>
                {isActive && <span className="w-3 h-0.5 rounded-full bg-[#00f5d4]" />}
              </NavLink>
            );
          })}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded transition-colors ${
              menuOpen ? 'text-[#00f5d4]' : 'text-[#8a92a3]'
            }`}
          >
            <Menu className="w-4 h-4" />
            <span className="text-[9px] font-mono leading-none">更多</span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute bottom-16 left-4 right-4 rounded-lg border border-[rgba(67,97,238,0.2)] p-4"
            style={{ background: 'rgba(6,22,42,0.98)', backdropFilter: 'blur(16px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {MORE_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm font-mono transition-colors no-underline ${
                      isActive
                        ? 'text-[#00f5d4] bg-[rgba(0,245,212,0.06)]'
                        : 'text-[#5a6377]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}

              {/* Lecture mode toggle */}
              <div className="border-t border-[rgba(67,97,238,0.12)] pt-2 mt-1">
                <button
                  onClick={() => { toggleLectureMode(); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-mono transition-colors ${
                    isLectureMode
                      ? 'text-amber-300 bg-[rgba(183,121,31,0.12)]'
                      : 'text-[#5a6377] hover:text-amber-400'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  {isLectureMode ? '退出讲者模式 ✓' : '进入讲者模式'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
