import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'home', label: 'Home', labelCn: '首页' },
  { id: 'background', label: 'Background', labelCn: '背景知识' },
  { id: 'concept', label: 'Concept', labelCn: 'SDL概念' },
  { id: 'casestudy', label: 'A-Lab', labelCn: '案例' },
  { id: 'demos', label: 'Demos', labelCn: '互动演示' },
  { id: 'challenges', label: 'Future', labelCn: '挑战未来' },
  { id: 'resources', label: 'Resources', labelCn: '资源' },
];

export default function SideNav() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setVisible(scrollY > 300);

      const sectionElements = SECTIONS.map((s) => document.getElementById(s.id));
      let closestIdx = 0;
      let closestDist = Infinity;

      sectionElements.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - window.innerHeight * 0.25);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });

      setActiveIndex(closestIdx);

      // Mark visited sections
      sectionElements.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setVisited((prev) => new Set([...prev, i]));
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -20 }}
      transition={{ duration: 0.3 }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center"
    >
      {/* Line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-[rgba(67,97,238,0.15)]" />

      {/* Active indicator */}
      <motion.div
        className="absolute left-1/2 w-0.5 rounded-full bg-[#00f5d4]"
        style={{ transform: 'translateX(-50%)' }}
        animate={{
          top: `${(activeIndex / (SECTIONS.length - 1)) * 100}%`,
          height: `${100 / SECTIONS.length}%`,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {/* Progress indicator */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-[#8a92a3] font-mono whitespace-nowrap">
        {visited.size}/{SECTIONS.length}
      </div>

      {/* Dots */}
      <div className="relative flex flex-col justify-between" style={{ height: `${SECTIONS.length * 40}px` }}>
        {SECTIONS.map((section, i) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="relative z-10 w-8 h-8 flex items-center justify-center group"
            title={`${section.labelCn} — ${section.label}`}
          >
            <div className="relative">
              {/* Visited ring */}
              {visited.has(i) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 -m-1 rounded-full border border-[rgba(0,245,212,0.3)]"
                />
              )}
              <motion.div
                className="rounded-full transition-colors"
                animate={{
                  width: i === activeIndex ? 10 : 6,
                  height: i === activeIndex ? 10 : 6,
                  backgroundColor: i === activeIndex ? '#00f5d4' : visited.has(i) ? 'rgba(0,245,212,0.5)' : 'rgba(67,97,238,0.3)',
                }}
              />
            </div>
            {/* Tooltip */}
            <span className="absolute left-full ml-3 px-2 py-1 bg-[rgba(6,22,42,0.95)] border border-[rgba(67,97,238,0.2)] rounded text-[10px] text-[#8a92a3] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {section.labelCn}
            </span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
}
