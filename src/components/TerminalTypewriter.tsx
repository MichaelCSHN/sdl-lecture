import { useRef, useState, useCallback } from 'react';

const FULL_CODE = `## 实验规划方案 A-42

**目标**: 寻找更高导电率的钙钛矿

**前驱体**: PbI2, MAI, FAI

**建议反应温度**: 150°C

**预期表征**: XRD, Hall Effect

---

> 置信度: 87.3% | 预计合成成功率: 92%
> Materials Project ID: mp-990985`;

const TYPING_SPEED = 30;

interface TerminalTypewriterProps {
  onComplete?: () => void;
}

export default function TerminalTypewriter({ onComplete }: TerminalTypewriterProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const startTyping = useCallback(() => {
    if (isTyping || hasCompleted) return;

    setIsTyping(true);
    const startTime = Date.now();
    let currentIndex = 0;
    let garbageChars = '';

    const typeStep = () => {
      const elapsed = Date.now() - startTime;
      const realIndex = Math.floor(elapsed / TYPING_SPEED);

      if (realIndex <= 0) {
        if (codeRef.current) {
          codeRef.current.innerText = 'Simulating experiment plan...\n> ' + garbageChars;
        }
      } else {
        const targetText = FULL_CODE.substring(0, realIndex);
        const displayText = targetText + garbageChars;
        currentIndex = realIndex;

        if (codeRef.current) {
          codeRef.current.innerText = displayText;
        }
      }

      garbageChars += String.fromCharCode(33 + Math.random() * 93);
      const maxGarbageLen = Math.floor(Math.random() * 10);
      if (garbageChars.length > maxGarbageLen) {
        garbageChars = garbageChars.slice(-maxGarbageLen);
      }

      if (currentIndex < FULL_CODE.length) {
        intervalRef.current = requestAnimationFrame(typeStep);
      } else {
        setIsTyping(false);
        setHasCompleted(true);
        if (codeRef.current) {
          codeRef.current.innerText = FULL_CODE;
        }
        onComplete?.();
      }
    };

    intervalRef.current = requestAnimationFrame(typeStep);
  }, [isTyping, hasCompleted, onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="code-editor-bg p-6 font-mono text-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 border-b border-[rgba(67,97,238,0.2)] pb-3">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="ml-3 text-xs text-[#8a92a3]">AI Planner — Terminal</span>
        </div>
        <pre
          ref={codeRef}
          className="text-[#d0d4dc] whitespace-pre-wrap break-all min-h-[200px] leading-relaxed"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {'System Status: Awaiting research query...\n> '}
        </pre>
        {!isTyping && !hasCompleted && (
          <span className="inline-block w-2 h-4 bg-[#00f5d4] animate-pulse ml-1 align-middle" />
        )}
      </div>

      <div className="flex gap-3 mt-4 justify-center">
        <button
          onClick={startTyping}
          disabled={isTyping || hasCompleted}
          className="btn-glow px-6 py-2.5 bg-transparent border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-sm font-mono rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {hasCompleted ? 'Completed' : isTyping ? 'Processing...' : 'Generate Plan'}
        </button>
        {hasCompleted && (
          <>
            <button className="btn-glow px-6 py-2.5 bg-transparent border border-[rgba(67,97,238,0.3)] text-[#fee440] text-sm font-mono rounded transition-all">
              Approve Plan
            </button>
            <button className="btn-glow px-6 py-2.5 bg-transparent border border-[rgba(67,97,238,0.3)] text-[#8a92a3] text-sm font-mono rounded transition-all">
              Refine
            </button>
          </>
        )}
      </div>
    </div>
  );
}
