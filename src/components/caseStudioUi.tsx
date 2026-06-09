import { CircleHelp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function HelpTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-[#5a6377] hover:text-[#00f5d4] transition-colors">
          <CircleHelp className="w-3 h-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-[10px] leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export function FieldLabel({ label, help }: { label: string; help?: string }) {
  return (
    <div className="flex items-center gap-1 text-[10px] text-[#d0d4dc]">
      <span>{label}</span>
      {help ? <HelpTip text={help} /> : null}
    </div>
  );
}

export function Field({ label, help, control }: { label: string; help?: string; control: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <FieldLabel label={label} help={help} />
      {control}
    </div>
  );
}

export function MetricRow({
  label,
  value,
  help,
  highlight,
}: {
  label: string;
  value: string;
  help?: string;
  highlight?: 'blue' | 'cyan' | 'yellow';
}) {
  const valueClass =
    highlight === 'cyan'
      ? 'text-[#00f5d4]'
      : highlight === 'yellow'
        ? 'text-[#fee440]'
        : highlight === 'blue'
          ? 'text-[#4cc9f0]'
          : 'text-[#d0d4dc]';

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1 text-[#8a92a3]">
        <span>{label}</span>
        {help ? <HelpTip text={help} /> : null}
      </div>
      <div className={`font-mono ${valueClass}`}>{value}</div>
    </div>
  );
}

export function buttonClassName(kind: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost', disabled = false) {
  const base = 'inline-flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-mono border transition-colors';
  if (disabled) return `${base} opacity-50 cursor-not-allowed border-[rgba(67,97,238,0.08)] text-[#5a6377]`;
  switch (kind) {
    case 'primary':
      return `${base} bg-[rgba(0,245,212,0.12)] text-[#00f5d4] border-[rgba(0,245,212,0.28)] hover:bg-[rgba(0,245,212,0.18)]`;
    case 'secondary':
      return `${base} bg-[rgba(76,201,240,0.12)] text-[#4cc9f0] border-[rgba(76,201,240,0.28)] hover:bg-[rgba(76,201,240,0.18)]`;
    case 'danger':
      return `${base} bg-[rgba(255,107,107,0.12)] text-[#ff6b6b] border-[rgba(255,107,107,0.28)] hover:bg-[rgba(255,107,107,0.18)]`;
    case 'warning':
      return `${base} bg-[rgba(245,158,11,0.12)] text-[#f59e0b] border-[rgba(245,158,11,0.28)] hover:bg-[rgba(245,158,11,0.18)]`;
    case 'ghost':
      return `${base} bg-[rgba(67,97,238,0.08)] text-[#d0d4dc] border-[rgba(67,97,238,0.18)] hover:bg-[rgba(67,97,238,0.14)]`;
  }
}

export const selectClassName =
  'w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(0,13,29,0.65)] px-2 py-1.5 text-[10px] text-[#d0d4dc]';

export const inputClassName =
  'w-full rounded border border-[rgba(67,97,238,0.15)] bg-[rgba(0,13,29,0.65)] px-2 py-1.5 text-[10px] text-[#d0d4dc]';

export const plotConfig = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
} as const;
