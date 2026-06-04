import { Link } from 'react-router';
import { BookOpen, Beaker, FlaskConical, ArrowRight } from 'lucide-react';
import { getLecturePathLectures } from '@/content/courseStructure';

const lecturePathLectures = getLecturePathLectures();

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2.5 glass-panel px-3 py-1.5 rounded mb-6">
          <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse" />
          <span className="text-[10px] text-[#8a92a3] font-mono tracking-wide">
            2026.06 — Graduate Lecture · Full Course Platform
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-[-1.5px] leading-[1.08] mb-5">
          AI-Era Materials Science Experiments
        </h1>
        <p className="text-lg md:text-xl text-[#8a92a3] max-w-2xl leading-relaxed mb-3">
          From DOE to Self-Driving Labs
        </p>
        <p className="text-sm text-[#8a92a3] max-w-xl leading-relaxed">
          A graduate-level course platform that places <em>experiment</em> — not algorithm — at the center.
          Covers the full arc from traditional experimental methodology to AI-era closed-loop autonomous laboratories.
        </p>
      </div>

      {/* Target audience */}
      <div className="mb-12">
        <h2 className="text-xs text-[#00f5d4] font-mono tracking-widest mb-3">WHO THIS IS FOR</h2>
        <div className="flex flex-wrap gap-2">
          {[
            'Materials / Chemistry / Physics grad students',
            'Advanced undergraduates with lab experience',
            'Researchers new to SDL & autonomous labs',
            'Lecturers & lab trainers',
          ].map((aud) => (
            <span
              key={aud}
              className="px-3 py-1.5 rounded-full text-xs font-mono border border-[rgba(67,97,238,0.2)] text-[#8a92a3]"
            >
              {aud}
            </span>
          ))}
        </div>
      </div>

      {/* Two phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="glass-panel p-5 rounded-lg border border-[rgba(0,245,212,0.15)]">
          <div className="text-[#00f5d4] font-mono text-[10px] tracking-widest mb-2">PHASE A — IMMEDIATE</div>
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">Lecture MVP</h3>
          <p className="text-xs text-[#8a92a3] leading-relaxed">
            A 3-hour graduate lecture path. Covers the core narrative: experiment history, DOE vs SDL comparison,
            SDL methodology, A-Lab case analysis, and live case demonstrations.
          </p>
        </div>
        <div className="glass-panel p-5 rounded-lg border border-[rgba(67,97,238,0.1)]">
          <div className="text-[#4361ee] font-mono text-[10px] tracking-widest mb-2">PHASE B — NORTH STAR</div>
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-2">Full Course Platform</h3>
          <p className="text-xs text-[#8a92a3] leading-relaxed">
            A complete digital curriculum. All 10 lectures with full content, MSE experiment taxonomy,
            Methods Lab, Case Studio with multiple cases, and Research Design Studio.
          </p>
        </div>
      </div>

      {/* Three entry points */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        <Link
          to="/course"
          className="glass-panel p-5 rounded-lg hover:border-[#00f5d4] transition-colors border border-[rgba(67,97,238,0.15)] no-underline group"
        >
          <BookOpen className="w-5 h-5 text-[#00f5d4] mb-3" />
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1 group-hover:text-[#00f5d4] transition-colors">
            Start the Course
          </h3>
          <p className="text-xs text-[#8a92a3] mb-3">
            Browse the full curriculum map. Follow the recommended learning path or jump to specific lectures.
          </p>
          <span className="text-[10px] text-[#00f5d4] font-mono inline-flex items-center gap-1">
            Course Map <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          to="/case-studio"
          className="glass-panel p-5 rounded-lg hover:border-[#00f5d4] transition-colors border border-[rgba(67,97,238,0.15)] no-underline group"
        >
          <Beaker className="w-5 h-5 text-[#00f5d4] mb-3" />
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1 group-hover:text-[#00f5d4] transition-colors">
            Case Studio
          </h3>
          <p className="text-xs text-[#8a92a3] mb-3">
            See SDL in action. Observe how parameters, observations, and recommendations form a closed loop.
          </p>
          <span className="text-[10px] text-[#00f5d4] font-mono inline-flex items-center gap-1">
            Open Studio <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          to="/a-lab"
          className="glass-panel p-5 rounded-lg hover:border-[#00f5d4] transition-colors border border-[rgba(67,97,238,0.15)] no-underline group"
        >
          <FlaskConical className="w-5 h-5 text-[#00f5d4] mb-3" />
          <h3 className="text-sm font-semibold text-[#d0d4dc] mb-1 group-hover:text-[#00f5d4] transition-colors">
            A-Lab Case File
          </h3>
          <p className="text-xs text-[#8a92a3] mb-3">
            Deep-dive into the A-Lab system. Not a timeline — a case file: problem, system, results, controversy.
          </p>
          <span className="text-[10px] text-[#00f5d4] font-mono inline-flex items-center gap-1">
            Read Case <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Lecture MVP path preview */}
      <div>
        <h2 className="text-xs text-[#00f5d4] font-mono tracking-widest mb-4">
          LECTURE MVP PATH ({lecturePathLectures.length} lectures)
        </h2>
        <div className="space-y-2">
          {lecturePathLectures.map((lec) => (
            <Link
              key={lec.id}
              to={lec.route}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[rgba(67,97,238,0.04)] transition-colors no-underline group"
            >
              <span className="text-[#00f5d4] font-mono text-xs w-6">{lec.num}</span>
              <span className="text-sm text-[#d0d4dc] group-hover:text-[#00f5d4] transition-colors">
                {lec.title}
              </span>
              <span className="text-[10px] text-[#8a92a3] font-mono ml-auto hidden sm:inline">
                Module {lec.module}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
