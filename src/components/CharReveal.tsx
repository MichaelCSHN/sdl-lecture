import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

interface CharRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
  delay?: number;
}

export default function CharReveal({ text, className = '', as: Tag = 'h1', delay = 0 }: CharRevealProps) {
  const textRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el || hasAnimated.current) return;

    const split = SplitType.create(el, { types: 'words,chars' });
    if (!split.chars || split.chars.length === 0) return;

    hasAnimated.current = true;

    gsap.set(split.chars, { opacity: 0, y: 80, rotateZ: -10, scale: 0.8 });

    gsap.to(split.chars, {
      opacity: 1,
      y: 0,
      rotateZ: 0,
      scale: 1,
      stagger: 0.02,
      duration: 1.2,
      ease: 'power4.out',
      delay,
    });

    return () => {
      split.revert();
    };
  }, [delay]);

  return (
    <Tag ref={textRef as any} className={className}>
      {text}
    </Tag>
  );
}
