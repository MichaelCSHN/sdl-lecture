import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import QRCodeGenerator from '../components/QRCodeGenerator';

const PAPERS = [
  {
    title: 'An autonomous laboratory for the accelerated synthesis of novel materials',
    authors: 'Szymanski, N. J. et al.',
    journal: 'Nature, 624, 86-91 (2023)',
    doi: '10.1038/s41586-023-06734-w',
    url: 'https://www.nature.com/articles/s41586-023-06734-w',
    highlight: true,
    bibtex: `@article{szymanski2023autonomous,\n  title={An autonomous laboratory for the accelerated synthesis of novel materials},\n  author={Szymanski, Nathan J. and others},\n  journal={Nature},\n  volume={624},\n  pages={86--91},\n  year={2023},\n  publisher={Nature Publishing Group}\n}`,
  },
  {
    title: 'Self-driving laboratories for chemistry and materials science',
    authors: 'Tom, G. M. R. et al.',
    journal: 'Chemical Reviews, 124, 9633 (2024)',
    doi: '10.1021/acs.chemrev.3c00704',
    url: 'https://pubs.acs.org/doi/10.1021/acs.chemrev.3c00704',
    highlight: false,
    bibtex: `@article{tom2024selfdriving,\n  title={Self-driving laboratories for chemistry and materials science},\n  author={Tom, G. M. R. and others},\n  journal={Chemical Reviews},\n  volume={124},\n  pages={9633},\n  year={2024},\n  publisher={American Chemical Society}\n}`,
  },
  {
    title: 'Autonomous chemical research with large language models',
    authors: 'Boiko, D. A. et al.',
    journal: 'Nature, 624, 570-578 (2023)',
    doi: '10.1038/s41586-023-06792-0',
    url: 'https://www.nature.com/articles/s41586-023-06792-0',
    highlight: true,
    bibtex: `@article{boiko2023autonomous,\n  title={Autonomous chemical research with large language models},\n  author={Boiko, Dmitrii A. and others},\n  journal={Nature},\n  volume={624},\n  pages={570--578},\n  year={2023},\n  publisher={Nature Publishing Group}\n}`,
  },
  {
    title: 'Atlas: a brain for self-driving laboratories',
    authors: 'Hickman, R. J. et al.',
    journal: 'Digital Discovery (2025)',
    doi: '10.1039/D4DD00405A',
    url: 'https://pubs.rsc.org/en/content/articlelanding/2025/dd/d4dd00405a',
    highlight: false,
    bibtex: `@article{hickman2025atlas,\n  title={Atlas: a brain for self-driving laboratories},\n  author={Hickman, Riley J. and others},\n  journal={Digital Discovery},\n  year={2025},\n  publisher={Royal Society of Chemistry}\n}`,
  },
  {
    title: 'BayBE: a Bayesian Back End for experimental planning',
    authors: 'Schmidt, C. et al.',
    journal: 'Digital Discovery, 4, 1991-2000 (2025)',
    doi: '10.1039/D4DD00495A',
    url: 'https://pubs.rsc.org/en/content/articlelanding/2025/dd/d4dd00495a',
    highlight: false,
    bibtex: `@article{schmidt2025baybe,\n  title={BayBE: a Bayesian Back End for experimental planning in the low-to-no-data regime},\n  author={Schmidt, Christian and others},\n  journal={Digital Discovery},\n  volume={4},\n  pages={1991--2000},\n  year={2025},\n  publisher={Royal Society of Chemistry}\n}`,
  },
  {
    title: 'Review of low-cost self-driving laboratories: The Frugal Twin concept',
    authors: 'Lo, S. et al.',
    journal: 'Digital Discovery (2024)',
    doi: '10.1039/D4DD00289A',
    url: 'https://pubs.rsc.org/en/content/articlelanding/2024/dd/d4dd00289a',
    highlight: false,
    bibtex: `@article{lo2024frugal,\n  title={Review of low-cost self-driving laboratories: The Frugal Twin concept},\n  author={Lo, S. and others},\n  journal={Digital Discovery},\n  year={2024},\n  publisher={Royal Society of Chemistry}\n}`,
  },
  {
    title: "New analysis raises doubts over autonomous lab's materials discoveries",
    authors: 'Chemistry World (News)',
    journal: 'Chemistry World, 2024',
    doi: '',
    url: 'https://www.chemistryworld.com/news/new-analysis-raises-doubts-over-autonomous-labs-materials-discoveries/4018791.article',
    highlight: false,
    bibtex: '',
  },
];

