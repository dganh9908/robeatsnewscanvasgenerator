import React, { useRef } from 'react';
import { DifficultyTier, SlotConfig, SongItem } from '../types';
import {
  Upload,
  Link as LinkIcon,
  Trash2,
  RotateCcw,
  Move,
  Palette,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  ELEMENT_OPTIONS,
  getElementImageUrl,
  getElementFallbackUrl,
  normalizeElementKey,
} from '../utils/elementAssets';
import { DIFFICULTY_TIER_OPTIONS } from '../utils/frameAssets';

interface SlotEditorProps {
  slotType: 'star' | 'pro';
  slot: SlotConfig;
  onChange: (updated: Partial<SlotConfig>) => void;
  onOpenCatalog: () => void;
  songs: SongItem[];
}

export const SlotEditor: React.FC<SlotEditorProps> = ({
  slot,
  onChange,
  onOpenCatalog,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current cover scale (minimum 1.0 = auto-fit to frame)
  const currentScale = Math.max(1, slot.scale !== undefined && slot.scale !== null ? slot.scale : 1);
  const currentTier: DifficultyTier = slot.difficultyTier || 'Normal';

  const handleSelectDifficultyTier = (tier: DifficultyTier) => {
    const update: Partial<SlotConfig> = { difficultyTier: tier };
    const mappedLevel =
      tier === 'Easy'
        ? slot.sheetDiffEasy
        : tier === 'Normal'
          ? slot.sheetDiffNormal
          : slot.sheetDiffHard;
    if (mappedLevel && mappedLevel !== '-') {
      update.difficultyLevel = mappedLevel;
    }
    onChange(update);
  };

  // Handle local image file upload — always auto-fit to frame
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({
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
      {/* 1. Cover Art */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50"></span>
            Cover art
          </label>
          {slot.coverImage && (
            <button
              onClick={() => onChange({ coverImage: '', scale: 1, offsetX: 0, offsetY: 0 })}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Clear Cover
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-dashed border-purple-400/40 hover:border-pink-400 bg-purple-900/10 hover:bg-purple-900/20 text-purple-200 text-xs font-medium transition cursor-pointer whitespace-nowrap"
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

          {/* Pick from Song List Button */}
          <button
            onClick={onOpenCatalog}
            className="flex items-center justify-center py-1.5 px-2.5 rounded-xl border border-purple-500/30 hover:border-purple-400 bg-purple-900/20 hover:bg-purple-900/40 text-purple-200 text-xs font-medium transition cursor-pointer whitespace-nowrap"
          >
            Pick from Song List
          </button>
        </div>

        {/* URL Input */}
        <div className="relative">
          <LinkIcon className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Or paste direct image URL (https://...)"
            value={slot.coverImage.startsWith('data:') ? '' : slot.coverImage}
            onChange={(e) =>
              onChange({
                coverImage: e.target.value,
                fit: 'cover',
                scale: 1,
                offsetX: 0,
                offsetY: 0,
              })
            }
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 transition"
          />
        </div>

        {/* Cover Art Scale (Auto-fit at 100% + Zoom In) */}
        {slot.coverImage && (
          <div className="pt-1.5 border-t border-purple-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300 font-medium flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-pink-400" />
                Cover Zoom
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-yellow-300 text-[11px] font-semibold tabular-nums">
                  {Math.round(currentScale * 100)}% ({currentScale.toFixed(2)}x)
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ scale: 1, offsetX: 0, offsetY: 0, fit: 'cover' })}
                  className="text-[10px] text-purple-400 hover:text-white px-1.5 py-0.5 rounded bg-purple-900/40 border border-purple-500/30 transition cursor-pointer"
                  title="Auto-fit to frame (100%)"
                >
                  Auto Fit
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ scale: Math.max(1, Number((currentScale - 0.05).toFixed(2))) })}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 hover:text-white transition cursor-pointer"
                title="Zoom Out (-5%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={currentScale}
                onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
                className="flex-1 accent-pink-500 cursor-pointer"
              />

              <button
                type="button"
                onClick={() => onChange({ scale: Math.min(2.5, Number((currentScale + 0.05).toFixed(2))) })}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 hover:text-white transition cursor-pointer"
                title="Zoom In (+5%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Text, Difficulty & Element Edits */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-2.5 space-y-2">
        {/* Artist Input */}
        <div>
          <label className="text-xs font-semibold text-purple-200 block mb-1">
            Artist Name
          </label>
          <input
            type="text"
            value={slot.artist}
            onChange={(e) => onChange({ artist: e.target.value })}
            placeholder="e.g. FinnMK, Kawai Sprite, Camellia..."
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-3 py-1.5 text-sm text-yellow-300 font-righteous placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition"
          />
        </div>

        {/* Song Name Multiline Input */}
        <div>
          <label className="text-xs font-semibold text-purple-200 block mb-1">
            Song Title
          </label>
          <textarea
            rows={2}
            value={slot.songName}
            onChange={(e) => onChange({ songName: e.target.value })}
            placeholder="Type song title..."
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-3 py-1.5 text-sm text-yellow-300 font-righteous placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition resize-none"
          />
        </div>

        {/* Score & Element Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-purple-200 block mb-1">
              Score
            </label>
            <input
              type="text"
              value={slot.score}
              onChange={(e) => onChange({ score: e.target.value })}
              placeholder="12.345.678"
              className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-3 py-1.5 text-sm text-yellow-300 font-righteous tracking-wider placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition tabular-nums"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-purple-200 block mb-1">
              Element
            </label>
            <div className="flex items-center gap-1.5 bg-[#100c22] border border-purple-500/30 rounded-xl px-2 py-1 focus-within:border-yellow-400 transition">
              {getElementImageUrl(slot.element) ? (
                <img
                  src={getElementImageUrl(slot.element)}
                  alt={slot.element || 'Element'}
                  onError={(e) => {
                    const fallback = getElementFallbackUrl(slot.element);
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="w-6 h-6 object-contain shrink-0"
                />
              ) : (
                <span className="w-6 h-6 rounded-md bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-[10px] text-purple-400 shrink-0">
                  -
                </span>
              )}
              <select
                value={normalizeElementKey(slot.element)}
                onChange={(e) => onChange({ element: e.target.value })}
                className="w-full bg-transparent text-xs text-yellow-300 font-righteous focus:outline-none cursor-pointer truncate py-0.5"
                title="Synced from Sheet Element column"
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
        </div>

        {/* Manual Difficulty Selection */}
        <div>
          <label className="text-xs font-semibold text-purple-200 block mb-1">
            Difficulty
          </label>
          <div className="flex items-center gap-1.5">
            <div className="grid grid-cols-3 gap-1 flex-1 bg-[#100c22] p-1 rounded-xl border border-purple-500/30">
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
            <input
              type="text"
              value={slot.difficultyLevel || ''}
              onChange={(e) => onChange({ difficultyLevel: e.target.value })}
              placeholder="Lv."
              title="Manual Difficulty Level"
              className="w-16 bg-[#100c22] border border-purple-500/30 rounded-xl px-2 py-1.5 text-xs text-center text-yellow-300 font-righteous placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition tabular-nums"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface SlotStyleAndPositionDockProps {
  slotType: 'star' | 'pro';
  slot: SlotConfig;
  onChange: (updated: Partial<SlotConfig>) => void;
}

export const SlotStyleAndPositionDock: React.FC<SlotStyleAndPositionDockProps> = ({
  slotType,
  slot,
  onChange,
}) => {
  const isStar = slotType === 'star';
  const defaultArtistSize = isStar ? 27 : 28;
  const defaultSongSize = isStar ? 35 : 37;
  const defaultArtistX = isStar ? -7 : -10;
  const defaultArtistY = isStar ? -10 : 1;
  const defaultSongX = isStar ? -2 : -7;
  const defaultSongY = isStar ? -7 : -4;

  const artistX = slot.artistOffsetX !== undefined ? slot.artistOffsetX : defaultArtistX;
  const artistY = slot.artistOffsetY !== undefined ? slot.artistOffsetY : defaultArtistY;
  const songX = slot.songOffsetX !== undefined ? slot.songOffsetX : defaultSongX;
  const songY = slot.songOffsetY !== undefined ? slot.songOffsetY : defaultSongY;

  const currentScoreSize = slot.scoreFontSize || 34;
  const currentStrokeWidth = slot.strokeWidth !== undefined ? slot.strokeWidth : 6;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-fade-in">
      {/* Left Dock Card: Font Styling */}
      <div className="bg-[#140f29] border border-purple-500/20 rounded-2xl p-3 space-y-2 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Palette className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="text-xs font-semibold text-purple-100 whitespace-nowrap">
              Font Styling
            </span>
            <span className="text-[11px] text-purple-400 truncate">
              · {isStar ? 'Star Mission' : 'Pro Mission'}
            </span>
          </div>
          <button
            onClick={() =>
              onChange({
                textColor: '#fed835',
                scoreColor: '#fed835',
                artistFontSize: defaultArtistSize,
                songFontSize: defaultSongSize,
                scoreFontSize: 34,
                strokeWidth: 6,
              })
            }
            className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Reset Styles
          </button>
        </div>

        {/* Side-by-side Color Pickers */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between gap-1.5 bg-[#100c22] px-2 py-1.5 rounded-xl border border-purple-500/20">
            <span className="text-[11px] text-purple-300 whitespace-nowrap">Text</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={slot.textColor || '#fed835'}
                onChange={(e) => onChange({ textColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 shrink-0"
                title="Artist & Song Text Color"
              />
              <input
                type="text"
                value={slot.textColor || '#fed835'}
                onChange={(e) => onChange({ textColor: e.target.value })}
                className="w-[70px] bg-[#140f29] border border-purple-500/30 rounded-md px-1.5 py-0.5 text-[11px] text-white uppercase font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 bg-[#100c22] px-2 py-1.5 rounded-xl border border-purple-500/20">
            <span className="text-[11px] text-purple-300 whitespace-nowrap">Score</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={slot.scoreColor || '#fed835'}
                onChange={(e) => onChange({ scoreColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 shrink-0"
                title="Score Text Font Color"
              />
              <input
                type="text"
                value={slot.scoreColor || '#fed835'}
                onChange={(e) => onChange({ scoreColor: e.target.value })}
                className="w-[70px] bg-[#140f29] border border-purple-500/30 rounded-md px-1.5 py-0.5 text-[11px] text-white uppercase font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Compact 2x2 Font Size & Stroke Sliders */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div>
            <div className="flex justify-between text-[10px] text-purple-300 mb-0.5">
              <span>Artist Size</span>
              <span className="font-mono text-yellow-400 tabular-nums">{slot.artistFontSize || defaultArtistSize}px</span>
            </div>
            <input
              type="range"
              min="18"
              max="44"
              value={slot.artistFontSize || defaultArtistSize}
              onChange={(e) => onChange({ artistFontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-purple-300 mb-0.5">
              <span>Song Title Size</span>
              <span className="font-mono text-yellow-400 tabular-nums">{slot.songFontSize || defaultSongSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="52"
              value={slot.songFontSize || defaultSongSize}
              onChange={(e) => onChange({ songFontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-purple-300 mb-0.5">
              <span>Score Size</span>
              <span className="font-mono text-yellow-400 tabular-nums">{currentScoreSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="52"
              value={currentScoreSize}
              onChange={(e) => onChange({ scoreFontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400 h-1.5"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-purple-300 mb-0.5">
              <span>Stroke Width</span>
              <span className="font-mono text-purple-300 tabular-nums">{currentStrokeWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={currentStrokeWidth}
              onChange={(e) => onChange({ strokeWidth: parseInt(e.target.value, 10) })}
              className="w-full accent-purple-400 h-1.5"
            />
          </div>
        </div>
      </div>

      {/* Right Dock Card: Text Position */}
      <div className="bg-[#140f29] border border-purple-500/20 rounded-2xl p-3 space-y-2 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Move className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span className="text-xs font-semibold text-purple-100 whitespace-nowrap">
              Text Position
            </span>
            <span className="text-[11px] text-purple-400 truncate">
              · {isStar ? 'Star Mission' : 'Pro Mission'}
            </span>
          </div>
          <button
            onClick={() =>
              onChange({
                artistOffsetX: defaultArtistX,
                artistOffsetY: defaultArtistY,
                songOffsetX: defaultSongX,
                songOffsetY: defaultSongY,
              })
            }
            className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Artist Position Sliders */}
        <div className="bg-[#100c22] px-2.5 py-2 rounded-xl border border-purple-500/20 space-y-1">
          <div className="flex justify-between text-[11px] text-purple-200">
            <span>Artist Position</span>
            <span className="font-mono text-[10px] text-yellow-400 tabular-nums">
              X: {artistX > 0 ? `+${artistX}` : artistX}px · Y: {artistY > 0 ? `+${artistY}` : artistY}px
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-purple-400 block">Left / Right</label>
              <input
                type="range"
                min="-150"
                max="150"
                value={artistX}
                onChange={(e) => onChange({ artistOffsetX: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400 h-1.5"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-400 block">Up / Down</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={artistY}
                onChange={(e) => onChange({ artistOffsetY: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400 h-1.5"
              />
            </div>
          </div>
        </div>

        {/* Song Name Position Sliders */}
        <div className="bg-[#100c22] px-2.5 py-2 rounded-xl border border-purple-500/20 space-y-1">
          <div className="flex justify-between text-[11px] text-purple-200">
            <span>Song Title Position</span>
            <span className="font-mono text-[10px] text-yellow-400 tabular-nums">
              X: {songX > 0 ? `+${songX}` : songX}px · Y: {songY > 0 ? `+${songY}` : songY}px
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-purple-400 block">Left / Right</label>
              <input
                type="range"
                min="-150"
                max="150"
                value={songX}
                onChange={(e) => onChange({ songOffsetX: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400 h-1.5"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-400 block">Up / Down</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={songY}
                onChange={(e) => onChange({ songOffsetY: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400 h-1.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
