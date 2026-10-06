import React, { useState } from 'react';
import { X, Sparkles, Bot, ToggleLeft } from 'lucide-react';
import { Environment, AIConfig } from '../types';

interface CreateFlagModalProps {
  environment: Environment | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    key: string;
    description: string;
    defaultValue: boolean;
    rolloutPercentage: number;
    environmentId: string;
    type?: 'BOOLEAN' | 'MULTIVARIATE' | 'AI_CONFIG';
    aiConfig?: AIConfig | null;
  }) => Promise<void>;
}

const POPULAR_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'meta-llama-3.1-70b',
];

export const CreateFlagModal: React.FC<CreateFlagModalProps> = ({
  environment,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [flagType, setFlagType] = useState<'BOOLEAN' | 'AI_CONFIG'>('BOOLEAN');
  const [defaultValue, setDefaultValue] = useState(false);
  const [rolloutPercentage, setRolloutPercentage] = useState(0);

  const [aiModel, setAiModel] = useState('gpt-4o');
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [aiSystemPrompt, setAiSystemPrompt] = useState('You are a helpful, concise AI assistant.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setKey(slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!environment) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        key,
        description,
        defaultValue,
        rolloutPercentage,
        environmentId: environment.id,
        type: flagType,
        aiConfig:
          flagType === 'AI_CONFIG'
            ? {
                model: aiModel,
                temperature: Number(aiTemperature),
                systemPrompt: aiSystemPrompt,
              }
            : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0c0e12] border border-[#23272f] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b1e24] bg-[#07090c]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center">
              {flagType === 'AI_CONFIG' ? (
                <Bot className="w-4 h-4 text-cyan-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-cyan-400" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Create Feature Flag / AI Config</h2>
              <p className="text-[11px] text-slate-400">Launch a boolean gate or dynamic LLM configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1a1d23] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Flag Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFlagType('BOOLEAN')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  flagType === 'BOOLEAN'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-[#14171d] border-[#23272f] text-slate-400 hover:text-slate-200'
                }`}
              >
                <ToggleLeft className="w-4 h-4 text-cyan-400" />
                <span>Boolean Release</span>
              </button>
              <button
                type="button"
                onClick={() => setFlagType('AI_CONFIG')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  flagType === 'AI_CONFIG'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-[#14171d] border-[#23272f] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>AI Prompt & Model</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={flagType === 'AI_CONFIG' ? 'e.g. Support Bot Prompt' : 'e.g. New Checkout Flow'}
              className="w-full bg-[#14171d] border border-[#23272f] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Flag Key <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. support-bot-prompt"
              className="w-full bg-[#14171d] border border-[#23272f] rounded-md px-3 py-2 text-xs font-mono text-cyan-400 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the purpose of this flag or AI agent configuration..."
              className="w-full bg-[#14171d] border border-[#23272f] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
            />
          </div>

          {flagType === 'AI_CONFIG' && (
            <div className="p-4 rounded-xl bg-[#12151c] border border-cyan-900/40 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5" />
                <span>AI Hyperparameters & Prompt</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Foundation Model
                  </label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-[#23272f] rounded-md px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
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
                    <label className="text-[11px] font-medium text-slate-300">
                      Temperature
                    </label>
                    <span className="text-[11px] font-mono text-cyan-400">{aiTemperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={aiTemperature}
                    onChange={(e) => setAiTemperature(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  System Prompt
                </label>
                <textarea
                  rows={3}
                  value={aiSystemPrompt}
                  onChange={(e) => setAiSystemPrompt(e.target.value)}
                  placeholder="You are an expert AI customer support agent with concise, technical reasoning..."
                  className="w-full bg-[#0c0e12] border border-[#23272f] rounded-md px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition resize-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Value
              </label>
              <select
                value={defaultValue ? 'true' : 'false'}
                onChange={(e) => setDefaultValue(e.target.value === 'true')}
                className="w-full bg-[#14171d] border border-[#23272f] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="false">false (Off)</option>
                <option value="true">true (On)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Initial Rollout ({rolloutPercentage}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={rolloutPercentage}
                onChange={(e) => setRolloutPercentage(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1b1e24]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-[#1a1d23] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-semibold shadow-md transition"
            >
              {isSubmitting ? 'Creating...' : 'Create Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
