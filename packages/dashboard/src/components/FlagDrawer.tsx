import React, { useState } from 'react';
import { X, Plus, Trash2, Sliders, Check, Bot } from 'lucide-react';
import { Flag, TargetingRule, Operator, AIConfig } from '../types';

interface FlagDrawerProps {
  flag: Flag | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (flagId: string, updates: Partial<Flag>) => Promise<void>;
}

const OPERATORS: Operator[] = [
  'EQUALS',
  'NOT_EQUALS',
  'IN',
  'NOT_IN',
  'CONTAINS',
  'STARTS_WITH',
  'ENDS_WITH',
  'GREATER_THAN',
  'LESS_THAN',
];

const POPULAR_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'meta-llama-3.1-70b',
];

export const FlagDrawer: React.FC<FlagDrawerProps> = ({
  flag,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !flag) return null;

  const [rolloutPercentage, setRolloutPercentage] = useState(flag.rolloutPercentage ?? 0);
  const [defaultValue, setDefaultValue] = useState(flag.defaultValue ?? false);
  const [flagType, setFlagType] = useState(flag.type ?? 'BOOLEAN');
  const [aiConfig, setAiConfig] = useState<AIConfig>(
    flag.aiConfig || {
      model: 'gpt-4o',
      temperature: 0.7,
      systemPrompt: 'You are a helpful, concise AI assistant.',
    }
  );
  const [rules, setRules] = useState<TargetingRule[]>(
    flag.rules?.map((r) => ({
      attribute: r.attribute,
      operator: r.operator,
      values: [...r.values],
      serveValue: r.serveValue ?? true,
    })) || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const addRule = () => {
    setRules([
      ...rules,
      {
        attribute: 'plan',
        operator: 'EQUALS',
        values: ['enterprise'],
        serveValue: true,
      },
    ]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, patch: Partial<TargetingRule>) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], ...patch };
    setRules(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(flag.id, {
        rolloutPercentage,
        defaultValue,
        rules,
        type: flagType,
        aiConfig: flagType === 'AI_CONFIG' ? aiConfig : null,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-150">
      <div className="bg-[#0c0e12] border-l border-[#1f232b] w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b1e24] bg-[#07090c]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">{flag.name}</h2>
              <span className="text-[10px] text-amber-400 font-bold">◆</span>
              {flagType === 'AI_CONFIG' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                  <Bot className="w-3 h-3" /> AI Config
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-cyan-400 mt-0.5">{flag.key}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1d23] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-[#12151c] border border-[#1e222a] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Flag Type</span>
              <div className="flex items-center gap-1 bg-[#0c0e12] p-1 rounded-lg border border-[#23272f]">
                <button
                  type="button"
                  onClick={() => setFlagType('BOOLEAN')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    flagType === 'BOOLEAN' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Boolean
                </button>
                <button
                  type="button"
                  onClick={() => setFlagType('AI_CONFIG')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    flagType === 'AI_CONFIG' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AI Config
                </button>
              </div>
            </div>
          </div>

          {flagType === 'AI_CONFIG' && (
            <div className="bg-[#12151c] border border-cyan-900/40 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                <span>AI Prompt & Model Hyperparameters</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Foundation Model
                  </label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#23272f] rounded-md px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  >
                    {POPULAR_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Temperature
                    </label>
                    <span className="text-xs font-mono text-cyan-400">{aiConfig.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={aiConfig.temperature}
                    onChange={(e) => setAiConfig({ ...aiConfig, temperature: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  System Prompt
                </label>
                <textarea
                  rows={4}
                  value={aiConfig.systemPrompt}
                  onChange={(e) => setAiConfig({ ...aiConfig, systemPrompt: e.target.value })}
                  placeholder="System instructions and persona prompt for the AI..."
                  className="w-full bg-[#0c0e12] border border-[#23272f] rounded-md px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition resize-none"
                />
              </div>
            </div>
          )}

          <div className="bg-[#12151c] border border-[#1e222a] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Deterministic Percentage Rollout</span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {rolloutPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Context IDs are deterministically hashed via SHA-1 to receive feature access.
            </p>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={rolloutPercentage}
              onChange={(e) => setRolloutPercentage(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex items-center justify-between pt-2 border-t border-[#1e222a] text-xs">
              <span className="text-slate-400">Fallback default value:</span>
              <select
                value={defaultValue ? 'true' : 'false'}
                onChange={(e) => setDefaultValue(e.target.value === 'true')}
                className="bg-[#0c0e12] border border-[#23272f] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="false">false (Off)</option>
                <option value="true">true (On)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-200">Targeting Rules</h3>
                <p className="text-[11px] text-slate-400">
                  Rules evaluate top-to-bottom with first-match priority.
                </p>
              </div>
              <button
                onClick={addRule}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1a1e27] hover:bg-[#222733] border border-[#262b37] text-xs font-medium text-slate-200 transition"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add rule</span>
              </button>
            </div>

            {rules.length === 0 ? (
              <div className="p-4 border border-dashed border-[#23272f] rounded-lg text-center text-xs text-slate-500">
                No rules configured. All evaluations fall through to the percentage rollout.
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="bg-[#12151c] border border-[#1e222a] rounded-lg p-3 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Rule #{idx + 1}
                      </span>
                      <button
                        onClick={() => removeRule(idx)}
                        className="text-slate-500 hover:text-red-400 transition p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          Attribute
                        </label>
                        <input
                          type="text"
                          value={rule.attribute}
                          onChange={(e) => updateRule(idx, { attribute: e.target.value })}
                          placeholder="e.g. country, plan"
                          className="w-full bg-[#0c0e12] border border-[#23272f] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          Operator
                        </label>
                        <select
                          value={rule.operator}
                          onChange={(e) =>
                            updateRule(idx, { operator: e.target.value as Operator })
                          }
                          className="w-full bg-[#0c0e12] border border-[#23272f] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          {OPERATORS.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          Values (comma separated)
                        </label>
                        <input
                          type="text"
                          value={rule.values.join(', ')}
                          onChange={(e) =>
                            updateRule(idx, {
                              values: e.target.value
                                .split(',')
                                .map((v) => v.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="e.g. IN, US"
                          className="w-full bg-[#0c0e12] border border-[#23272f] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#1e222a] text-xs">
                      <span className="text-slate-400">If match, serve:</span>
                      <button
                        type="button"
                        onClick={() => updateRule(idx, { serveValue: !rule.serveValue })}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                          rule.serveValue
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {rule.serveValue ? 'true (Enabled)' : 'false (Disabled)'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#1b1e24] bg-[#07090c]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-[#1a1d23] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-semibold shadow-md transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
