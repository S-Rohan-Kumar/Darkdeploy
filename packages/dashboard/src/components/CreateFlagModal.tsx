import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Environment } from '../types';

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
  }) => Promise<void>;
}

export const CreateFlagModal: React.FC<CreateFlagModalProps> = ({
  environment,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [defaultValue, setDefaultValue] = useState(false);
  const [rolloutPercentage, setRolloutPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate key from name if not manually modified
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
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-850 border border-dark-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-750">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-white">Create Feature Flag</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-dark-750 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. New Checkout Experience"
              className="w-full bg-dark-900 border border-dark-700 rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
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
              placeholder="e.g. new-checkout-experience"
              className="w-full bg-dark-900 border border-dark-700 rounded-md px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
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
              placeholder="Explain the purpose of this flag..."
              className="w-full bg-dark-900 border border-dark-700 rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Value
              </label>
              <select
                value={defaultValue ? 'true' : 'false'}
                onChange={(e) => setDefaultValue(e.target.value === 'true')}
                className="w-full bg-dark-900 border border-dark-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
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
                className="w-full accent-brand-500 cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-dark-750">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-dark-750 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-md bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition"
            >
              {isSubmitting ? 'Creating...' : 'Create Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
