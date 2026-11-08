import React, { useState, useMemo } from 'react';
import { EXPERIMENTS, type Experiment } from '../data/experiments';

const DOMAINS = [
  'All',
  'Architectures',
  'Tokenization',
  'Optimization',
  'Data & Registers',
  'Decoding',
  'Reproducibility'
] as const;

export default function ExperimentArchive() {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredExperiments = useMemo(() => {
    return EXPERIMENTS.filter((exp) => {
      const matchesDomain = selectedDomain === 'All' || exp.domain === selectedDomain;
      const matchesStatus = selectedStatus === 'All' || exp.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        exp.id.toLowerCase().includes(q) ||
        exp.title.toLowerCase().includes(q) ||
        exp.summary.toLowerCase().includes(q) ||
        exp.sourceIdentifier.toLowerCase().includes(q);

      return matchesDomain && matchesStatus && matchesSearch;
    });
  }, [selectedDomain, selectedStatus, searchQuery]);

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0e12]/80 backdrop-blur-sm mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments by ID, title, or keyword (e.g. E2608, BPE)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-white/10 bg-[#07080a] text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-indigo-500/50 focus:outline-none transition-colors"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Domain pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {DOMAINS.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedDomain === domain
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-600/30'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/[0.05]'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Count & Active status */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-6 px-1">
        <div>
          Showing <span className="text-slate-200 font-semibold">{filteredExperiments.length}</span> of {EXPERIMENTS.length} preregistered experiments
        </div>
        <div className="flex items-center gap-2">
          <span>Sort: Chronological (E2601 → E2636)</span>
        </div>
      </div>

      {/* Experiment Cards List */}
      <div className="flex flex-col gap-4">
        {filteredExperiments.map((exp) => {
          const isExpanded = expandedId === exp.id;
          return (
            <div
              key={exp.id}
              className={`rounded-2xl border transition-all duration-300 ${
                isExpanded
                  ? 'border-indigo-500/40 bg-[#0d1017]'
                  : 'border-white/[0.08] bg-[#0c0e12]/70 hover:border-white/20 hover:bg-[#0f121a]'
              }`}
            >
              {/* Card Header Row as Semantic Button */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                aria-expanded={isExpanded}
                aria-controls={`exp-details-${exp.id}`}
                className="w-full text-left p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
              >
                <div className="flex items-start md:items-center gap-4">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    {exp.id}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                      <span>{exp.title}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-500 mt-1">
                      <span>{exp.date}</span>
                      <span>·</span>
                      <span className="text-slate-400">{exp.domain}</span>
                      <span>·</span>
                      <span className="text-indigo-300/80">{exp.evidenceClass}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span
                    className={`font-mono text-[10px] px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                      exp.status === 'Completed' || exp.status === 'Measured'
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        : 'border-sky-500/30 text-sky-400 bg-sky-500/10'
                    }`}
                  >
                    {exp.status}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/[0.04] flex items-center justify-center text-slate-400">
                    <svg
                      className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Card Body (Summary) */}
              <div className="px-6 pb-4">
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                  {exp.summary}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <a
                    href={`/research/experiments/${exp.id}`}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>View Dedicated Experiment Record</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <span className="text-[11px] font-mono text-slate-500">
                    {isExpanded ? 'Click header to collapse' : 'Click header for preview'}
                  </span>
                </div>
              </div>

              {/* Expanded Detailed Breakdown */}
              {isExpanded && (
                <div id={`exp-details-${exp.id}`} className="px-6 pb-6 pt-4 border-t border-white/[0.06] flex flex-col gap-6 animate-fadeIn">
                  {/* Research Question & Methodology */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/[0.05] bg-black/30">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-400 block mb-1">Research Question</span>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">{exp.question}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/[0.05] bg-black/30">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-400 block mb-1">Experimental Methodology</span>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">{exp.methodology}</p>
                    </div>
                  </div>

                  {/* Measured Results */}
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block mb-2">Measured Empirical Results:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {exp.results.map((res, rIdx) => (
                        <div key={rIdx} className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-950/15">
                          <span className="font-mono text-[11px] text-emerald-400 font-medium block">{res.metric}</span>
                          <div className="font-mono text-sm font-bold text-white mt-0.5">{res.value}</div>
                          {res.baselineComparison && (
                            <div className="text-[11px] text-slate-400 font-sans mt-1">{res.baselineComparison}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Limitations & Non-Claims */}
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/15">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 block mb-1">Empirical Limitations</span>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{exp.limitations}</p>
                    <div className="mt-3 pt-3 border-t border-amber-500/20">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-1">What This Experiment Does NOT Establish:</span>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                        {exp.nonClaims.map((nc, ncIdx) => (
                          <li key={ncIdx}>{nc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Source Provenance Identifier */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-500 border-t border-white/[0.04]">
                    <div>
                      <span>Research basis: </span>
                      <span className="text-slate-300">{exp.sourceIdentifier}</span>
                    </div>
                    <div>
                      <span>Verified: {exp.lastVerifiedDate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
