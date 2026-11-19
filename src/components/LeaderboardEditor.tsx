import React, { useRef } from 'react';
import { DifficultyTier, LeaderboardSlotConfig } from '../types';
import {
  Upload,
  Link as LinkIcon,
  Trash2,
  RotateCcw,
  Move,
  Palette,
  ZoomIn,
  ZoomOut,
  CopyCheck,
} from 'lucide-react';
import {
  ELEMENT_OPTIONS,
  getElementImageUrl,
  getElementFallbackUrl,
  normalizeElementKey,
} from '../utils/elementAssets';
import { DIFFICULTY_TIER_OPTIONS } from '../utils/frameAssets';

interface LeaderboardEditorProps {
  slots: LeaderboardSlotConfig[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onChangeSlot: (index: number, updated: Partial<LeaderboardSlotConfig>) => void;
  onOpenCatalog: (index: number) => void;
}

// Pairs match the exact 2-column × 4-row layout on the canvas:
// Left column: #1, #2, #3, #4 (indices 0, 1, 2, 3)
// Right column: #5, #6, #7, #8 (indices 4, 5, 6, 7)
const SLOT_GRID_ORDER = [0, 4, 1, 5, 2, 6, 3, 7];

export const LeaderboardEditor: React.FC<LeaderboardEditorProps> = ({
  slots,
  activeIndex,
  onSelectIndex,
  onChangeSlot,
  onOpenCatalog,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSlot = slots[activeIndex] || slots[0];
  const currentScale = Math.max(
    1,
    activeSlot?.scale !== undefined && activeSlot?.scale !== null ? activeSlot.scale : 1
  );
  const currentTier: DifficultyTier = activeSlot?.difficultyTier || 'Normal';

  if (!activeSlot) return null;

  const updateCurrent = (updated: Partial<LeaderboardSlotConfig>) => {
    onChangeSlot(activeIndex, updated);
  };

  const handleSelectDifficultyTier = (tier: DifficultyTier) => {
    const update: Partial<LeaderboardSlotConfig> = { difficultyTier: tier };
    const mappedLevel =
      tier === 'Easy'
        ? activeSlot.sheetDiffEasy
        : tier === 'Normal'
          ? activeSlot.sheetDiffNormal
          : activeSlot.sheetDiffHard;
    if (mappedLevel && mappedLevel !== '-') {
      update.difficultyLevel = mappedLevel;
    }
    updateCurrent(update);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateCurrent({
          coverImage: reader.result as string,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          fit: 'cover',
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Compact 2×4 Weekly Leaderboard Slot Selector (Mirrors Canvas Layout) */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-2 space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-semibold text-purple-200">
            Weekly Leaderboard (8 Songs)
          </span>
          <span className="text-[10px] font-righteous text-yellow-300">
            Editing #{activeIndex + 1}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {SLOT_GRID_ORDER.map((idx) => {
            const item = slots[idx];
            if (!item) return null;
            const isSelected = idx === activeIndex;
            const elUrl = getElementImageUrl(item.element);
            const tierDotClass =
              item.difficultyTier === 'Easy'
                ? 'bg-emerald-400'
                : item.difficultyTier === 'Hard'
                  ? 'bg-pink-400'
                  : 'bg-purple-400/50';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left transition cursor-pointer min-w-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/25 to-pink-600/25 border-yellow-400/70 text-white shadow-sm shadow-pink-500/20'
                    : 'bg-[#100c22] border-purple-500/20 text-purple-300 hover:border-purple-400/50 hover:text-white'
                }`}
              >
                <span
                  className={`text-[10px] font-righteous px-1 py-0.5 rounded shrink-0 tabular-nums ${
                    isSelected ? 'bg-yellow-400 text-[#140f29]' : 'bg-purple-900/60 text-purple-200'
                  }`}
                >
                  #{idx + 1}
                </span>
                {elUrl && (
                  <img
                    src={elUrl}
                    alt={item.element}
                    onError={(e) => {
                      const fallback = getElementFallbackUrl(item.element);
                      if (fallback && e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="w-3.5 h-3.5 object-contain shrink-0"
                  />
                )}
                <span className="text-[11px] truncate flex-1 font-medium">
                  {item.songName || `Song ${idx + 1}`}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${tierDotClass}`}
                  title={`Difficulty: ${item.difficultyTier || 'Normal'} ${item.difficultyLevel || ''}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cover Art for Active Leaderboard Slot */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50"></span>
            Cover art · Slot #{activeIndex + 1}
          </label>
          {activeSlot.coverImage && (
            <button
              type="button"
              onClick={() => updateCurrent({ coverImage: '', scale: 1, offsetX: 0, offsetY: 0 })}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-dashed border-purple-400/40 hover:border-pink-400 bg-purple-900/10 hover:bg-purple-900/20 text-purple-200 text-xs font-medium transition cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>Upload Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => onOpenCatalog(activeIndex)}
            className="flex items-center justify-center py-1.5 px-2 rounded-xl border border-purple-500/30 hover:border-purple-400 bg-purple-900/20 hover:bg-purple-900/40 text-purple-200 text-xs font-medium transition cursor-pointer whitespace-nowrap"
          >
            Pick from Song List
          </button>
        </div>

        <div className="relative">
          <LinkIcon className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Or paste direct image URL (https://...)"
            value={activeSlot.coverImage.startsWith('data:') ? '' : activeSlot.coverImage}
            onChange={(e) =>
              updateCurrent({
                coverImage: e.target.value,
                fit: 'cover',
                scale: 1,
                offsetX: 0,
                offsetY: 0,
              })
            }
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 transition"
          />
        </div>

        {activeSlot.coverImage && (
          <div className="pt-1.5 border-t border-purple-500/20 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                updateCurrent({ scale: Math.max(1, Number((currentScale - 0.05).toFixed(2))) })
              }
              className="w-5 h-5 flex items-center justify-center rounded bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={currentScale}
              onChange={(e) => updateCurrent({ scale: parseFloat(e.target.value) })}
              className="flex-1 accent-pink-500 cursor-pointer h-1.5"
            />
            <button
              type="button"
              onClick={() =>
                updateCurrent({ scale: Math.min(2.5, Number((currentScale + 0.05).toFixed(2))) })
              }
              className="w-5 h-5 flex items-center justify-center rounded bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <span className="font-mono text-[10px] text-yellow-300 tabular-nums w-9 text-right">
              {Math.round(currentScale * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* 3. Artist, Song Name, Element & Difficulty */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-2.5 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-purple-200 block mb-0.5">
              Artist Name
            </label>
            <input
              type="text"
              value={activeSlot.artist}
              onChange={(e) => updateCurrent({ artist: e.target.value })}
              placeholder="(artistname)"
              className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white font-righteous placeholder-purple-400/40 focus:outline-none focus:border-white transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-purple-200 block mb-0.5">
              Song Title
            </label>
            <input
              type="text"
              value={activeSlot.songName}
              onChange={(e) => updateCurrent({ songName: e.target.value })}
              placeholder="(Songname)"
              className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-2.5 py-1.5 text-xs text-yellow-300 font-righteous placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>
        </div>

        {/* Element & Difficulty Level Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-purple-200 block mb-0.5">
              Element
            </label>
            <div className="flex items-center gap-1.5 bg-[#100c22] border border-purple-500/30 rounded-xl px-2 py-1 focus-within:border-yellow-400 transition">
              {getElementImageUrl(activeSlot.element) ? (
                <img
                  src={getElementImageUrl(activeSlot.element)}
                  alt={activeSlot.element || 'Element'}
                  onError={(e) => {
                    const fallback = getElementFallbackUrl(activeSlot.element);
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="w-5 h-5 object-contain shrink-0"
                />
              ) : (
                <span className="w-5 h-5 rounded bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-[10px] text-purple-400 shrink-0">
                  -
                </span>
              )}
              <select
                value={normalizeElementKey(activeSlot.element)}
                onChange={(e) => updateCurrent({ element: e.target.value })}
                className="w-full bg-transparent text-xs text-yellow-300 font-righteous focus:outline-none cursor-pointer truncate py-0.5"
              >
                <option value="" className="bg-[#140f29] text-purple-300">
                  None
                </option>
                {ELEMENT_OPTIONS.map((el) => (
                  <option key={el} value={el} className="bg-[#140f29] text-white">
                    {el}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-purple-200 block mb-0.5">
              Difficulty
            </label>
            <input
              type="text"
              value={activeSlot.difficultyLevel}
              onChange={(e) => updateCurrent({ difficultyLevel: e.target.value })}
              placeholder="32"
              className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-2.5 py-1.5 text-xs text-yellow-300 font-righteous placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition tabular-nums"
            />
          </div>
        </div>

        {/* Manual Difficulty Tier */}
        <div>
          <label className="text-[11px] font-semibold text-purple-200 block mb-0.5">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-1 bg-[#100c22] p-1 rounded-xl border border-purple-500/30">
            {DIFFICULTY_TIER_OPTIONS.map((tier) => {
              const isActive = currentTier === tier;
              const activeClasses =
                tier === 'Easy'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/40'
                  : tier === 'Hard'
                    ? 'bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white shadow-sm shadow-pink-600/40'
                    : 'bg-purple-600 text-white shadow-sm shadow-purple-600/40';
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleSelectDifficultyTier(tier)}
                  className={`py-1 px-2 rounded-lg text-xs font-righteous transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? activeClasses
                      : 'text-purple-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface LeaderboardStyleAndPositionDockProps {
  activeIndex: number;
  slot: LeaderboardSlotConfig;
  onChange: (updated: Partial<LeaderboardSlotConfig>) => void;
  onApplyStyleToAll: (style: Partial<LeaderboardSlotConfig>) => void;
}

export const LeaderboardStyleAndPositionDock: React.FC<LeaderboardStyleAndPositionDockProps> = ({
  activeIndex,
  slot,
  onChange,
  onApplyStyleToAll,
}) => {
  const artistX = slot.artistOffsetX || 0;
  const artistY = slot.artistOffsetY || 0;
  const songX = slot.songOffsetX || 0;
  const songY = slot.songOffsetY || 0;
  const diffX = slot.difficultyOffsetX || 0;
  const diffY = slot.difficultyOffsetY || 0;

  const artistSize = slot.artistFontSize || 20;
  const songSize = slot.songFontSize || 21;
  const diffSize = slot.difficultyFontSize || 18;
  const strokeWidth = slot.strokeWidth !== undefined ? slot.strokeWidth : 4;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-fade-in">
      {/* Left Dock Card: Leaderboard Font Styling */}
      <div className="bg-[#140f29] border border-purple-500/20 rounded-2xl p-3 space-y-2 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Palette className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="text-xs font-semibold text-purple-100 whitespace-nowrap">
              Font Styling
            </span>
            <span className="text-[11px] text-yellow-300 truncate">
              · LB #{activeIndex + 1}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                onApplyStyleToAll({
                  artistTextColor: slot.artistTextColor || '#ffffff',
                  textColor: slot.textColor || '#fed835',
                  artistFontSize: artistSize,
                  songFontSize: songSize,
                  difficultyFontSize: diffSize,
                  strokeWidth,
                })
              }
              className="text-[10px] text-emerald-300 hover:text-emerald-200 flex items-center gap-1 cursor-pointer whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30"
              title="Apply current font colors & sizes to all 8 Leaderboard slots"
            >
              <CopyCheck className="w-3 h-3" /> All 8
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  artistTextColor: '#ffffff',
                  textColor: '#fed835',
                  artistFontSize: 20,
                  songFontSize: 21,
                  difficultyFontSize: 18,
                  strokeWidth: 4,
                })
              }
              className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Artist (White) & Song/Difficulty (Yellow) Color Pickers */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between gap-1.5 bg-[#100c22] px-2 py-1.5 rounded-xl border border-purple-500/20">
            <span className="text-[11px] text-purple-300 whitespace-nowrap">Artist</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={slot.artistTextColor || '#ffffff'}
                onChange={(e) => onChange({ artistTextColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 shrink-0"
                title="Artist Name Color (Default White)"
              />
              <input
                type="text"
                value={slot.artistTextColor || '#ffffff'}
                onChange={(e) => onChange({ artistTextColor: e.target.value })}
                className="w-[68px] bg-[#140f29] border border-purple-500/30 rounded-md px-1.5 py-0.5 text-[11px] text-white uppercase font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 bg-[#100c22] px-2 py-1.5 rounded-xl border border-purple-500/20">
            <span className="text-[11px] text-purple-300 whitespace-nowrap">Song</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={slot.textColor || '#fed835'}
                onChange={(e) => onChange({ textColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 shrink-0"
                title="Song & Difficulty Color"
              />
              <input
                type="text"
                value={slot.textColor || '#fed835'}
                onChange={(e) => onChange({ textColor: e.target.value })}
                className="w-[68px] bg-[#140f29] border border-purple-500/30 rounded-md px-1.5 py-0.5 text-[11px] text-white uppercase font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2×2 Font Size & Stroke Sliders */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div>
            <div className="flex justify-between text-[10px] text-purple-300 mb-0.5">
              <span>Artist Size</span>
              <span className="font-mono text-yellow-400 tabular-nums">{artistSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="30"
              value={artistSize}
              onChange={(e) => onChange({ artistFontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-purple-300 mb-0.5">
              <span>Song Size</span>
              <span className="font-mono text-yellow-400 tabular-nums">{songSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="32"
              value={songSize}
              onChange={(e) => onChange({ songFontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-purple-300 mb-0.5">
              <span>Difficulty Size</span>
              <span className="font-mono text-yellow-400 tabular-nums">{diffSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="28"
              value={diffSize}
              onChange={(e) => onChange({ difficultyFontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-purple-300 mb-0.5">
              <span>Stroke Width</span>
              <span className="font-mono text-purple-300 tabular-nums">{strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={strokeWidth}
              onChange={(e) => onChange({ strokeWidth: parseInt(e.target.value, 10) })}
              className="w-full accent-purple-400 h-1.5"
            />
          </div>
        </div>
      </div>

      {/* Right Dock Card: Leaderboard Text Position */}
      <div className="bg-[#140f29] border border-purple-500/20 rounded-2xl p-3 space-y-1.5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Move className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span className="text-xs font-semibold text-purple-100 whitespace-nowrap">
              Text Position
            </span>
            <span className="text-[11px] text-yellow-300 truncate">
              · LB #{activeIndex + 1}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                artistOffsetX: 0,
                artistOffsetY: 0,
                songOffsetX: 0,
                songOffsetY: 0,
                difficultyOffsetX: 0,
                difficultyOffsetY: 0,
              })
            }
            className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Artist X/Y */}
        <div className="bg-[#100c22] px-2.5 py-1.5 rounded-xl border border-purple-500/20">
          <div className="flex justify-between text-[10px] text-purple-200 mb-0.5">
            <span>Artist</span>
            <span className="font-mono text-yellow-400 tabular-nums">
              X:{artistX} · Y:{artistY}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="range"
              min="-80"
              max="80"
              value={artistX}
              onChange={(e) => onChange({ artistOffsetX: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
              title="Artist Left / Right"
            />
            <input
              type="range"
              min="-60"
              max="60"
              value={artistY}
              onChange={(e) => onChange({ artistOffsetY: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
              title="Artist Up / Down"
            />
          </div>
        </div>

        {/* Song X/Y */}
        <div className="bg-[#100c22] px-2.5 py-1.5 rounded-xl border border-purple-500/20">
          <div className="flex justify-between text-[10px] text-purple-200 mb-0.5">
            <span>Song</span>
            <span className="font-mono text-yellow-400 tabular-nums">
              X:{songX} · Y:{songY}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="range"
              min="-80"
              max="80"
              value={songX}
              onChange={(e) => onChange({ songOffsetX: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
              title="Song Left / Right"
            />
            <input
              type="range"
              min="-60"
              max="60"
              value={songY}
              onChange={(e) => onChange({ songOffsetY: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
              title="Song Up / Down"
            />
          </div>
        </div>

        {/* Difficulty X/Y */}
        <div className="bg-[#100c22] px-2.5 py-1.5 rounded-xl border border-purple-500/20">
          <div className="flex justify-between text-[10px] text-purple-200 mb-0.5">
            <span>Difficulty</span>
            <span className="font-mono text-yellow-400 tabular-nums">
              X:{diffX} · Y:{diffY}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="range"
              min="-80"
              max="80"
              value={diffX}
              onChange={(e) => onChange({ difficultyOffsetX: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
              title="Difficulty Left / Right"
            />
            <input
              type="range"
              min="-60"
              max="60"
              value={diffY}
              onChange={(e) => onChange({ difficultyOffsetY: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
              title="Difficulty Up / Down"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