const TOOLS = [
  { label: 'A-Lab (Ceder Group)', url: 'https://ceder.berkeley.edu/research-areas/autonomous-experimentation-for-accelerated-materials-discovery/', desc: '自主实验室主页' },
  { label: 'Materials Project', url: 'https://next-gen.materialsproject.org/', desc: '材料计算数据库' },
  { label: 'BayBE GitHub', url: 'https://github.com/emdgroup/baybe', desc: 'Merck开源BO工具箱' },
  { label: 'Honegumi', url: 'https://honegumi.readthedocs.io/', desc: 'BO代码生成器' },
  { label: 'Atlas GitHub', url: 'https://github.com/aspuru-guzik-group/atlas', desc: 'SDL "大脑"' },
  { label: 'self-driving-lab-demo', url: 'https://github.com/sparks-baird/self-driving-lab-demo', desc: '教学演示包' },
  { label: 'EDBO+', url: 'https://www.edbowebapp.com/', desc: '多目标BO反应优化' },
  { label: 'AC Microcourses', url: 'https://ac-microcourses.readthedocs.io/', desc: 'SDL认证课程' },
  { label: 'Awesome SDL', url: 'https://github.com/AccelerationConsortium/awesome-self-driving-labs', desc: '资源合集' },
  { label: 'Awesome BO', url: 'https://github.com/materials-data-facility/awesome-bayesian-optimization', desc: 'BO资源合集' },
];

