import React, { useState, useEffect, useCallback } from 'react';
import {
  BannerConfig,
  DifficultyTier,
  LeaderboardSlotConfig,
  SheetSyncState,
  SongItem,
  SlotConfig,
} from './types';
import { fetchSongs, DEFAULT_SHEET_URL } from './utils/sheetService';
import { Navbar } from './components/Navbar';
import { CanvasStudio } from './components/CanvasStudio';
import { SlotEditor, SlotStyleAndPositionDock } from './components/SlotEditor';
import {
  LeaderboardEditor,
  LeaderboardStyleAndPositionDock,
} from './components/LeaderboardEditor';
import { PosterAndStyleEditor, PosterStyleAndPositionDock } from './components/PosterAndStyleEditor';
import { SongCatalogModal } from './components/SongCatalogModal';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { UpdateNoticeModal } from './components/UpdateNoticeModal';
import {
  renderBannerToCanvas,
  downloadCanvasImage,
  DEFAULT_BACKGROUND_URL,
} from './utils/canvasRenderer';
import { normalizeElementKey } from './utils/elementAssets';
import { Download } from 'lucide-react';

const createDefaultLeaderboardSlot = (): LeaderboardSlotConfig => ({
  coverImage: '',
  artist: '(artistname)',
  songName: '(Songname)',
  element: 'Vibe',
  difficultyTier: 'Normal',
  difficultyLevel: '32',
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  fit: 'cover',
  artistOffsetX: 0,
  artistOffsetY: 0,
  songOffsetX: 0,
  songOffsetY: 0,
  difficultyOffsetX: 0,
  difficultyOffsetY: 0,
  artistFontSize: 20,
  songFontSize: 21,
  difficultyFontSize: 18,
  artistTextColor: '#ffffff',
  textColor: '#fed835',
  strokeWidth: 4,
});

const createDefaultLeaderboardSlots = (): LeaderboardSlotConfig[] =>
  Array.from({ length: 8 }, () => createDefaultLeaderboardSlot());

const pickLevelForTier = (
  tier: DifficultyTier,
  easy?: string,
  normal?: string,
  hard?: string
): string | undefined => {
  const valid = (v?: string) => (v && v !== '-' ? v : undefined);
  if (tier === 'Easy') return valid(easy) || valid(normal) || valid(hard);
  if (tier === 'Normal') return valid(normal) || valid(hard) || valid(easy);
  return valid(hard) || valid(normal) || valid(easy);
};

const STORAGE_KEY = 'rhythm_banner_config_v2';
const LEGACY_STORAGE_KEY = 'rhythm_banner_config_v1';

const INITIAL_CONFIG: BannerConfig = {
  backgroundUrl: DEFAULT_BACKGROUND_URL,
  category: 'Weekly Missions & Leaderboard',
  starSlot: {
    coverImage: '',
    artist: 'FinnMK',
    songName: 'Monday Night Monsters',
    score: '12.345.678',
    element: '',
    difficultyTier: 'Normal',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    fit: 'cover',
    difficultyLevel: '14',
    artistOffsetX: -7,
    artistOffsetY: -10,
    songOffsetX: -2,
    songOffsetY: -7,
    artistFontSize: 27,
    songFontSize: 35,
    textColor: '#fed835',
    scoreColor: '#fed835',
    scoreFontSize: 34,
    strokeWidth: 6,
  },
  proSlot: {
    coverImage: '',
    artist: 'Camellia',
    songName: 'Crystallized',
    score: '12.345.678',
    element: '',
    difficultyTier: 'Normal',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    fit: 'cover',
    difficultyLevel: '26',
    artistOffsetX: -10,
    artistOffsetY: 1,
    songOffsetX: -7,
    songOffsetY: -4,
    artistFontSize: 28,
    songFontSize: 37,
    textColor: '#fed835',
    scoreColor: '#fed835',
    scoreFontSize: 34,
    strokeWidth: 6,
  },
  leaderboardSlots: createDefaultLeaderboardSlots(),
  poster: 'meelo',
  posterPrefix: 'POSTER: ',
  posterOffsetX: 0,
  posterOffsetY: 0,
  fontFamily: 'Righteous',
  textColor: '#fed835',
  strokeColor: '#1e1335',
  strokeWidth: 6,
  artistFontSize: 27,
  songFontSize: 35,
  scoreFontSize: 34,
  posterFontSize: 24,
  posterTextColor: '#fed835',
  posterStrokeColor: '#000000',
  exportScale: 1,
  exportFormat: 'image/png',
  exportQuality: 0.95,
};

