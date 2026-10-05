import React, { useEffect, useState } from 'react';
import { X, FlaskConical, Play, CheckCircle2, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { Experiment, ExperimentResultsData } from '../types';
import { api } from '../api/client';

interface ExperimentResultsModalProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExperimentResultsModal: React.FC<ExperimentResultsModalProps> = ({
  experiment,
  isOpen,
  onClose,
}) => {
  const [results, setResults] = useState<ExperimentResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    if (!experiment) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getExperimentResults(experiment.id);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load experiment results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && experiment) {
      fetchResults();
    } else {
      setResults(null);
    }
  }, [isOpen, experiment]);

  if (!isOpen || !experiment) return null;

  const handleSimulateTraffic = async (sampleSize: number = 60) => {
    setSimulating(true);
    try {
      const variants = experiment.variants;
      const controlKey = variants[0]?.key || 'control';

      for (let i = 0; i < sampleSize; i++) {
        const random = Math.random() * 100;
        let cumulative = 0;
        let selectedVariant = variants[0]?.key || 'control';

        for (const v of variants) {
          cumulative += v.weight;
          if (random <= cumulative) {
            selectedVariant = v.key;
            break;
          }
        }

        const contextId = `sim-user-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`;

        await api.trackEvent({
          experimentKey: experiment.key,
          contextId,
          variantKey: selectedVariant,
          type: 'EXPOSURE',
          environmentId: experiment.environmentId,
        });

        const conversionRate = selectedVariant === controlKey ? 0.08 : 0.19;
        if (Math.random() < conversionRate) {
          await api.trackEvent({
            experimentKey: experiment.key,
            contextId,
            variantKey: selectedVariant,
            type: 'CONVERSION',
            value: 1,
            environmentId: experiment.environmentId,
          });
        }
      }

      await fetchResults();
    } catch (err: any) {
      setError(err.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const variants = experiment.variants || [];
  const controlVariant = variants[0];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0c0e12] border border-[#23272f] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b1e24] bg-[#07090c]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-800/40 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">{experiment.name}</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  {experiment.key}
                </span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full border ${
                  experiment.enabled
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
                    : 'bg-dark-800 text-slate-400 border-dark-700'
                }`}>
                  {experiment.enabled ? 'Running' : 'Paused'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Frequentist Two-Proportion Z-Test Statistical Evaluation (95% Confidence, α = 0.05)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateTraffic(50)}
              disabled={simulating || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a2333] hover:bg-[#202c42] border border-cyan-800/50 text-cyan-300 text-xs font-medium transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400" />
              <span>{simulating ? 'Simulating...' : 'Simulate 50 Events'}</span>
            </button>
            <button
              onClick={fetchResults}
              disabled={loading}
              className="p-1.5 rounded-lg bg-[#14171d] border border-[#23272f] text-slate-400 hover:text-white transition"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1d23] transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#12151b] border border-[#1e222a] rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Total Events
              </span>
              <p className="text-2xl font-bold text-white font-mono mt-1">
                {results?.totalEvents ?? 0}
              </p>
              <span className="text-[11px] text-slate-500">Exposures & Conversions logged</span>
            </div>
            <div className="bg-[#12151b] border border-[#1e222a] rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Active Variants
              </span>
              <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">
                {variants.length}
              </p>
              <span className="text-[11px] text-slate-500">
                Control: {controlVariant?.key || 'control'}
              </span>
            </div>
            <div className="bg-[#12151b] border border-[#1e222a] rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Significance Status
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                {Object.values(results?.significanceResults || {}).some((s) => s?.isSignificant) ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Winner Detected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-400" /> Collecting Data
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">Threshold: p-value ≤ 0.05</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Variant Conversion Breakdown
            </h3>
            <div className="space-y-3">
              {variants.map((v) => {
                const stats = results?.variantStats[v.key] || {
                  exposures: 0,
                  conversions: 0,
                  conversionRate: 0,
                };
                const ratePercent = (stats.conversionRate * 100).toFixed(2);
                const isControl = v.key === controlVariant?.key;

                return (
                  <div
                    key={v.key}
                    className="p-4 rounded-xl bg-[#12151b] border border-[#1e222a] flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{v.name || v.key}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1e27] text-slate-400 border border-[#262b37]">
                          {v.key}
                        </span>
                        {isControl && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                            Baseline Control
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-slate-400">
                          Exposures: <strong className="text-white">{stats.exposures}</strong>
                        </span>
                        <span className="text-slate-400">
                          Conversions: <strong className="text-white">{stats.conversions}</strong>
                        </span>
                        <span className="text-cyan-400 font-bold text-sm">{ratePercent}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#1b1f28] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isControl ? 'bg-slate-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, stats.conversionRate * 100 * 3))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Two-Proportion Z-Test Significance vs Control</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-[#1e222a]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1015] text-slate-400 font-mono text-[11px] border-b border-[#1e222a]">
                  <tr>
                    <th className="py-2.5 px-4">Variant</th>
                    <th className="py-2.5 px-4">Baseline vs Variant Rate</th>
                    <th className="py-2.5 px-4">Relative Lift</th>
                    <th className="py-2.5 px-4">Z-Score</th>
                    <th className="py-2.5 px-4">P-Value</th>
                    <th className="py-2.5 px-4 text-right">Confidence (95%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181c24] bg-[#12151b] font-mono">
                  {variants
                    .filter((v) => v.key !== controlVariant?.key)
                    .map((v) => {
                      const sig = results?.significanceResults[v.key];
                      const isSignificant = sig?.isSignificant ?? false;
                      const lift = sig ? `${sig.relativeLift >= 0 ? '+' : ''}${sig.relativeLift.toFixed(2)}%` : '0.00%';
                      const z = sig?.zScore ? sig.zScore.toFixed(3) : '0.000';
                      const p = sig?.pValue !== undefined ? sig.pValue.toFixed(4) : '1.0000';

                      return (
                        <tr key={v.key} className="hover:bg-[#161a22] transition">
                          <td className="py-3 px-4 font-sans font-medium text-white">
                            {v.name || v.key}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {sig ? `${(sig.controlConversionRate * 100).toFixed(2)}% → ${(sig.variantConversionRate * 100).toFixed(2)}%` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={sig && sig.relativeLift > 0 ? 'text-emerald-400 font-bold' : sig && sig.relativeLift < 0 ? 'text-rose-400' : 'text-slate-400'}>
                              {lift}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{z}</td>
                          <td className="py-3 px-4 text-slate-300">{p}</td>
                          <td className="py-3 px-4 text-right">
                            {isSignificant ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-sans font-semibold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Significant (p ≤ 0.05)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-dark-800 text-slate-400 border border-dark-700 font-sans text-[11px]">
                                Not Significant (p &gt; 0.05)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
