import React from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { Environment } from '../types';

interface HeaderProps {
  environments: Environment[];
  selectedEnvironment: Environment | null;
  onSelectEnvironment: (env: Environment) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateFlag: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  environments,
  selectedEnvironment,
  onSelectEnvironment,
  searchQuery,
  setSearchQuery,
  onCreateFlag,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="border-b border-dark-750 bg-dark-900 px-6 py-4 space-y-4">
      {/* Top Title & Environment Pill & Create Flag */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-white">Flags</h1>

        <div className="flex items-center gap-3">
          {/* Environment Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-800 border border-dark-700 hover:border-dark-600 transition text-xs font-medium text-slate-200 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{selectedEnvironment?.name || 'Select Environment'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-1 z-30">
                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Environments
                </div>
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => {
                      onSelectEnvironment(env);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-dark-750 transition ${
                      selectedEnvironment?.id === env.id
                        ? 'text-white font-medium bg-dark-750/70'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>{env.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{env.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create Flag Button */}
          <button
            onClick={onCreateFlag}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create flag</span>
          </button>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flags by name, description or key"
            className="w-full bg-dark-800 border border-dark-700 rounded-md pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Filters, Sort, Display Toolbar */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-dark-750 hover:bg-dark-800 text-xs font-medium text-slate-400 hover:text-slate-200 transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-dark-750 hover:bg-dark-800 text-xs font-medium text-slate-400 hover:text-slate-200 transition">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-dark-750 hover:bg-dark-800 text-xs font-medium text-slate-400 hover:text-slate-200 transition">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Display</span>
          </button>
        </div>
      </div>
    </header>
  );
};
