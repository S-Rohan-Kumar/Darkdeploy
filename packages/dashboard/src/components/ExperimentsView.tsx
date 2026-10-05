import React, { useState } from 'react';
import { FlaskConical, Plus, Search, Trash2, BarChart2 } from 'lucide-react';
import { Environment, Experiment } from '../types';

interface ExperimentsViewProps {
  experiments: Experiment[];
  environment: Environment | null;
  onToggleExperiment: (experiment: Experiment) => Promise<void>;
  onViewResults: (experiment: Experiment) => void;
  onDeleteExperiment: (experiment: Experiment) => Promise<void>;
  onCreateExperiment: () => void;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({
  experiments,
  environment,
  onToggleExperiment,
  onViewResults,
  onDeleteExperiment,
  onCreateExperiment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = experiments.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.key.toLowerCase().includes(q) ||
      (e.description && e.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0c0e12] overflow-hidden">
      <header className="px-6 py-4 border-b border-[#1b1e24] bg-[#07090c] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-800/40 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">Experimentation</h1>
            <p className="text-xs text-slate-400">
              A/B testing, multi-variant allocation, and two-proportion z-test significance in{' '}
              <span className="text-cyan-400 font-mono font-medium">{environment?.name || 'Environment'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#14171d] border border-[#23272f] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64 transition"
            />
          </div>

          <button
            onClick={onCreateExperiment}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Experiment</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#23272f] rounded-xl bg-[#0e1015]">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center mb-3">
              <FlaskConical className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">No experiments found</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Create an A/B experiment to split traffic deterministically across variants and compute frequentist z-test confidence.
            </p>
            <button
              onClick={onCreateExperiment}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Experiment</span>
            </button>
          </div>
        ) : (
          <div className="border border-[#1e222a] rounded-xl overflow-hidden bg-[#12151b]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1015] text-slate-400 font-mono text-[11px] border-b border-[#1e222a]">
                <tr>
                  <th className="py-3 px-4 w-16">Status</th>
                  <th className="py-3 px-4">Name & Key</th>
                  <th className="py-3 px-4">Variants Split</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c24]">
                {filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#161a22] transition">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onToggleExperiment(exp)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          exp.enabled ? 'bg-cyan-500' : 'bg-[#262b37]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                            exp.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-xs">{exp.name}</div>
                      <div className="font-mono text-[11px] text-cyan-400 mt-0.5">{exp.key}</div>
                      {exp.description && (
                        <p className="text-[11px] text-slate-400 mt-1 max-w-md line-clamp-1">
                          {exp.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {exp.variants?.map((v) => (
                          <span
                            key={v.key}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#181c25] border border-[#272d3b] text-[11px] font-mono text-slate-300"
                          >
                            <span className="text-white font-medium">{v.name || v.key}:</span>
                            <span className="text-cyan-400">{v.weight}%</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewResults(exp)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 text-xs font-medium transition"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>Results & Z-Test</span>
                        </button>
                        <button
                          onClick={() => onDeleteExperiment(exp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-[#1f232b] transition"
                          title="Delete Experiment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