export default function ResourcesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' });
  const [copiedBibtex, setCopiedBibtex] = useState<string | null>(null);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sections = ['home', 'background', 'concept', 'casestudy', 'demos', 'challenges', 'resources'];
    const visited = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visited.add(entry.target.id);
        });
        setProgress(Math.round((visited.size / sections.length) * 100));
      },
      { threshold: 0.2 }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleCopyBibtex = (bibtex: string, doi: string) => {
    navigator.clipboard.writeText(bibtex).then(() => {
      setCopiedBibtex(doi);
      setTimeout(() => setCopiedBibtex(null), 2000);
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    });
  };

  return (
    <section id="resources" ref={sectionRef} className="relative py-32 md:py-40" style={{ background: 'linear-gradient(180deg, #000d1d 0%, #06162a 100%)' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-12">
          <div className="text-[#fee440] font-mono text-xs tracking-widest mb-3">07 — RESOURCES & SUMMARY</div>
          <h2 className="text-3xl md:text-[32px] font-semibold tracking-[-0.96px] mb-4">资源与总结</h2>
          <p className="text-[#8a92a3] max-w-2xl leading-relaxed">
            讲座结束后的持续学习路径。论文、工具和社区资源将帮助你深入探索自主实验室领域。
          </p>
        </motion.div>

        {/* Papers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-[#00f5d4] font-mono tracking-wider">KEY PAPERS</div>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(PAPERS.map(p => p.bibtex).join('\n\n')); }}
                className="text-[10px] text-[#8a92a3] hover:text-[#00f5d4] font-mono transition-colors flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                复制全部
              </button>
              <button onClick={() => {
                const blob = new Blob([PAPERS.map(p => p.bibtex).join('\n\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'sdl_references.bib'; a.click();
                URL.revokeObjectURL(url);
              }} className="text-[10px] text-[#00f5d4] hover:text-[#fee440] font-mono transition-colors flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                下载 .bib
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {PAPERS.map((paper, i) => (
              <div key={i} className={`p-4 border rounded-lg transition-all hover:border-[rgba(0,245,212,0.2)] ${paper.highlight ? 'border-[rgba(254,228,64,0.2)] bg-[rgba(254,228,64,0.02)]' : 'border-[rgba(67,97,238,0.12)] bg-[rgba(6,22,42,0.5)]'}`}>
                <div className="flex items-start gap-3">
                  {paper.highlight && <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] bg-[rgba(254,228,64,0.12)] text-[#fee440] rounded font-mono">KEY</span>}
                  <div className="flex-1 min-w-0">
                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#d0d4dc] font-medium leading-snug hover:text-[#00f5d4] transition-colors block mb-1">
                      {paper.title}
                    </a>
                    <p className="text-xs text-[#8a92a3] font-mono">{paper.authors} — {paper.journal}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-[#00f5d4] font-mono">DOI: {paper.doi}</span>
                      <button
                        onClick={() => handleCopyBibtex(paper.bibtex, paper.doi)}
                        className="text-[10px] text-[#8a92a3] hover:text-[#00f5d4] font-mono transition-colors flex items-center gap-1"
                      >
                        {copiedBibtex === paper.doi ? '✓ 已复制' : 'Copy BibTeX'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tools grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }} className="mb-12">
          <div className="text-xs text-[#00f5d4] font-mono tracking-wider mb-4">TOOLS & LINKS</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TOOLS.map((tool, i) => (
              <a key={i} href={tool.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-[rgba(67,97,238,0.12)] rounded-lg hover:border-[rgba(0,245,212,0.3)] bg-[rgba(6,22,42,0.5)] transition-all group">
                <div className="w-8 h-8 rounded border border-[rgba(67,97,238,0.2)] flex items-center justify-center flex-shrink-0 group-hover:border-[#00f5d4] transition-colors">
                  <svg className="w-3.5 h-3.5 text-[#8a92a3] group-hover:text-[#00f5d4] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#d0d4dc] font-mono group-hover:text-[#00f5d4] transition-colors truncate">{tool.label}</div>
                  <div className="text-[10px] text-[#8a92a3]">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Q&A placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.5 }} className="mb-12">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#00f5d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <h3 className="text-sm font-semibold font-mono text-[#d0d4dc]">Q&A 讨论区</h3>
            </div>
            <p className="text-xs text-[#8a92a3] mb-4">
              课后继续提问。讲座讲者和社区成员将参与回答。
            </p>
            <div className="bg-[#0a1628] border border-[rgba(67,97,238,0.15)] rounded-lg p-4 text-center">
              <p className="text-xs text-[#8a92a3] font-mono">
                Q&A 功能将在讲座后开放<br />
                请通过邮件或 Slack 渠道提交问题
              </p>
            </div>
          </div>
        </motion.div>

        {/* Share & summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.6 }} className="text-center mb-16">
          <h3 className="text-sm font-semibold font-mono text-[#d0d4dc] mb-4">分享本讲座</h3>
          <div className="flex justify-center gap-3 mb-6">
            <button onClick={handleShare}
              className="btn-glow px-6 py-2.5 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-sm font-mono rounded-lg flex items-center gap-2 relative">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              复制链接
              {shareTooltip && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#00f5d4] text-[#000d1d] text-[10px] font-mono rounded whitespace-nowrap">
                  已复制！
                </span>
              )}
            </button>
            <QRCodeGenerator url={typeof window !== 'undefined' ? window.location.href : 'https://github.com/MichaelCSHN/sdl-lecture'} />
          </div>

          {/* Learning progress */}
          <div className="glass-panel p-4 max-w-2xl mx-auto mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#8a92a3] font-mono">学习进度</span>
              <span className="text-[10px] text-[#00f5d4] font-mono">{progress}% 完成</span>
            </div>
            <div className="h-1.5 bg-[rgba(67,97,238,0.1)] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#00f5d4] transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Summary takeaway */}
          <div className="glass-panel p-6 max-w-2xl mx-auto text-left">
            <div className="text-xs text-[#00f5d4] font-mono tracking-wider mb-3">LECTURE SUMMARY</div>
            <p className="text-sm text-[#d0d4dc] leading-relaxed mb-3">
              本次讲座系统介绍了自主实验室（SDL）的核心概念、技术原理与前沿进展。以 A-Lab 为案例，
              我们展示了 AI + 机器人 + 实验闭环如何加速材料发现。你带走了：
            </p>
            <ul className="text-xs text-[#8a92a3] space-y-1.5 mb-4">
              {[
                '对 SDL 闭环架构的深入理解（AI Planner → 机器人 → 合成 → 表征 → 反馈）',
                'Bayesian Optimization 的核心原理与交互体验',
                'A-Lab 案例的验证讨论与科学严谨性认知',
                '完整的论文、工具和学习资源列表',
                '思考自己课题 SDL 化的分析框架',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#00f5d4] mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-glow px-6 py-2 border border-[rgba(67,97,238,0.3)] text-[#00f5d4] text-xs font-mono rounded"
              >
                ↑ 回到顶部
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[rgba(67,97,238,0.1)] pt-10 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="text-sm font-mono text-[#d0d4dc] mb-1">自主实验室与闭环发现</div>
              <div className="text-xs text-[#8a92a3] font-mono">Self-driving Labs — 2026 Materials Intelligence Lecture</div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs text-[#8a92a3] font-mono">Built for Science.</span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
