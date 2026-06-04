import { NavLink } from 'react-router';

const NAV_ITEMS = [
  { to: '/', label: '首页', exact: true },
  { to: '/course', label: '课程' },
  { to: '/foundations', label: '基础' },
  { to: '/a-lab', label: 'A-Lab' },
  { to: '/case-studio', label: '演示' },
  { to: '/led-calibration', label: '定标' },
  { to: '/sdl-demo', label: 'Bench' },
];

export default function TopNav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[rgba(67,97,238,0.15)] hidden lg:flex items-center px-6"
      style={{ background: 'rgba(0,13,29,0.92)', backdropFilter: 'blur(12px)' }}
    >
      {/* Brand */}
      <NavLink to="/" className="flex items-center gap-2.5 mr-8 flex-shrink-0">
        <span className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #00f5d4, #4361ee)', color: '#000d1d' }}>
          SDL
        </span>
        <span className="text-sm font-semibold tracking-tight text-[#d0d4dc]">
          AI 时代的材料实验
        </span>
      </NavLink>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded text-xs font-mono transition-colors ${
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
    </header>
  );
}
