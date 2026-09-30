import React from 'react';
import { Layers, History, Sparkles, User, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'single' | 'batch' | 'creator' | 'history' | 'guide' | 'developer';
  onSelectTab: (tab: 'single' | 'batch' | 'creator' | 'history' | 'guide' | 'developer') => void;
  batchCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  batchCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('single')}
          className="text-left group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg p-1 cursor-pointer"
        >
          <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-sm shadow-cyan-400/50" />
            TokHD
          </span>
        </button>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('single')}
            className={`transition-colors hover:text-white pb-0.5 border-b-2 cursor-pointer ${
              activeTab === 'single'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Downloader
          </button>
          <button
            onClick={() => onSelectTab('batch')}
            className={`transition-colors hover:text-white pb-0.5 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'batch'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Batch Studio
            {batchCount > 0 && (
              <span className="text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded-full">
                {batchCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('creator')}
            className={`transition-colors hover:text-white pb-0.5 border-b-2 cursor-pointer ${
              activeTab === 'creator'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`transition-colors hover:text-white pb-0.5 border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            History
          </button>
          <button
            onClick={() => onSelectTab('guide')}
            className={`transition-colors hover:text-white pb-0.5 border-b-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Guide
          </button>
          <button
            onClick={() => onSelectTab('developer')}
            className={`transition-colors hover:text-white pb-0.5 border-b-2 cursor-pointer flex items-center gap-1 ${
              activeTab === 'developer'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <span>Harmain</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <PWAInstallButton variant="header" />

          <button
            onClick={() => onSelectTab(activeTab === 'batch' ? 'single' : 'batch')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-sm shadow-cyan-900/30 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{activeTab === 'batch' ? 'Single Video' : 'Batch Studio'}</span>
          </button>
        </div>
      </div>

      {/* Mobile sub-bar tabs for touch devices */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-[#090d16]/95 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => onSelectTab('single')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'single' ? 'text-cyan-400 font-semibold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          Downloader
        </button>
        <button
          onClick={() => onSelectTab('batch')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'batch' ? 'text-cyan-400 font-semibold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          Batch
          {batchCount > 0 && (
            <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1 rounded-full">
              {batchCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onSelectTab('creator')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'creator' ? 'text-cyan-400 font-semibold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          Explore
        </button>
        <button
          onClick={() => onSelectTab('history')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'history' ? 'text-cyan-400 font-semibold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          History
        </button>
        <button
          onClick={() => onSelectTab('guide')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'guide' ? 'text-cyan-400 font-semibold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          Guide
        </button>
        <button
          onClick={() => onSelectTab('developer')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'developer' ? 'text-cyan-400 font-semibold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          Harmain
        </button>
      </div>
    </header>
  );
};

