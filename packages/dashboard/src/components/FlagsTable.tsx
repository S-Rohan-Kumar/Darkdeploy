import React, { useState } from 'react';
import { ExternalLink, Check, MoreVertical, Sliders, Trash2, Activity, Bot } from 'lucide-react';
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const copyToClipboard = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0c0e12]">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1b1e24] text-[11px] font-semibold text-slate-400 bg-[#07090c] sticky top-0 z-10 select-none">
              <th className="py-2.5 px-6 font-medium">Name</th>
              <th className="py-2.5 px-4 font-medium">Key</th>
              <th className="py-2.5 px-4 font-medium">Maintainer</th>
              <th className="py-2.5 px-4 font-medium">Created</th>
              <th className="py-2.5 px-6 text-right font-medium">
                <span className="inline-flex items-center gap-1.5 text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></span>
                  <span>{environment?.name || 'Development'}</span>
                  <span className="text-slate-500 font-light ml-1">+</span>
                </span>
              </th>
              <th className="py-2.5 px-3 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181c24] text-xs">
            {flags.map((flag) => {
              const ruleCount = flag.rules ? flag.rules.length : 0;
              const rollout = flag.rolloutPercentage ?? 0;
              const isAI = flag.type === 'AI_CONFIG';

              return (
                <tr
                  key={flag.id}
                  onClick={() => onConfigureFlag(flag)}
                  className="hover:bg-[#12151c] cursor-pointer transition group"
                >
                  <td className="py-3 px-6 max-w-sm">
                    <div className="flex items-center gap-1.5 font-semibold text-white tracking-tight">
                      <span>{flag.name}</span>
                      <span className="text-[11px] select-none text-amber-400">❖</span>
                      {isAI && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 font-mono">
                          <Bot className="w-3 h-3" /> AI
                        </span>
                      )}
                    </div>
                    {flag.description && (
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 max-w-md">
                        {flag.description}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#181c25] text-slate-400 border border-[#272d3b] font-medium">
                        {isAI ? (flag.aiConfig?.model || 'gpt-4o') : ruleCount > 0 ? 'guarded-rollout' : 'release-gate'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-cyan-400">
                    <div className="flex items-center gap-1.5">
                      <span>{flag.key}</span>
                      <button
                        onClick={(e) => copyToClipboard(flag.key, e)}
                        title="Copy key"
                        className="text-slate-500 hover:text-white p-0.5 transition"
                      >
                        {copiedKey === flag.key ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ExternalLink className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/40 text-cyan-400 font-bold text-[9px] flex items-center justify-center tracking-tight">
                        AD
                      </div>
                      <span className="text-slate-300 text-xs">Admin</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(flag.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>

                  <td className="py-3 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-4">
                      <div
                        onClick={() => onToggleFlag(flag)}
                        className="cursor-pointer group/toggle flex flex-col items-start w-28"
                      >
                        <span
                          className={`text-xs font-medium tracking-wide transition select-none ${
                            flag.enabled
                              ? 'text-emerald-400 font-semibold'
                              : 'text-slate-500'
                          }`}
                        >
                          {flag.enabled ? 'On' : 'Off'}
                        </span>

                        <div className="w-full bg-[#1e232d] h-[3px] rounded-full overflow-hidden mt-1 relative">
                          {flag.enabled && rollout > 0 && (
                            <div
                              className="bg-cyan-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,229,255,0.6)]"
                              style={{ width: `${rollout}%` }}
                            ></div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 text-xs select-none">
                        <Activity className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono text-[11px]">{ruleCount}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() =>
                        setActiveMenuId(activeMenuId === flag.id ? null : flag.id)
                      }
                      className="p-1 rounded text-slate-500 hover:text-white transition"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {activeMenuId === flag.id && (
                      <div className="absolute right-4 top-8 w-36 bg-[#14171d] border border-[#23272f] rounded-lg shadow-2xl py-1 z-20 text-left">
                        <button
                          onClick={() => {
                            onConfigureFlag(flag);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-[#1f232b] hover:text-white transition"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </button>
                        <button
                          onClick={() => {
                            onDeleteFlag(flag);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-[#1f232b] hover:text-red-300 transition"
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

      <div className="border-t border-[#1b1e24] bg-[#07090c] px-6 py-2.5 flex items-center justify-end text-xs text-slate-400 gap-4 select-none">
        <div className="flex items-center gap-3">
          <button className="text-slate-600 disabled:opacity-40" disabled>
            «
          </button>
          <button className="text-slate-600 disabled:opacity-40" disabled>
            &lt;
          </button>
          <span className="text-slate-300 font-medium">1–{flags.length} of {flags.length} flags</span>
          <button className="text-slate-600 disabled:opacity-40" disabled>
            &gt;
          </button>
          <button className="text-slate-600 disabled:opacity-40" disabled>
            »
          </button>
        </div>
      </div>
    </div>
  );
};
