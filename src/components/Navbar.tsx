import React from 'react';
import {
  RefreshCw,
  Settings,
  FileSpreadsheet,
} from 'lucide-react';
import { SheetSyncState } from '../types';

interface NavbarProps {
  category: string;
  onCategoryChange?: (category: string) => void;
  syncState: SheetSyncState;
  onSync: () => Promise<void>;
  onOpenSheetSettings: () => void;
  onOpenCatalog: () => void;
  onOpenUpdateLog: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  syncState,
  onSync,
  onOpenSheetSettings,
  onOpenCatalog,
  onOpenUpdateLog,
}) => {
  return (
    <header className="bg-[#140f29]/90 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-30 px-3 sm:px-4 py-2 shrink-0">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Brand Title with RoBeats Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="https://i.postimg.cc/5tfFpKg4/image.png"
            alt="RoBeats Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow shrink-0"
          />
          <h1 className="font-righteous text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 tracking-wide whitespace-nowrap">
            RoBeats! News Hub
          </h1>
          <span className="px-2 py-0.5 text-[11px] font-righteous bg-pink-500/20 text-pink-300 rounded-md border border-pink-500/30 whitespace-nowrap shrink-0">
            for STAFF
          </span>
        </div>

        {/* Center: Live Song Count & Google Sheets Sync */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1b1538] px-3 py-1 rounded-xl border border-purple-500/20">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="text-xs tabular-nums whitespace-nowrap">
              <span className="text-purple-300">Song count: </span>
              <span className="text-emerald-400 font-semibold">{syncState.totalSongs} songs</span>
              <span className="text-purple-400 text-[10px] ml-1.5">
                {syncState.lastSynced
                  ? `Synced ${syncState.lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Live'}
              </span>
            </div>

            <button
              onClick={() => onSync()}
              disabled={syncState.isLoading}
              className="ml-1.5 p-1 text-purple-300 hover:text-white rounded hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
              title="Sync with Google Sheets now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState.isLoading ? 'animate-spin text-pink-400' : ''}`} />
            </button>

            <button
              onClick={onOpenSheetSettings}
              className="p-1 text-purple-300 hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
              title="Google Sheet configuration"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Sheet Sync button */}
          <button
            onClick={() => onSync()}
            disabled={syncState.isLoading}
            className="lg:hidden p-1.5 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:text-white transition cursor-pointer"
            title="Sync with Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 ${syncState.isLoading ? 'animate-spin text-pink-400' : ''}`} />
          </button>

          {/* Update Log button next to Song List */}
          <button
            onClick={onOpenUpdateLog}
            className="flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-200 text-xs font-righteous transition cursor-pointer whitespace-nowrap"
          >
            <span>Update Log</span>
          </button>

          {/* Song List button */}
          <button
            onClick={onOpenCatalog}
            className="flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 text-xs font-righteous transition cursor-pointer whitespace-nowrap"
          >
            <span>Song List</span>
          </button>
        </div>
      </div>
    </header>
  );
};
