import type { HistoricalMilestone } from '@/data/experimentNarrative';

interface ExperimentHistorySpineProps {
  milestones: HistoricalMilestone[];
}

export default function ExperimentHistorySpine({ milestones }: ExperimentHistorySpineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-[linear-gradient(180deg,rgba(0,245,212,0.05),rgba(67,97,238,0.35),rgba(255,107,107,0.2),rgba(0,245,212,0.05))] md:left-1/2 md:-translate-x-1/2" />
      <div className="space-y-6">
        {milestones.map((milestone, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div
              key={`${milestone.era}-${milestone.title}`}
              className="relative md:grid md:grid-cols-[1fr_72px_1fr] md:gap-6"
            >
              <div
                className={[
                  'pl-12 md:pl-0',
                  isLeft ? 'md:col-start-1 md:text-right' : 'md:col-start-3',
                ].join(' ')}
              >
                <article
                  className="glass-panel rounded-2xl p-5 md:p-6 border shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
                  style={{
                    borderColor: `${milestone.color}44`,
                    background:
                      'linear-gradient(180deg, rgba(8,20,37,0.94) 0%, rgba(6,22,42,0.82) 100%)',
                  }}
                >
                  <div
                    className={[
                      'text-[11px] font-mono tracking-[0.18em] uppercase mb-2',
                      isLeft ? 'md:justify-end' : '',
                    ].join(' ')}
                    style={{ color: milestone.color }}
                  >
                    {milestone.era}
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-[#f3f6fb] mb-2 leading-snug">
                    {milestone.title}
                  </h3>
                  <p className="text-xs md:text-[13px] text-[#9da8bb] leading-6 mb-4">
                    {milestone.summary}
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-[rgba(67,97,238,0.12)] bg-[rgba(255,255,255,0.02)] p-3 text-left">
                      <div className="text-[10px] font-mono tracking-[0.14em] text-[#5a6377] mb-1">
                        方法论增量
                      </div>
                      <div className="text-[11px] text-[#d8e0ec] leading-5">{milestone.methodGain}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(0,245,212,0.12)] bg-[rgba(255,255,255,0.02)] p-3 text-left">
                      <div className="text-[10px] font-mono tracking-[0.14em] text-[#5a6377] mb-1">
                        对 MSE 的回响
                      </div>
                      <div className="text-[11px] text-[#d8e0ec] leading-5">{milestone.mseEcho}</div>
                    </div>
                  </div>
                </article>
              </div>

              <div className="absolute left-4 top-7 -translate-x-1/2 md:static md:flex md:items-start md:justify-center md:pt-7">
                <span
                  className="block h-5 w-5 rounded-full border-4 border-[#000d1d] shadow-[0_0_0_4px_rgba(255,255,255,0.02)]"
                  style={{ backgroundColor: milestone.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
