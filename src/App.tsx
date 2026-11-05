import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { BannerConfig, SheetSyncState, SongItem, SlotConfig } from './types';
import { fetchSongs, DEFAULT_SHEET_URL } from './utils/sheetService';
import { Navbar } from './components/Navbar';
import { CanvasStudio } from './components/CanvasStudio';
import { SlotEditor } from './components/SlotEditor';
import { PosterAndStyleEditor } from './components/PosterAndStyleEditor';
import { SongCatalogModal } from './components/SongCatalogModal';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { renderBannerToCanvas, downloadCanvasImage, DEFAULT_BACKGROUND_URL, resolveAssetUrl } from './utils/canvasRenderer';
import { Download } from 'lucide-react';

const INITIAL_CONFIG: BannerConfig = {
  backgroundUrl: DEFAULT_BACKGROUND_URL,
  category: 'Weekly Missions Category',
  starSlot: {
    coverImage: '',
    artist: 'FinnMK',
    songName: 'Monday Night Monsters',
    score: '12.345.678',
    scale: 0.9,
    offsetX: 0,
    offsetY: 0,
    fit: 'cover',
    difficultyLevel: '14',
    artistOffsetX: 0,
    artistOffsetY: 0,
    songOffsetX: 0,
    songOffsetY: 0,
    artistFontSize: 28,
    songFontSize: 34,
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
    scale: 0.9,
    offsetX: 0,
    offsetY: 0,
    fit: 'cover',
    difficultyLevel: '26',
    artistOffsetX: 0,
    artistOffsetY: 0,
    songOffsetX: 0,
    songOffsetY: 0,
    artistFontSize: 28,
    songFontSize: 34,
    textColor: '#fed835',
    scoreColor: '#fed835',
    scoreFontSize: 34,
    strokeWidth: 6,
  },
  poster: 'meelo',
  posterPrefix: 'POSTER: ',
  posterOffsetX: 0,
  posterOffsetY: 0,
  fontFamily: 'Righteous',
  textColor: '#fed835',
  strokeColor: '#1e1335',
  strokeWidth: 6,
  artistFontSize: 28,
  songFontSize: 34,
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
      const saved = localStorage.getItem('rhythm_banner_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.backgroundUrl && parsed.backgroundUrl.includes('WeeklyMission_1e414277.png')) {
          parsed.backgroundUrl = DEFAULT_BACKGROUND_URL;
        } else if (parsed.backgroundUrl) {
          parsed.backgroundUrl = resolveAssetUrl(parsed.backgroundUrl);
        }
        return { ...INITIAL_CONFIG, ...parsed };
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'star' | 'pro' | 'poster'>('star');
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSheetSettingsOpen, setIsSheetSettingsOpen] = useState(false);
  const [targetCatalogSlot, setTargetCatalogSlot] = useState<'star' | 'pro'>('star');

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
      localStorage.setItem('rhythm_banner_config_v1', JSON.stringify(config));
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

  const handleUpdateConfig = (updated: Partial<BannerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  // When a song is selected from the catalog
  const handleSelectSongFromCatalog = (song: SongItem, slotType: 'star' | 'pro') => {
    const slotUpdate: Partial<SlotConfig> = {
      songName: song.title,
      artist: song.artist,
      difficultyLevel: song.difficultyHard !== '-' ? song.difficultyHard : song.difficultyNormal,
    };
    if (song.coverArtUrl) {
      slotUpdate.coverImage = song.coverArtUrl;
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

  // Reset to initial
  const handleReset = () => {
    if (window.confirm('Reset banner inputs to defaults?')) {
      setConfig(INITIAL_CONFIG);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0a1f] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        category={config.category}
        onCategoryChange={(cat) => handleUpdateConfig({ category: cat })}
        syncState={syncState}
        onSync={() => loadSongsData(syncState.sheetUrl)}
        onOpenSheetSettings={() => setIsSheetSettingsOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Interactive Canvas Viewport (dominant workspace) */}
        <div className="flex-1 w-full flex flex-col transition-all duration-300">
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
        </div>

        {/* Right Column: Tabbed Controls Panel */}
        <div className="w-full lg:w-[440px] shrink-0 flex flex-col bg-[#140f29] rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl">
          {/* Editor Navigation Tabs */}
          <div className="grid grid-cols-3 bg-[#171233] border-b border-purple-500/20 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('star')}
              className={`flex items-center justify-center py-2.5 px-2 rounded-xl text-xs font-righteous transition cursor-pointer ${
                activeTab === 'star'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-purple-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Star Mission</span>
            </button>

            <button
              onClick={() => setActiveTab('pro')}
              className={`flex items-center justify-center py-2.5 px-2 rounded-xl text-xs font-righteous transition cursor-pointer ${
                activeTab === 'pro'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30'
                  : 'text-purple-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Pro Mission</span>
            </button>

            <button
              onClick={() => setActiveTab('poster')}
              className={`flex items-center justify-center py-2.5 px-2 rounded-xl text-xs font-righteous transition cursor-pointer ${
                activeTab === 'poster'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Style</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'star' && (
              <SlotEditor
                slotType="star"
                slot={config.starSlot}
                onChange={handleUpdateStar}
                onOpenCatalog={() => {
                  setTargetCatalogSlot('star');
                  setIsCatalogOpen(true);
                }}
                songs={songs}
              />
            )}

            {activeTab === 'pro' && (
              <SlotEditor
                slotType="pro"
                slot={config.proSlot}
                onChange={handleUpdatePro}
                onOpenCatalog={() => {
                  setTargetCatalogSlot('pro');
                  setIsCatalogOpen(true);
                }}
                songs={songs}
              />
            )}

            {activeTab === 'poster' && (
              <PosterAndStyleEditor
                config={config}
                onChange={handleUpdateConfig}
              />
            )}
          </div>

          {/* Quick Action Footer with Save 1080p, 2K, 4K */}
          <div className="p-3 bg-[#171233] border-t border-purple-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="py-2 px-3 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 text-xs font-righteous flex items-center justify-center transition cursor-pointer"
            >
              <span>Song List</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-righteous text-purple-300 uppercase px-1 hidden sm:inline">
                Save:
              </span>
              <button
                onClick={() => handleExport(1)}
                className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-righteous flex items-center justify-center gap-1 shadow-md shadow-pink-600/25 transition cursor-pointer"
                title="Save 1080p Full HD (1920×1080)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save 1080p</span>
              </button>

              <button
                onClick={() => handleExport(1.3333)}
                className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-yellow-300 text-xs font-righteous flex items-center justify-center gap-1 shadow-md shadow-purple-600/25 transition cursor-pointer"
                title="Save 2K QHD (2560×1440)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>2K</span>
              </button>

              <button
                onClick={() => handleExport(2)}
                className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-righteous flex items-center justify-center gap-1 shadow-md shadow-fuchsia-600/25 transition cursor-pointer"
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
    </div>
  );
}
