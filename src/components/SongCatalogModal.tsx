import React, { useState, useMemo } from 'react';
import { SongItem } from '../types';
import { Search, X, Music, RefreshCw, ExternalLink, Check } from 'lucide-react';

interface SongCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: SongItem[];
  onSelectSong: (song: SongItem, slot: 'star' | 'pro') => void;
  onSync: () => Promise<void>;
  isSyncing: boolean;
  sheetUrl: string;
}

export const SongCatalogModal: React.FC<SongCatalogModalProps> = ({
  isOpen,
  onClose,
  songs,
  onSelectSong,
  onSync,
  isSyncing,
  sheetUrl,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const filteredSongs = useMemo(() => {
    let list = songs;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          (s.element && s.element.toLowerCase().includes(q))
      );
    }

    if (selectedDifficulty !== 'all') {
      const diffNum = parseInt(selectedDifficulty, 10);
      list = list.filter((s) => {
        const hard = parseInt(s.difficultyHard, 10);
        const normal = parseInt(s.difficultyNormal, 10);
        return hard === diffNum || normal === diffNum;
      });
    }

    return list;
  }, [songs, search, selectedDifficulty]);

  if (!isOpen) return null;

  const handleSelect = (song: SongItem, slot: 'star' | 'pro') => {
    onSelectSong(song, slot);
    setAppliedNotification(`Applied "${song.title}" to ${slot === 'star' ? 'Star' : 'Pro'} Mission!`);
    setTimeout(() => setAppliedNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141026] border border-purple-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between bg-[#191432]">
          <div>
            <h2 className="text-xl font-righteous text-white">
              Song List
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSync()}
              disabled={isSyncing}
              title="Refresh and sync from Google Sheets"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-200 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-pink-400' : ''}`} />
              <span className="hidden sm:inline">Sync Sheet</span>
            </button>

            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600/20 hover:bg-pink-600/40 border border-pink-500/30 text-pink-300 text-xs font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Sheet</span>
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Applied notification toast */}
        {appliedNotification && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {appliedNotification}
            </span>
            <button
              onClick={() => setAppliedNotification(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 bg-[#181330] border-b border-purple-500/20 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#100c22] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-purple-200 focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Difficulties</option>
              {[...Array(40)].map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Difficulty Lv. {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-16 text-purple-300/60">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No songs matching "{search}"</p>
              <p className="text-xs mt-1">Try another search keyword or clear filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredSongs.slice(0, 150).map((song) => (
                <div
                  key={song.id}
                  className="bg-[#1b1537] hover:bg-[#231b46] border border-purple-500/20 hover:border-pink-500/40 rounded-xl p-3 flex items-center justify-between gap-3 transition group"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-righteous text-white text-sm sm:text-base truncate group-hover:text-yellow-300 transition">
                      {song.title}
                    </h4>
                    <p className="text-xs text-purple-300 truncate font-sans">
                      {song.artist}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                      {song.difficultyEasy !== '-' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          Easy {song.difficultyEasy}
                        </span>
                      )}
                      {song.difficultyNormal !== '-' && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                          Normal {song.difficultyNormal}
                        </span>
                      )}
                      {song.difficultyHard !== '-' && (
                        <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold">
                          Hard {song.difficultyHard}
                        </span>
                      )}
                      {song.element && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {song.element}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Select Buttons (without icons) */}
                  <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSelect(song, 'star')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-righteous shadow-sm transition cursor-pointer"
                      title="Set as Star slot"
                    >
                      Star
                    </button>
                    <button
                      onClick={() => handleSelect(song, 'pro')}
                      className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-righteous shadow-sm transition cursor-pointer"
                      title="Set as Pro slot"
                    >
                      Pro
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredSongs.length > 150 && (
            <p className="text-center text-xs text-purple-400 py-3">
              Showing top 150 of {filteredSongs.length} songs. Use search for exact titles.
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#191432] border-t border-purple-500/20 flex items-center justify-between text-xs text-purple-300">
          <span>You can click to button to add faster</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
