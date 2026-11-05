import React, { useState } from 'react';
import { SheetSyncState } from '../types';
import { X, FileSpreadsheet, ExternalLink, RefreshCw, Check, Lock } from 'lucide-react';
import { DEFAULT_SHEET_URL } from '../utils/sheetService';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SheetSyncState;
  onUpdateSheetUrl: (url: string) => Promise<void>;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onUpdateSheetUrl,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkedSuccess, setCheckedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCheckNewSong = async () => {
    setIsChecking(true);
    try {
      await onUpdateSheetUrl(DEFAULT_SHEET_URL);
      setCheckedSuccess(true);
      setTimeout(() => {
        setCheckedSuccess(false);
      }, 2000);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141026] border border-purple-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-4 border-b border-purple-500/20 flex items-center justify-between bg-[#191432]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-righteous text-white text-base">Google Sheets Integration</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Locked Google Sheet URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-purple-200 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-yellow-300" />
                <span>Google Sheet URL (Locked):</span>
              </label>
              <a
                href={DEFAULT_SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="text-pink-400 hover:text-pink-300 flex items-center gap-1 font-normal text-[11px]"
              >
                Open Sheet <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="text"
                readOnly
                value={DEFAULT_SHEET_URL}
                className="w-full bg-[#0d091e] border border-purple-500/30 rounded-xl px-3 py-2 text-purple-300/80 font-mono text-xs select-all cursor-not-allowed focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-medium">
                Locked
              </span>
            </div>
          </div>

          {/* Sync Stats */}
          <div className="p-3 rounded-xl bg-[#1a1435] border border-purple-500/20 space-y-1.5">
            <div className="flex justify-between text-purple-300">
              <span>Total Songs Loaded:</span>
              <span className="font-semibold text-emerald-400 font-righteous text-sm">
                {syncState.totalSongs} Tracks
              </span>
            </div>
            <div className="flex justify-between text-purple-300">
              <span>Last Synced:</span>
              <span className="font-mono text-[11px] text-purple-200">
                {syncState.lastSynced ? syncState.lastSynced.toLocaleString() : 'Not yet'}
              </span>
            </div>
            <div className="flex justify-between text-purple-300">
              <span>Auto Update:</span>
              <span className="text-emerald-400 font-semibold">Enabled</span>
            </div>
          </div>
        </div>

        {/* Footer with only "Check new song" and "Done" button */}
        <div className="p-3 bg-[#191432] border-t border-purple-500/20 flex items-center justify-end gap-2">
          <button
            onClick={handleCheckNewSong}
            disabled={isChecking}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-righteous flex items-center gap-1.5 shadow-md shadow-pink-600/30 transition cursor-pointer disabled:opacity-50"
          >
            {checkedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-yellow-300" />
                Updated!
              </>
            ) : (
              <>
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                Check new song
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-righteous transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
