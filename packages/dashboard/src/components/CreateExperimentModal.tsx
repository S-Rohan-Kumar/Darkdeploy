import React, { useState } from 'react';
import { X, FlaskConical, Plus, Trash2 } from 'lucide-react';
import { Environment, Variant } from '../types';

interface CreateExperimentModalProps {
  environment: Environment | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    key: string;
    description: string;
    environmentId: string;
    variants: Variant[];
  }) => Promise<void>;
}

export const CreateExperimentModal: React.FC<CreateExperimentModalProps> = ({
  environment,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState<Variant[]>([
    { key: 'control', name: 'Control (Original)', weight: 50 },
    { key: 'variant-a', name: 'Variant A (Treatment)', weight: 50 },
  ]);
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

  const handleAddVariant = () => {
    const nextIndex = variants.length;
    const nextKey = `variant-${String.fromCharCode(97 + nextIndex - 1)}`;
    const remainingWeight = Math.max(0, 100 - variants.reduce((acc, v) => acc + v.weight, 0));
    setVariants([
      ...variants,
      {
        key: nextKey,
        name: `Variant ${String.fromCharCode(65 + nextIndex - 1)}`,
        weight: remainingWeight,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 2) {
      setError('An experiment requires at least two variants');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, patch: Partial<Variant>) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], ...patch };
    setVariants(updated);
  };

  const totalWeight = variants.reduce((acc, v) => acc + (Number(v.weight) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!environment) return;
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(`Variant weights must sum to 100% (currently ${totalWeight}%)`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        key,
        description,
        environmentId: environment.id,
        variants: variants.map((v) => ({
          key: v.key.trim(),
          name: v.name?.trim() || v.key.trim(),
          weight: Number(v.weight),
        })),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create experiment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0c0e12] border border-[#23272f] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b1e24]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Create A/B Experiment</h2>
              <p className="text-[11px] text-slate-400">Configure multi-variant allocation and statistical hypotheses</p>
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
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Experiment Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Checkout CTA Color Test"
              className="w-full bg-[#14171d] border border-[#23272f] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Experiment Key <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. checkout-cta-color-test"
              className="w-full bg-[#14171d] border border-[#23272f] rounded-md px-3 py-2 text-xs font-mono text-cyan-400 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description / Hypothesis
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hypothesis: Changing checkout button to vibrant green will increase conversion by 15%..."
              className="w-full bg-[#14171d] border border-[#23272f] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
            />
          </div>

          <div className="pt-2 border-t border-[#1b1e24]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200">
                Variants & Weight Distribution
              </label>
              <span className={`text-xs font-mono font-medium ${totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Total: {totalWeight}%
              </span>
            </div>

            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#14171d] border border-[#23272f]">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Variant Key"
                      value={v.key}
                      onChange={(e) => handleVariantChange(i, { key: e.target.value })}
                      className="bg-[#0c0e12] border border-[#23272f] rounded px-2.5 py-1 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Label / Name"
                      value={v.name}
                      onChange={(e) => handleVariantChange(i, { name: e.target.value })}
                      className="bg-[#0c0e12] border border-[#23272f] rounded px-2.5 py-1 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="w-24 flex items-center gap-1 bg-[#0c0e12] border border-[#23272f] rounded px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      required
                      value={v.weight}
                      onChange={(e) => handleVariantChange(i, { weight: Number(e.target.value) })}
                      className="w-full bg-transparent text-xs text-right font-mono text-cyan-400 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 font-mono">%</span>
                  </div>
                  {variants.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(i)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-[#1f232b] transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-[#2b303a] hover:border-cyan-500/50 text-xs text-slate-400 hover:text-cyan-400 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
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
              disabled={isSubmitting || totalWeight !== 100}
              className="px-4 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-semibold shadow-md transition"
            >
              {isSubmitting ? 'Creating...' : 'Launch Experiment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
