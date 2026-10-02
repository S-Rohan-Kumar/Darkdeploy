import React, { useState } from 'react';
import { X, Plus, Trash2, Sliders, Check } from 'lucide-react';
import { Flag, TargetingRule, Operator } from '../types';

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

export const FlagDrawer: React.FC<FlagDrawerProps> = ({
  flag,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !flag) return null;

  const [rolloutPercentage, setRolloutPercentage] = useState(flag.rolloutPercentage ?? 0);
  const [defaultValue, setDefaultValue] = useState(flag.defaultValue ?? false);
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
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-150">
      <div className="bg-dark-850 border-l border-dark-750 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-750">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">{flag.name}</h2>
              <span className="text-[10px] text-amber-400 font-bold">◆</span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{flag.key}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-dark-750 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rollout Percentage Section */}
          <div className="bg-dark-900 border border-dark-750 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Sliders className="w-4 h-4 text-brand-500" />
                <span>Default Percentage Rollout</span>
              </div>
              <span className="text-xs font-mono font-bold text-brand-400">
                {rolloutPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Users who do not match any targeting rules will be deterministically bucketed by hash.
            </p>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={rolloutPercentage}
              onChange={(e) => setRolloutPercentage(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex items-center justify-between pt-2 border-t border-dark-800 text-xs">
              <span className="text-slate-400">Fallback default value:</span>
              <select
                value={defaultValue ? 'true' : 'false'}
                onChange={(e) => setDefaultValue(e.target.value === 'true')}
                className="bg-dark-800 border border-dark-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="false">false (Off)</option>
                <option value="true">true (On)</option>
              </select>
            </div>
          </div>

          {/* Targeting Rules Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-200">Targeting Rules</h3>
                <p className="text-[11px] text-slate-400">
                  Rules are evaluated in order from top to bottom (first match wins).
                </p>
              </div>
              <button
                onClick={addRule}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-dark-750 hover:bg-dark-700 text-xs font-medium text-slate-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add rule</span>
              </button>
            </div>

            {rules.length === 0 ? (
              <div className="p-4 border border-dashed border-dark-750 rounded-lg text-center text-xs text-slate-500">
                No rules configured. All evaluations fall through to the percentage rollout.
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="bg-dark-900 border border-dark-750 rounded-lg p-3 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                          className="w-full bg-dark-850 border border-dark-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
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
                          className="w-full bg-dark-850 border border-dark-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
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
                          className="w-full bg-dark-850 border border-dark-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-dark-800 text-xs">
                      <span className="text-slate-400">If match, serve:</span>
                      <button
                        type="button"
                        onClick={() => updateRule(idx, { serveValue: !rule.serveValue })}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                          rule.serveValue
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-dark-750 bg-dark-900">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-dark-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
