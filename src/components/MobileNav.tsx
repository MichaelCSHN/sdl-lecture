import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'home', label: '首页', icon: '🏠' },
  { id: 'background', label: '背景', icon: '📚' },
  { id: 'concept', label: '概念', icon: '🔄' },
  { id: 'casestudy', label: '案例', icon: '🧪' },
  { id: 'demos', label: '演示', icon: '🎮' },
  { id: 'challenges', label: '挑战', icon: '🚀' },
  { id: 'resources', label: '资源', icon: '📖' },
];

export default function MobileNav() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = SECTIONS.map((s) => document.getElementById(s.id));
      let closestIdx = 0;
      let closestDist = Infinity;
      sectionElements.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - window.innerHeight * 0.3);
        if (dist < closestDist) { closestDist = dist; closestIdx = i; }
      });
      setActiveIndex(closestIdx);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{ background: 'rgba(6,22,42,0.9)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(67,97,238,0.2)' }}>
      <div className="flex items-center justify-around px-2 py-1.5">
        {SECTIONS.map((section, i) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-all"
          >
            <span className="text-base">{section.icon}</span>
            <span className={`text-[9px] font-mono ${i === activeIndex ? 'text-[#00f5d4]' : 'text-[#8a92a3]'}`}>
              {section.label}
            </span>
            {i === activeIndex && (
              <span className="w-4 h-0.5 rounded-full bg-[#00f5d4]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
