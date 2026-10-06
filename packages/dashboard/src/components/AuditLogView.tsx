import React, { useEffect, useState } from 'react';
import { History, Clock } from 'lucide-react';
import { AuditLog } from '../types';
import { api } from '../api/client';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAuditLogs()
      .then((data) => setLogs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-dark-750 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <span>Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all flag creations, updates, targeting changes, and deletions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 p-8 text-center">Loading audit records...</div>
      ) : logs.length === 0 ? (
        <div className="text-xs text-slate-500 p-8 text-center">No audit logs recorded yet.</div>
      ) : (
        <div className="space-y-3 max-w-4xl">
          {logs.map((log) => {
            const hasDiff = log.diff && typeof log.diff === 'object';
            const before = log.diff?.before;
            const after = log.diff?.after;

            return (
              <div
                key={log.id}
                className="bg-dark-850 border border-dark-750 rounded-xl p-4 space-y-2 hover:border-dark-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      by {log.user?.name || log.user?.email || 'System'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {hasDiff && (before || after) && (
                  <div className="bg-dark-900 border border-dark-750 rounded-lg p-3 text-xs font-mono space-y-1 mt-2">
                    {before && (
                      <div className="text-red-400/90 flex items-start gap-2">
                        <span className="text-red-500 font-bold select-none">-</span>
                        <span>{JSON.stringify(before)}</span>
                      </div>
                    )}
                    {after && (
                      <div className="text-emerald-400/90 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold select-none">+</span>
                        <span>{JSON.stringify(after)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
