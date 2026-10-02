import React from 'react';
import {
  Flag,
  Shield,
  Users,
  Search,
  CheckCircle2,
  Code2,
  Bot,
  FlaskConical,
  History,
  LogOut,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User | null;
  activeView: 'flags' | 'audit';
  setActiveView: (view: 'flags' | 'audit') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onLogout,
}) => {
  return (
    <aside className="w-64 bg-dark-850 border-r border-dark-750 flex flex-col h-screen select-none shrink-0 text-slate-300">
      {/* Brand Header */}
      <div className="p-3 border-b border-dark-750 flex items-center justify-between">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-dark-750 cursor-pointer w-full transition">
          <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center font-bold text-xs text-white">
            <span className="text-sm font-black">▲</span>
          </div>
          <span className="font-semibold text-sm text-slate-100 tracking-tight">DarkDeploy</span>
          <ChevronDown className="w-4 h-4 ml-auto text-slate-400" />
        </div>
      </div>

      {/* Quick Search & Approvals */}
      <div className="px-3 pt-3 pb-2 space-y-1">
        <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-750 transition">
          <Search className="w-4 h-4 text-slate-400" />
          <span>Search</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-750 transition">
          <CheckCircle2 className="w-4 h-4 text-slate-400" />
          <span>Approvals</span>
        </button>
      </div>

      {/* Mode Switcher: Code vs Agents */}
      <div className="px-3 py-1">
        <div className="bg-dark-900 p-0.5 rounded-lg flex items-center border border-dark-750">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md bg-dark-750 text-slate-100 text-xs font-medium shadow-sm">
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-slate-400 hover:text-slate-200 text-xs font-medium transition">
            <Bot className="w-3.5 h-3.5" />
            <span>Agents</span>
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-1 flex items-center justify-between">
            <span>Features</span>
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveView('flags')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeView === 'flags'
                  ? 'bg-dark-750 text-slate-100 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-750/50'
              }`}
            >
              <Flag className="w-4 h-4 text-brand-500" />
              <span>Flags</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 opacity-60 cursor-not-allowed"
            >
              <Shield className="w-4 h-4" />
              <span>Guarded rollouts</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 opacity-60 cursor-not-allowed"
            >
              <Layers className="w-4 h-4" />
              <span>Segments</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 opacity-60 cursor-not-allowed"
            >
              <Users className="w-4 h-4" />
              <span>Contexts</span>
            </button>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-1">
            <span>Experimentation</span>
          </div>
          <div className="space-y-0.5">
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 opacity-60 cursor-not-allowed"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Experiments</span>
            </button>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-1">
            <span>Audit & Governance</span>
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveView('audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeView === 'audit'
                  ? 'bg-dark-750 text-slate-100 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-750/50'
              }`}
            >
              <History className="w-4 h-4 text-purple-400" />
              <span>Audit Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-dark-750 bg-dark-850 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'DU'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-medium text-slate-200 truncate">
              {currentUser?.name || 'Demo User'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 rounded hover:bg-dark-750 text-slate-400 hover:text-red-400 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
