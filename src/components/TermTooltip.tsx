import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { lookupTerm } from '../data/glossary';

interface TermTooltipProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

export default function TermTooltip({ term, children, className = '' }: TermTooltipProps) {
  const [show, setShow] = useState(false);
  const entry = lookupTerm(term);
  const timeoutRef = useRef<number | null>(null);

  if (!entry) {
    return <span className={className}>{children}</span>;
  }

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(true);
  };

  const handleLeave = () => {
    timeoutRef.current = window.setTimeout(() => setShow(false), 150);
  };

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="border-b border-dashed border-[rgba(0,245,212,0.4)] cursor-help text-[#00f5d4]">
        {children}
      </span>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 z-50"
          >
            <div className="glass-panel p-3 text-xs">
              <div className="font-mono text-[#00f5d4] mb-1">
                {entry.abbr} — {entry.term}
              </div>
              <div className="text-[#d0d4dc] leading-relaxed">{entry.definition}</div>
              <div className="text-[#8a92a3] mt-1 leading-relaxed">{entry.definitionEn}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
