import React from 'react';
import { BannerConfig } from '../types';
import {
  RotateCcw,
  Move,
  Sliders,
} from 'lucide-react';

interface PosterAndStyleEditorProps {
  config: BannerConfig;
  onChange: (updated: Partial<BannerConfig>) => void;
}

export const PosterAndStyleEditor: React.FC<PosterAndStyleEditorProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      {/* Poster Name Section */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block shadow-sm shadow-pink-500/50"></span>
            Poster:
          </label>
          <button
            onClick={() =>
              onChange({
                poster: 'meelo',
                posterFontSize: 24,
                posterTextColor: '#fed835',
                posterStrokeColor: '#000000',
                posterOffsetX: 0,
                posterOffsetY: 0,
              })
            }
            className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Poster
          </button>
        </div>

        <div>
          <input
            type="text"
            value={config.poster}
            onChange={(e) => onChange({ poster: e.target.value })}
            placeholder="Type poster name (e.g. meelo, player1)..."
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-3 py-2 text-sm text-yellow-300 font-righteous placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition"
          />
        </div>
      </div>
    </div>
  );
};

export const PosterStyleAndPositionDock: React.FC<PosterAndStyleEditorProps> = ({
  config,
  onChange,
}) => {
  const posterX = config.posterOffsetX || 0;
  const posterY = config.posterOffsetY || 0;
  const posterFontSize = config.posterFontSize || 24;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-fade-in">
      {/* Left Dock Card: Poster Font Styling */}
      <div className="bg-[#140f29] border border-purple-500/20 rounded-2xl p-3 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-xs font-semibold text-purple-100">Font Styling</span>
            <span className="text-[11px] text-purple-400">· Poster</span>
          </div>
          <button
            onClick={() =>
              onChange({
                posterFontSize: 24,
                posterTextColor: '#fed835',
                posterStrokeColor: '#000000',
              })
            }
            className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Styles
          </button>
        </div>

        {/* Poster Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between gap-1.5 bg-[#100c22] px-2.5 py-1.5 rounded-xl border border-purple-500/20">
            <span className="text-[11px] text-purple-300">Fill</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={config.posterTextColor || '#fed835'}
                onChange={(e) => onChange({ posterTextColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                title="Poster Text Color"
              />
              <span className="font-mono text-[10px] text-yellow-300 uppercase">
                {config.posterTextColor || '#fed835'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 bg-[#100c22] px-2.5 py-1.5 rounded-xl border border-purple-500/20">
            <span className="text-[11px] text-purple-300">Outline</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={config.posterStrokeColor || '#000000'}
                onChange={(e) => onChange({ posterStrokeColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                title="Poster Stroke Color"
              />
              <span className="font-mono text-[10px] text-slate-300 uppercase">
                {config.posterStrokeColor || '#000000'}
              </span>
            </div>
          </div>
        </div>

        {/* Poster Text Size */}
        <div className="bg-[#100c22] px-2.5 py-2 rounded-xl border border-purple-500/20">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] text-purple-200">Poster Text Size</label>
            <span className="font-mono text-[10px] text-yellow-400 tabular-nums">{posterFontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="44"
            value={posterFontSize}
            onChange={(e) => onChange({ posterFontSize: parseInt(e.target.value, 10) })}
            className="w-full accent-yellow-400 h-1.5"
          />
        </div>
      </div>

      {/* Right Dock Card: Poster Position */}
      <div className="bg-[#140f29] border border-purple-500/20 rounded-2xl p-3 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-semibold text-purple-100">Text Position</span>
            <span className="text-[11px] text-purple-400">· Poster</span>
          </div>
          <button
            onClick={() => onChange({ posterOffsetX: 0, posterOffsetY: 0 })}
            className="text-[11px] text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="bg-[#100c22] px-2.5 py-2.5 rounded-xl border border-purple-500/20 space-y-2">
          <div className="flex justify-between text-[11px] text-purple-200">
            <span>Manual Poster Position</span>
            <span className="font-mono text-[10px] text-yellow-400 tabular-nums">
              X: {posterX > 0 ? `+${posterX}` : posterX}px · Y: {posterY > 0 ? `+${posterY}` : posterY}px
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-purple-400 block mb-0.5">Left / Right</label>
              <input
                type="range"
                min="-150"
                max="150"
                value={posterX}
                onChange={(e) => onChange({ posterOffsetX: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400 h-1.5"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-400 block mb-0.5">Up / Down</label>
              <input
                type="range"
                min="-60"
                max="60"
                value={posterY}
                onChange={(e) => onChange({ posterOffsetY: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400 h-1.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
