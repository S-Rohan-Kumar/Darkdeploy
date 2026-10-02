import React from 'react';
import { Copy, Check, MoreVertical, Sliders, Trash2, ShieldAlert } from 'lucide-react';
import { Flag, Environment } from '../types';

interface FlagsTableProps {
  flags: Flag[];
  environment: Environment | null;
  onToggleFlag: (flag: Flag) => void;
  onConfigureFlag: (flag: Flag) => void;
  onDeleteFlag: (flag: Flag) => void;
}

export const FlagsTable: React.FC<FlagsTableProps> = ({
  flags,
  environment,
  onToggleFlag,
  onConfigureFlag,
  onDeleteFlag,
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  const copyToClipboard = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  if (flags.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-dark-800 border border-dark-750 flex items-center justify-center text-slate-400 mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No flags in this environment</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Create your first feature flag to control rollouts and target users in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-dark-750 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-dark-900/60 sticky top-0 backdrop-blur z-10">
            <th className="py-2.5 px-6">Name</th>
            <th className="py-2.5 px-4">Key</th>
            <th className="py-2.5 px-4">Maintainer</th>
            <th className="py-2.5 px-4">Created</th>
            <th className="py-2.5 px-6 text-right">
              {environment?.name || 'Environment'}
            </th>
            <th className="py-2.5 px-3 text-center w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-750/70 text-xs text-slate-300">
          {flags.map((flag) => {
            const hasRules = flag.rules && flag.rules.length > 0;
            const rollout = flag.rolloutPercentage ?? 0;

            return (
              <tr
                key={flag.id}
                onClick={() => onConfigureFlag(flag)}
                className="hover:bg-dark-800/60 cursor-pointer transition group"
              >
                {/* Name & Description */}
                <td className="py-3 px-6 max-w-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-100 group-hover:text-brand-400 transition">
                    <span>{flag.name}</span>
                    <span className="text-[10px] text-amber-400 font-bold">◆</span>
                  </div>
                  {flag.description && (
                    <div className="text-[11px] text-slate-400 truncate mt-0.5 max-w-sm">
                      {flag.description}
                    </div>
                  )}
                  {hasRules && (
                    <div className="inline-block mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-750 text-slate-300 font-medium">
                        guarded-rollout
                      </span>
                    </div>
                  )}
                </td>

                {/* Key with Copy */}
                <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span>{flag.key}</span>
                    <button
                      onClick={(e) => copyToClipboard(flag.key, e)}
                      title="Copy flag key"
                      className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-slate-200 transition"
                    >
                      {copiedKey === flag.key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Maintainer */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-600 text-[10px] text-white font-bold flex items-center justify-center">
                      SA
                    </div>
                    <span className="text-slate-300">System Admin</span>
                  </div>
                </td>

                {/* Created Date */}
                <td className="py-3 px-4 text-slate-400">
                  {new Date(flag.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                {/* Live Toggle Switch & Rollout Indicator */}
                <td className="py-3 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[11px] font-semibold tracking-wide ${
                          flag.enabled ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {flag.enabled ? 'On' : 'Off'}
                      </span>

                      {/* Pill Toggle Button */}
                      <button
                        onClick={() => onToggleFlag(flag)}
                        type="button"
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out ${
                          flag.enabled
                            ? 'bg-emerald-600 justify-end'
                            : 'bg-dark-700 justify-start'
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition"></div>
                      </button>

                      {/* Rule count badge */}
                      {hasRules && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-dark-750 px-1.5 py-0.5 rounded">
                          +{flag.rules.length}
                        </span>
                      )}
                    </div>

                    {/* Rollout % Bar */}
                    {flag.enabled && (
                      <div className="w-24 bg-dark-750 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="bg-brand-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${rollout}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </td>

                {/* Context Menu */}
                <td className="py-3 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() =>
                      setActiveMenuId(activeMenuId === flag.id ? null : flag.id)
                    }
                    className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-slate-200 transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === flag.id && (
                    <div className="absolute right-3 top-10 w-36 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-1 z-20 text-left">
                      <button
                        onClick={() => {
                          onConfigureFlag(flag);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-dark-750 hover:text-white transition"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Edit rules</span>
                      </button>
                      <button
                        onClick={() => {
                          onDeleteFlag(flag);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-dark-750 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete flag</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
