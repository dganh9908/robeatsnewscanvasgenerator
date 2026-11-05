import React from 'react';
import { BannerConfig } from '../types';
import {
  Tag,
  Check,
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
  const posterX = config.posterOffsetX || 0;
  const posterY = config.posterOffsetY || 0;
  const posterFontSize = config.posterFontSize || 24;

  return (
    <div className="space-y-4">
      {/* Category Section */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-3.5 space-y-2">
        <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-yellow-300" />
          Mission Category
        </label>
        <div className="p-2.5 rounded-xl border border-pink-500 bg-pink-600/30 text-white flex items-center justify-between">
          <span className="text-xs font-righteous">Weekly Missions</span>
          <Check className="w-3.5 h-3.5 text-yellow-300" />
        </div>
        <p className="text-[11px] text-pink-300/80 font-righteous pt-0.5">
          More canvas coming soon :)
        </p>
      </div>

      {/* Poster: Section */}
      <div className="bg-[#17122e] border border-purple-500/20 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-pink-500 inline-block shadow-sm shadow-pink-500/50"></span>
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

        {/* Poster input without POSTER: fill box */}
        <div>
          <input
            type="text"
            value={config.poster}
            onChange={(e) => onChange({ poster: e.target.value })}
            placeholder="Type poster name (e.g. meelo, player1)..."
            className="w-full bg-[#100c22] border border-purple-500/30 rounded-xl px-3 py-2 text-sm text-yellow-300 font-righteous placeholder-purple-400/40 focus:outline-none focus:border-yellow-400 transition"
          />
        </div>

        {/* Poster Size Slider */}
        <div className="pt-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] text-purple-300 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-yellow-300" />
              Poster Text Size
            </label>
            <span className="font-mono text-[10px] text-yellow-400">{posterFontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="44"
            value={posterFontSize}
            onChange={(e) => onChange({ posterFontSize: parseInt(e.target.value, 10) })}
            className="w-full accent-yellow-400"
          />
        </div>

        {/* Poster Colors */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-purple-300">
            <span>Fill:</span>
            <input
              type="color"
              value={config.posterTextColor || '#fed835'}
              onChange={(e) => onChange({ posterTextColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              title="Poster Text Color"
            />
            <span className="font-mono text-[10px] text-yellow-300">
              {config.posterTextColor || '#fed835'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-purple-300">
            <span>Outline:</span>
            <input
              type="color"
              value={config.posterStrokeColor || '#000000'}
              onChange={(e) => onChange({ posterStrokeColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              title="Poster Stroke Color"
            />
            <span className="font-mono text-[10px] text-slate-300">
              {config.posterStrokeColor || '#000000'}
            </span>
          </div>
        </div>

        {/* Manual Poster Movement */}
        <div className="pt-2 border-t border-purple-500/20 space-y-1.5">
          <div className="flex justify-between text-[11px] text-purple-300">
            <span className="flex items-center gap-1">
              <Move className="w-3 h-3 text-pink-400" />
              Manual Poster Position:
            </span>
            <span className="font-mono text-[10px] text-yellow-400">
              X: {posterX > 0 ? `+${posterX}` : posterX}px | Y: {posterY > 0 ? `+${posterY}` : posterY}px
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-purple-400 block">Move Left / Right</label>
              <input
                type="range"
                min="-150"
                max="150"
                value={posterX}
                onChange={(e) => onChange({ posterOffsetX: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-400 block">Move Up / Down</label>
              <input
                type="range"
                min="-60"
                max="60"
                value={posterY}
                onChange={(e) => onChange({ posterOffsetY: parseInt(e.target.value, 10) })}
                className="w-full accent-yellow-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