export default function App() {
  const [config, setConfig] = useState<BannerConfig>(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEY);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        const rawLeaderboard: LeaderboardSlotConfig[] = Array.isArray(parsed.leaderboardSlots)
          ? parsed.leaderboardSlots
          : [];
        const normalizedLeaderboard = Array.from({ length: 8 }, (_, idx) => ({
          ...createDefaultLeaderboardSlot(),
          ...(rawLeaderboard[idx] || {}),
          scale: Math.max(1, rawLeaderboard[idx]?.scale ?? 1),
          fit: 'cover' as const,
          artistTextColor: rawLeaderboard[idx]?.artistTextColor || '#ffffff',
        }));

        return {
          ...INITIAL_CONFIG,
          ...parsed,
          backgroundUrl: DEFAULT_BACKGROUND_URL,
          category: 'Weekly Missions & Leaderboard',
          starSlot: {
            ...INITIAL_CONFIG.starSlot,
            ...(parsed.starSlot || {}),
            scale: Math.max(1, parsed.starSlot?.scale ?? 1),
            fit: 'cover',
            difficultyTier: parsed.starSlot?.difficultyTier || 'Normal',
          },
          proSlot: {
            ...INITIAL_CONFIG.proSlot,
            ...(parsed.proSlot || {}),
            scale: Math.max(1, parsed.proSlot?.scale ?? 1),
            fit: 'cover',
            difficultyTier: parsed.proSlot?.difficultyTier || 'Normal',
          },
          leaderboardSlots: normalizedLeaderboard,
        };
      }

      // Migrate content from legacy v1 while applying the new exact Star/Pro defaults, auto-fit covers, and white LB artist text
      const savedV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (savedV1) {
        const parsed = JSON.parse(savedV1);
        const rawLeaderboard: LeaderboardSlotConfig[] = Array.isArray(parsed.leaderboardSlots)
          ? parsed.leaderboardSlots
          : [];
        const normalizedLeaderboard = Array.from({ length: 8 }, (_, idx) => ({
          ...createDefaultLeaderboardSlot(),
          ...(rawLeaderboard[idx] || {}),
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          fit: 'cover' as const,
          artistTextColor: '#ffffff',
        }));

        return {
          ...INITIAL_CONFIG,
          ...parsed,
          backgroundUrl: DEFAULT_BACKGROUND_URL,
          category: 'Weekly Missions & Leaderboard',
          starSlot: {
            ...INITIAL_CONFIG.starSlot,
            ...(parsed.starSlot || {}),
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            fit: 'cover',
            artistOffsetX: INITIAL_CONFIG.starSlot.artistOffsetX,
            artistOffsetY: INITIAL_CONFIG.starSlot.artistOffsetY,
            songOffsetX: INITIAL_CONFIG.starSlot.songOffsetX,
            songOffsetY: INITIAL_CONFIG.starSlot.songOffsetY,
            artistFontSize: INITIAL_CONFIG.starSlot.artistFontSize,
            songFontSize: INITIAL_CONFIG.starSlot.songFontSize,
            strokeWidth: INITIAL_CONFIG.starSlot.strokeWidth,
            difficultyTier: parsed.starSlot?.difficultyTier || 'Normal',
          },
          proSlot: {
            ...INITIAL_CONFIG.proSlot,
            ...(parsed.proSlot || {}),
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            fit: 'cover',
            artistOffsetX: INITIAL_CONFIG.proSlot.artistOffsetX,
            artistOffsetY: INITIAL_CONFIG.proSlot.artistOffsetY,
            songOffsetX: INITIAL_CONFIG.proSlot.songOffsetX,
            songOffsetY: INITIAL_CONFIG.proSlot.songOffsetY,
            artistFontSize: INITIAL_CONFIG.proSlot.artistFontSize,
            songFontSize: INITIAL_CONFIG.proSlot.songFontSize,
            strokeWidth: INITIAL_CONFIG.proSlot.strokeWidth,
            difficultyTier: parsed.proSlot?.difficultyTier || 'Normal',
          },
          leaderboardSlots: normalizedLeaderboard,
        };
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'star' | 'pro' | 'leaderboard' | 'poster'>('star');
  const [activeLeaderboardIndex, setActiveLeaderboardIndex] = useState<number>(0);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSheetSettingsOpen, setIsSheetSettingsOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  const [syncState, setSyncState] = useState<SheetSyncState>({
    sheetUrl: DEFAULT_SHEET_URL,
    lastSynced: null,
    isLoading: false,
    error: null,
    totalSongs: 0,
  });

  const [isCanvasCollapsed, setIsCanvasCollapsed] = useState(false);

  // Save config to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Load songs on initial mount
  const loadSongsData = useCallback(async (sheetUrl: string = DEFAULT_SHEET_URL) => {
    setSyncState((prev) => ({ ...prev, isLoading: true, error: null, sheetUrl }));
    try {
      const result = await fetchSongs(sheetUrl);
      setSongs(result.songs);

      // Sync Element & sheet difficulty metadata for matched songs
      if (result.songs.length > 0) {
        const findMatchedSong = (slot: { selectedSongId?: string; songName?: string }) => {
          if (slot.selectedSongId) {
            const byId = result.songs.find((s) => s.id === slot.selectedSongId);
            if (byId) return byId;
          }
          const titleKey = (slot.songName || '').trim().toLowerCase();
          if (!titleKey || titleKey === '(songname)') return undefined;
          return result.songs.find((s) => s.title.trim().toLowerCase() === titleKey);
        };

        setConfig((prev) => {
          let changed = false;

          const syncSlot = <T extends { selectedSongId?: string; songName?: string; element?: string; sheetDiffEasy?: string; sheetDiffNormal?: string; sheetDiffHard?: string }>(slot: T): T => {
            const match = findMatchedSong(slot);
            if (!match) return slot;
            const nextEl = match.element
              ? normalizeElementKey(match.element) || match.element
              : slot.element || '';
            if (
              nextEl === (slot.element || '') &&
              match.difficultyEasy === slot.sheetDiffEasy &&
              match.difficultyNormal === slot.sheetDiffNormal &&
              match.difficultyHard === slot.sheetDiffHard
            ) {
              return slot;
            }
            changed = true;
            return {
              ...slot,
              element: nextEl,
              sheetDiffEasy: match.difficultyEasy,
              sheetDiffNormal: match.difficultyNormal,
              sheetDiffHard: match.difficultyHard,
            };
          };

          const nextStar = syncSlot(prev.starSlot);
          const nextPro = syncSlot(prev.proSlot);
          const nextLeaderboard = (prev.leaderboardSlots || []).map((lb) => syncSlot(lb));

          if (!changed) return prev;
          return {
            ...prev,
            starSlot: nextStar,
            proSlot: nextPro,
            leaderboardSlots: nextLeaderboard,
          };
        });
      }

      setSyncState((prev) => ({
        ...prev,
        isLoading: false,
        lastSynced: result.timestamp,
        totalSongs: result.songs.length,
      }));
    } catch (err: any) {
      setSyncState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to sync with Google Sheet',
      }));
    }
  }, []);

  useEffect(() => {
    loadSongsData();
  }, [loadSongsData]);

  // Handle slot update
  const handleUpdateStar = (updated: Partial<SlotConfig>) => {
    setConfig((prev) => ({
      ...prev,
      starSlot: { ...prev.starSlot, ...updated },
    }));
  };

  const handleUpdatePro = (updated: Partial<SlotConfig>) => {
    setConfig((prev) => ({
      ...prev,
      proSlot: { ...prev.proSlot, ...updated },
    }));
  };

  const handleUpdateLeaderboardSlot = (index: number, updated: Partial<LeaderboardSlotConfig>) => {
    setConfig((prev) => {
      const nextSlots = [...prev.leaderboardSlots];
      nextSlots[index] = { ...nextSlots[index], ...updated };
      return { ...prev, leaderboardSlots: nextSlots };
    });
  };

  const handleApplyLeaderboardStyleToAll = (style: Partial<LeaderboardSlotConfig>) => {
    setConfig((prev) => ({
      ...prev,
      leaderboardSlots: prev.leaderboardSlots.map((slot) => ({ ...slot, ...style })),
    }));
  };

  const handleUpdateConfig = (updated: Partial<BannerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  // When a song is selected from the catalog
  const handleSelectSongFromCatalog = (
    song: SongItem,
    slotType: 'star' | 'pro' | 'leaderboard',
    leaderboardIndex?: number
  ) => {
    const normalizedElement = normalizeElementKey(song.element) || song.element || '';

    if (slotType === 'leaderboard') {
      const targetIdx = leaderboardIndex !== undefined ? leaderboardIndex : activeLeaderboardIndex;
      const currentSlot = config.leaderboardSlots[targetIdx] || createDefaultLeaderboardSlot();
      const currentTier = currentSlot.difficultyTier || 'Normal';
      const nextLevel =
        pickLevelForTier(currentTier, song.difficultyEasy, song.difficultyNormal, song.difficultyHard) ||
        currentSlot.difficultyLevel;

      const lbUpdate: Partial<LeaderboardSlotConfig> = {
        selectedSongId: song.id,
        songName: song.title,
        artist: song.artist,
        element: normalizedElement,
        sheetDiffEasy: song.difficultyEasy,
        sheetDiffNormal: song.difficultyNormal,
        sheetDiffHard: song.difficultyHard,
        difficultyLevel: nextLevel,
      };
      if (song.coverArtUrl) {
        lbUpdate.coverImage = song.coverArtUrl;
        lbUpdate.scale = 1;
        lbUpdate.offsetX = 0;
        lbUpdate.offsetY = 0;
        lbUpdate.fit = 'cover';
      }
      handleUpdateLeaderboardSlot(targetIdx, lbUpdate);
      return;
    }

    const currentMissionSlot = slotType === 'star' ? config.starSlot : config.proSlot;
    const currentTier = currentMissionSlot.difficultyTier || 'Normal';
    const nextLevel =
      pickLevelForTier(currentTier, song.difficultyEasy, song.difficultyNormal, song.difficultyHard) ||
      currentMissionSlot.difficultyLevel;

    const slotUpdate: Partial<SlotConfig> = {
      selectedSongId: song.id,
      songName: song.title,
      artist: song.artist,
      element: normalizedElement,
      sheetDiffEasy: song.difficultyEasy,
      sheetDiffNormal: song.difficultyNormal,
      sheetDiffHard: song.difficultyHard,
      difficultyLevel: nextLevel,
    };
    if (song.coverArtUrl) {
      slotUpdate.coverImage = song.coverArtUrl;
      slotUpdate.scale = 1;
      slotUpdate.offsetX = 0;
      slotUpdate.offsetY = 0;
      slotUpdate.fit = 'cover';
    }

    if (slotType === 'star') {
      handleUpdateStar(slotUpdate);
    } else {
      handleUpdatePro(slotUpdate);
    }
  };

  // Direct export trigger from navbar or buttons
  const handleExport = async (scale: 1 | 1.3333 | 2) => {
    const exportCanvas = document.createElement('canvas');
    await renderBannerToCanvas(exportCanvas, config, scale);

    const resLabel = scale === 2 ? '4k' : scale === 1.3333 ? '2k' : '1080p';
    const cleanPoster = (config.poster || 'card').replace(/[^a-z0-9_-]/gi, '_');
    const filename = `mission_${cleanPoster}_${resLabel}.png`;

    await downloadCanvasImage(exportCanvas, filename, 'image/png');
  };

  const activeLeaderboardSlot =
    config.leaderboardSlots[activeLeaderboardIndex] || config.leaderboardSlots[0];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#0e0a1f] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        category={config.category}
        onCategoryChange={(cat) => handleUpdateConfig({ category: cat })}
        syncState={syncState}
        onSync={() => loadSongsData(syncState.sheetUrl)}
        onOpenSheetSettings={() => setIsSheetSettingsOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenUpdateLog={() => setIsNoticeOpen(true)}
      />

      {/* Main Workspace Layout — Full-viewport desktop studio without page scroll */}
      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-2.5 sm:p-3 flex flex-col lg:flex-row gap-3 lg:overflow-hidden">
        {/* Left Column: Preview Stage + Horizontal Style & Position Dock filling the space underneath */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-2.5 transition-all duration-300">
          <CanvasStudio
            config={config}
            isCollapsed={isCanvasCollapsed}
            onToggleCollapse={() => setIsCanvasCollapsed((prev) => !prev)}
            onSelectSlot={(slot) => {
              if (slot === 'star') setActiveTab('star');
              else if (slot === 'pro') setActiveTab('pro');
              else setActiveTab('poster');
            }}
          />

          {/* Bottom Dock under Preview: Font Styling & Text Position */}
          <div className="shrink-0">
            {activeTab === 'star' && (
              <SlotStyleAndPositionDock
                key="star-dock"
                slotType="star"
                slot={config.starSlot}
                onChange={handleUpdateStar}
              />
            )}
            {activeTab === 'pro' && (
              <SlotStyleAndPositionDock
                key="pro-dock"
                slotType="pro"
                slot={config.proSlot}
                onChange={handleUpdatePro}
              />
            )}
            {activeTab === 'leaderboard' && activeLeaderboardSlot && (
              <LeaderboardStyleAndPositionDock
                key={`leaderboard-dock-${activeLeaderboardIndex}`}
                activeIndex={activeLeaderboardIndex}
                slot={activeLeaderboardSlot}
                onChange={(updated) => handleUpdateLeaderboardSlot(activeLeaderboardIndex, updated)}
                onApplyStyleToAll={handleApplyLeaderboardStyleToAll}
              />
            )}
            {activeTab === 'poster' && (
              <PosterStyleAndPositionDock
                key="poster-dock"
                config={config}
                onChange={handleUpdateConfig}
              />
            )}
          </div>
        </div>

        {/* Right Column: Compact Tabbed Controls Panel (Cover art + Song inputs + Export) */}
        <div className="w-full lg:w-[400px] xl:w-[430px] shrink-0 flex flex-col lg:h-full bg-[#140f29] rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl">
          {/* Editor Navigation Tabs (No icons next to tab labels) */}
          <div className="flex items-center bg-[#171233] border-b border-purple-500/20 p-1.5 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('star')}
              className={`flex-1 flex items-center justify-center py-2 px-1.5 rounded-xl text-[11px] font-righteous transition cursor-pointer whitespace-nowrap ${
                activeTab === 'star'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-purple-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Star Mission</span>
            </button>

            <button
              onClick={() => setActiveTab('pro')}
              className={`flex-1 flex items-center justify-center py-2 px-1.5 rounded-xl text-[11px] font-righteous transition cursor-pointer whitespace-nowrap ${
                activeTab === 'pro'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30'
                  : 'text-purple-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Pro Mission</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-[1.15] flex items-center justify-center py-2 px-1.5 rounded-xl text-[11px] font-righteous transition cursor-pointer whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-[#140f29] shadow-md shadow-amber-500/30'
                  : 'text-purple-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveTab('poster')}
              className={`flex-[0.75] flex items-center justify-center py-2 px-1.5 rounded-xl text-[11px] font-righteous transition cursor-pointer whitespace-nowrap ${
                activeTab === 'poster'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Style</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 min-h-0 lg:overflow-y-auto p-3 space-y-2.5">
            {activeTab === 'star' && (
              <div key="star-tab" className="animate-fade-in-up">
                <SlotEditor
                  slotType="star"
                  slot={config.starSlot}
                  onChange={handleUpdateStar}
                  onOpenCatalog={() => setIsCatalogOpen(true)}
                  songs={songs}
                />
              </div>
            )}

            {activeTab === 'pro' && (
              <div key="pro-tab" className="animate-fade-in-up">
                <SlotEditor
                  slotType="pro"
                  slot={config.proSlot}
                  onChange={handleUpdatePro}
                  onOpenCatalog={() => setIsCatalogOpen(true)}
                  songs={songs}
                />
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div key="leaderboard-tab" className="animate-fade-in-up">
                <LeaderboardEditor
                  slots={config.leaderboardSlots}
                  activeIndex={activeLeaderboardIndex}
                  onSelectIndex={setActiveLeaderboardIndex}
                  onChangeSlot={handleUpdateLeaderboardSlot}
                  onOpenCatalog={(idx) => {
                    setActiveLeaderboardIndex(idx);
                    setIsCatalogOpen(true);
                  }}
                />
              </div>
            )}

            {activeTab === 'poster' && (
              <div key="poster-tab" className="animate-fade-in-up">
                <PosterAndStyleEditor
                  config={config}
                  onChange={handleUpdateConfig}
                />
              </div>
            )}
          </div>

          {/* Quick Action Footer with Save 1080p, 2K, 4K */}
          <div className="p-2.5 bg-[#171233] border-t border-purple-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="py-2 px-3 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 text-xs font-righteous flex items-center justify-center transition cursor-pointer whitespace-nowrap"
            >
              <span>Song List</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-righteous text-purple-300 uppercase px-1 hidden sm:inline">
                Save:
              </span>
              <button
                onClick={() => handleExport(1)}
                className="flex-1 sm:flex-none py-2 px-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-righteous flex items-center justify-center gap-1 shadow-md shadow-pink-600/25 transition cursor-pointer whitespace-nowrap"
                title="Save 1080p Full HD (1920×1080)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save 1080p</span>
              </button>

              <button
                onClick={() => handleExport(1.3333)}
                className="flex-1 sm:flex-none py-2 px-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-yellow-300 text-xs font-righteous flex items-center justify-center gap-1 shadow-md shadow-purple-600/25 transition cursor-pointer whitespace-nowrap"
                title="Save 2K QHD (2560×1440)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>2K</span>
              </button>

              <button
                onClick={() => handleExport(2)}
                className="flex-1 sm:flex-none py-2 px-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-righteous flex items-center justify-center gap-1 shadow-md shadow-fuchsia-600/25 transition cursor-pointer whitespace-nowrap"
                title="Save 4K Ultra HD (3840×2160)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>4K</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Song Catalog Modal */}
      <SongCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        songs={songs}
        onSelectSong={handleSelectSongFromCatalog}
        onSync={() => loadSongsData(syncState.sheetUrl)}
        isSyncing={syncState.isLoading}
        sheetUrl={syncState.sheetUrl}
        activeLeaderboardIndex={activeLeaderboardIndex}
        onChangeActiveLeaderboardIndex={setActiveLeaderboardIndex}
      />

      {/* Google Sheets Settings Modal */}
      <SheetSettingsModal
        isOpen={isSheetSettingsOpen}
        onClose={() => setIsSheetSettingsOpen(false)}
        syncState={syncState}
        onUpdateSheetUrl={async (newUrl) => {
          await loadSongsData(newUrl);
        }}
      />

      {/* Website Maintenance & Update Notice Popup */}
      <UpdateNoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
      />
    </div>
  );
}
