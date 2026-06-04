import { NavLink, useLocation } from 'react-router';
import { BookOpen, Beaker, FlaskConical, Grid3X3, Menu, Lightbulb } from 'lucide-react';
import { useState } from 'react';

const MAIN_ITEMS = [
  { to: '/', label: '首页', icon: Grid3X3, exact: true },
  { to: '/course', label: '课程', icon: BookOpen },
  { to: '/foundations', label: '基础', icon: Lightbulb },
  { to: '/a-lab', label: 'A-Lab', icon: FlaskConical },
  { to: '/case-studio', label: '演示', icon: Beaker },
];

const MORE_ITEMS = [
  { to: '/methods', label: '方法（扩展）', icon: Lightbulb },
  { to: '/design-studio', label: '设计（扩展）', icon: Grid3X3 },
  { to: '/resources', label: '资源（扩展）', icon: BookOpen },
];

export default function MobileNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{
          background: 'rgba(6,22,42,0.94)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(67,97,238,0.2)',
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
                className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded transition-colors ${
                  isActive ? 'text-[#00f5d4]' : 'text-[#8a92a3]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[9px] font-mono leading-none">{item.label}</span>
                {isActive && <span className="w-3 h-0.5 rounded-full bg-[#00f5d4]" />}
              </NavLink>
            );
          })}

          {/* More button */}
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

      {/* More menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute bottom-16 left-4 right-4 rounded-lg border border-[rgba(67,97,238,0.2)] p-4"
            style={{ background: 'rgba(6,22,42,0.98)', backdropFilter: 'blur(16px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {MORE_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.to.split('（')[0]);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm font-mono transition-colors ${
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
