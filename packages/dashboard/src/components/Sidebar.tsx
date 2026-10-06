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
  Zap,
  Activity,
  Database,
  ChevronDown,
  ChevronRight,
  Layers,
  Settings,
  HelpCircle,
  Link,
  PanelLeftClose,
  LogOut,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User | null;
  activeView: 'flags' | 'experiments' | 'audit' | 'agents';
  setActiveView: (view: 'flags' | 'experiments' | 'audit' | 'agents') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onLogout,
}) => {
  return (
    <aside className="w-64 bg-[#0c0e12] border-r border-[#1b1e24] flex flex-col h-screen select-none shrink-0 text-slate-400">
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#14171d]">
        <div className="flex items-center gap-2 cursor-pointer">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.5 12L18.5 2V8.5L9.5 12L18.5 15.5V22L3.5 12Z" />
            <path d="M19.5 8.5L22 7V17L19.5 15.5V8.5Z" />
          </svg>
          <span className="font-bold text-sm tracking-tight text-white">DarkDeploy</span>
        </div>
        <button className="text-slate-500 hover:text-slate-300 transition p-1">
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[#23272f] bg-[#14171d] hover:bg-[#1a1e27] text-slate-100 text-xs font-medium cursor-pointer transition">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded border border-slate-500 flex items-center justify-center text-[9px] text-slate-400">
              ◫
            </div>
            <span className="font-semibold tracking-tight">Apex Enterprise</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <div className="px-3 py-1 space-y-0.5">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#14171d] transition">
          <Search className="w-4 h-4 text-slate-400" />
          <span>Search</span>
        </button>
        <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#14171d] transition">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <span>Approvals</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#1c202a] text-slate-400 rounded-full">
            1
          </span>
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="bg-[#07090c] p-0.5 rounded-lg flex items-center border border-[#1b1e24]">
          <button
            onClick={() => setActiveView('flags')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium transition ${
              activeView === 'flags' || activeView === 'experiments'
                ? 'bg-[#181c25] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Code</span>
          </button>
          <button
            onClick={() => setActiveView('agents')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium transition ${
              activeView === 'agents'
                ? 'bg-[#181c25] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agents</span>
          </button>
        </div>
      </div>

      <div className="px-3 py-1">
        <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#14171d] transition">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Shortcuts</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 mb-1 flex items-center gap-1.5">
            <ChevronDown className="w-3 h-3 text-slate-500" />
            <span>Features</span>
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveView('flags')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeView === 'flags'
                  ? 'bg-[#181c25] text-white font-semibold border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#14171d]'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Flags</span>
            </button>
            <button
              onClick={() => setActiveView('agents')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeView === 'agents'
                  ? 'bg-[#181c25] text-white font-semibold border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#14171d]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Configs</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Guarded rollouts</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Segments</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Contexts</span>
            </button>
          </div>
        </div>

        <div>
          <button
            onClick={() => setActiveView('experiments')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeView === 'experiments'
                ? 'bg-[#181c25] text-white font-semibold border-l-2 border-cyan-400'
                : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
            }`}
          >
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              <span>Experimentation</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        <div>
          <button
            onClick={() => setActiveView('audit')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeView === 'audit'
                ? 'bg-[#181c25] text-white font-semibold border-l-2 border-cyan-400'
                : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audit Logs</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        <div>
          <button
            disabled
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-600" />
              <span>Telemetry</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-[#1b1e24] bg-[#090b0e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            title={currentUser?.email || 'User'}
            className="w-6 h-6 rounded-full bg-cyan-400 text-black font-extrabold text-[10px] flex items-center justify-center tracking-tight shadow select-none cursor-pointer"
          >
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'DU'}
          </div>
          <span className="text-xs text-white font-medium truncate max-w-[100px]">
            {currentUser?.name || 'Admin'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <button className="p-1 rounded hover:bg-[#181c25] hover:text-white transition">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-[#181c25] hover:text-white transition">
            <Link className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-[#181c25] hover:text-white transition">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1 rounded hover:bg-[#181c25] hover:text-red-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
