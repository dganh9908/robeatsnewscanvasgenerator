import React, { useRef } from 'react';
import { SlotConfig, SongItem } from '../types';
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

interface SlotEditorProps {
  slotType: 'star' | 'pro';
  slot: SlotConfig;
  onChange: (updated: Partial<SlotConfig>) => void;
  onOpenCatalog: () => void;
  songs: SongItem[];
}

export const SlotEditor: React.FC<SlotEditorProps> = ({
  slotType,
  slot,
  onChange,
  onOpenCatalog,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStar = slotType === 'star';

  // Current cover scale
  const currentScale = slot.scale !== undefined && slot.scale !== null ? slot.scale : 0.9;

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({
          coverImage: reader.result as string,
          scale: slot.scale || 0.9,
          offsetX: 0,
          offsetY: 0,
          fit: 'cover',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const artistX = slot.artistOffsetX || 0;
  const artistY = slot.artistOffsetY || 0;
  const songX = slot.songOffsetX || 0;
  const songY = slot.songOffsetY || 0;

  const currentScoreSize = slot.scoreFontSize || 34;
  const currentStrokeWidth = slot.strokeWidth !== undefined ? slot.strokeWidth : 6;

  return (
    <div className="space-y-4">
      {/* 1. Cover Art */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50"></span>
            Cover art
          </label>
          {slot.coverImage && (
            <button
              onClick={() => onChange({ coverImage: '', scale: 0.9, offsetX: 0, offsetY: 0 })}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Clear Cover
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-purple-400/40 hover:border-pink-400 bg-purple-900/10 hover:bg-purple-900/20 text-purple-200 text-xs font-medium transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-pink-400" />
            Upload Local Image
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
            className="flex items-center justify-center p-2.5 rounded-xl border border-purple-500/30 hover:border-purple-400 bg-purple-900/20 hover:bg-purple-900/40 text-purple-200 text-xs font-medium transition cursor-pointer"
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
            onChange={(e) => onChange({ coverImage: e.target.value, fit: 'cover', scale: slot.scale || 0.9 })}
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 transition"
          />
        </div>

        {/* Cover Art Scale (Zoom In / Zoom Out) */}
        {slot.coverImage && (
          <div className="pt-2.5 border-t border-purple-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300 font-medium flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-pink-400" />
                Cover Zoom
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-yellow-300 text-xs font-semibold">
                  {Math.round(currentScale * 100)}% ({currentScale.toFixed(2)}x)
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ scale: 0.9 })}
                  className="text-[10px] text-purple-400 hover:text-white px-1.5 py-0.5 rounded bg-purple-900/40 border border-purple-500/30 transition cursor-pointer"
                  title="Reset zoom to 0.9x"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ scale: Math.max(0.2, Number((currentScale - 0.05).toFixed(2))) })}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 hover:text-white transition cursor-pointer"
                title="Zoom Out (-5%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={currentScale}
                onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
                className="flex-1 accent-pink-500 cursor-pointer"
              />

              <button
                type="button"
                onClick={() => onChange({ scale: Math.min(2.5, Number((currentScale + 0.05).toFixed(2))) })}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 hover:text-white transition cursor-pointer"
                title="Zoom In (+5%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Text Edits */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-3.5 space-y-3">
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
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-3 py-2 text-sm text-yellow-300 font-righteous placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition"
          />
        </div>

        {/* Song Name Multiline Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-purple-200">
              Song Title
            </label>
          </div>
          <textarea
            rows={2}
            value={slot.songName}
            onChange={(e) => onChange({ songName: e.target.value })}
            placeholder="Type song title (wraps automatically or press Enter for a new line)"
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-3 py-2 text-sm text-yellow-300 font-righteous placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition resize-none"
          />
        </div>

        {/* Score Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-purple-200">
              Score
            </label>
          </div>
          <input
            type="text"
            value={slot.score}
            onChange={(e) => onChange({ score: e.target.value })}
            placeholder="12.345.678"
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-3 py-2 text-sm text-yellow-300 font-righteous tracking-wider placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition"
          />
        </div>
      </div>

      {/* 3. Font Styling (per Star / Pro Mission) */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            Font Styling
          </label>
          <button
            onClick={() =>
              onChange({
                textColor: '#fed835',
                scoreColor: '#fed835',
                artistFontSize: 28,
                songFontSize: 34,
                scoreFontSize: 34,
                strokeWidth: 6,
              })
            }
            className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Styles
          </button>
        </div>

        {/* Text Font Color (Artist & Song) */}
        <div className="flex items-center justify-between gap-3 bg-[#100c22] p-2.5 rounded-xl border border-purple-500/20">
          <span className="text-xs text-purple-300">Text Font Color:</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={slot.textColor || '#fed835'}
              onChange={(e) => onChange({ textColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              title="Artist & Song Text Color"
            />
            <input
              type="text"
              value={slot.textColor || '#fed835'}
              onChange={(e) => onChange({ textColor: e.target.value })}
              className="w-24 bg-[#140f29] border border-purple-500/30 rounded-lg px-2 py-1 text-xs text-white uppercase font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Score Font Color */}
        <div className="flex items-center justify-between gap-3 bg-[#100c22] p-2.5 rounded-xl border border-purple-500/20">
          <span className="text-xs text-purple-300">Score Text Font Color:</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={slot.scoreColor || '#fed835'}
              onChange={(e) => onChange({ scoreColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              title="Score Text Font Color"
            />
            <input
              type="text"
              value={slot.scoreColor || '#fed835'}
              onChange={(e) => onChange({ scoreColor: e.target.value })}
              className="w-24 bg-[#140f29] border border-purple-500/30 rounded-lg px-2 py-1 text-xs text-white uppercase font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Font Sizes Sliders */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex justify-between text-[10px] text-purple-400 mb-1">
              <span>Artist Size</span>
              <span className="font-mono text-yellow-400">{slot.artistFontSize || 28}px</span>
            </div>
            <input
              type="range"
              min="18"
              max="44"
              value={slot.artistFontSize || 28}
              onChange={(e) => onChange({ artistFontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-purple-400 mb-1">
              <span>Song Title Size</span>
              <span className="font-mono text-yellow-400">{slot.songFontSize || 34}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="52"
              value={slot.songFontSize || 34}
              onChange={(e) => onChange({ songFontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-purple-400 mb-1">
              <span>Score Size</span>
              <span className="font-mono text-yellow-400">{currentScoreSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="52"
              value={currentScoreSize}
              onChange={(e) => onChange({ scoreFontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-yellow-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-purple-400 mb-1">
              <span>Stroke Width</span>
              <span className="font-mono text-purple-300">{currentStrokeWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={currentStrokeWidth}
              onChange={(e) => onChange({ strokeWidth: parseInt(e.target.value, 10) })}
              className="w-full accent-purple-400"
            />
          </div>
        </div>
      </div>

      {/* 4. Text Position (Artist & Song Name) */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-yellow-300" />
            Text Position
          </label>
          <button
            onClick={() =>
              onChange({
                artistOffsetX: 0,
                artistOffsetY: 0,
                songOffsetX: 0,
                songOffsetY: 0,
              })
            }
            className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Artist Position Sliders */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-purple-300">
            <span>Artist Position:</span>
            <span className="font-mono text-[10px] text-yellow-400">
              X: {artistX > 0 ? `+${artistX}` : artistX}px | Y: {artistY > 0 ? `+${artistY}` : artistY}px
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-purple-400 block">Move Left / Right</label>
              <input
                type="range"
                min="-150"
                max="150"
                value={artistX}
                onChange={(e) => onChange({ artistOffsetX: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-400 block">Move Up / Down</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={artistY}
                onChange={(e) => onChange({ artistOffsetY: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400"
              />
            </div>
          </div>
        </div>

        {/* Song Name Position Sliders */}
        <div className="space-y-1.5 pt-2 border-t border-purple-500/20">
          <div className="flex justify-between text-[11px] text-purple-300">
            <span>Song Title Position:</span>
            <span className="font-mono text-[10px] text-yellow-400">
              X: {songX > 0 ? `+${songX}` : songX}px | Y: {songY > 0 ? `+${songY}` : songY}px
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-purple-400 block">Move Left / Right</label>
              <input
                type="range"
                min="-150"
                max="150"
                value={songX}
                onChange={(e) => onChange({ songOffsetX: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-400 block">Move Up / Down</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={songY}
                onChange={(e) => onChange({ songOffsetY: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
