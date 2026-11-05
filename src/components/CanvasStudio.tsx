import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BannerConfig } from '../types';
import { renderBannerToCanvas } from '../utils/canvasRenderer';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Move,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface CanvasStudioProps {
  config: BannerConfig;
  onSelectSlot: (slot: 'star' | 'pro' | 'poster') => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenNotice?: () => void;
}

export const CanvasStudio: React.FC<CanvasStudioProps> = ({
  config,
  onSelectSlot,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
  onOpenNotice,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Internal collapsible state if not controlled externally
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  // Zoom preset state
  const [zoomPreset, setZoomPreset] = useState<'fit' | 0.5 | 0.75 | 1 | 'custom'>('fit');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover Zoom state (desktop inspection)
  const [hoverZoomEnabled, setHoverZoomEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Dragging and touch pinch tracking refs
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPinchingRef = useRef(false);
  const initialPinchDistRef = useRef(0);
  const initialScaleRef = useRef(1);

  // Re-render canvas whenever config changes
  const render = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      await renderBannerToCanvas(canvasRef.current, config, 1);
    } catch (err) {
      console.error('Error rendering banner:', err);
    }
  }, [config]);

  useEffect(() => {
    render();
  }, [render]);

  // Handle Preset Choices (Fit, 50%, 75%, 100%)
  const applyPreset = (preset: 'fit' | 0.5 | 0.75 | 1) => {
    setZoomPreset(preset);
    setPan({ x: 0, y: 0 });
    if (preset === 'fit') {
      setZoomScale(1);
    } else {
      setZoomScale(preset);
    }
  };

  // Step zoom in/out
  const stepZoom = (delta: number) => {
    setZoomScale((prev) => {
      const next = Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.4), 2.5);
      if (next === 1) setZoomPreset(1);
      else if (next === 0.75) setZoomPreset(0.75);
      else if (next === 0.5) setZoomPreset(0.5);
      else setZoomPreset('custom');
      return next;
    });
  };

  // Reset zoom & pan to default Fit
  const handleReset = () => {
    applyPreset('fit');
  };

  // Mouse move handler for hover zoom and pan drag
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
      return;
    }

    if (!hoverZoomEnabled) return;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setHoverPos({ x, y });
    setIsHovered(true);
  };

  const handleMouseEnter = () => {
    if (hoverZoomEnabled && !isDraggingRef.current) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    isDraggingRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Enable panning if mouse wheel or middle click, or if zoomed in
    if (e.button === 0 || e.button === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Mouse wheel zoom inside preview
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    stepZoom(delta);
  };

  // Touch gesture handlers for mobile pinch-to-zoom and pan
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      isPinchingRef.current = true;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialScaleRef.current = zoomScale;
    } else if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && isPinchingRef.current) {
      if (e.cancelable) e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (initialPinchDistRef.current > 0) {
        const factor = currentDist / initialPinchDistRef.current;
        const next = Math.min(Math.max(Number((initialScaleRef.current * factor).toFixed(2)), 0.4), 2.5);
        setZoomScale(next);
        if (next === 1) setZoomPreset(1);
        else if (next === 0.75) setZoomPreset(0.75);
        else if (next === 0.5) setZoomPreset(0.5);
        else setZoomPreset('custom');
      }
    } else if (e.touches.length === 1 && isDraggingRef.current && (zoomScale > 1 || zoomPreset !== 'fit' || pan.x !== 0 || pan.y !== 0)) {
      if (e.cancelable) e.preventDefault();
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      isPinchingRef.current = false;
    }
    if (e.touches.length === 0) {
      isDraggingRef.current = false;
    }
  };

  // Determine current active scale and transform-origin
  const isHoverZoomActive = hoverZoomEnabled && isHovered && !isDraggingRef.current;
  const effectiveScale = isHoverZoomActive
    ? Math.min(zoomScale * 1.75, 3.0)
    : zoomScale;

  const transformOrigin = isHoverZoomActive
    ? `${hoverPos.x}% ${hoverPos.y}%`
    : 'center center';

  // If collapsed, display a sleek minimized preview bar
  if (isCollapsed) {
    return (
      <div className="bg-[#110d24] rounded-2xl border border-purple-500/20 shadow-xl p-3 flex items-center justify-between transition-all duration-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNotice}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-xs text-amber-300 transition cursor-pointer"
            title="Click to view Maintenance & Update notice"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide">Service: Maintenance - Still working</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-righteous text-purple-200">Canvas Preview</span>
            <span className="text-[11px] text-purple-400 hidden sm:inline">(Collapsed)</span>
          </div>
        </div>

        <button
          onClick={handleToggleCollapse}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-righteous transition cursor-pointer shadow-md shadow-purple-600/30"
          title="Expand canvas preview"
        >
          <ChevronDown className="w-4 h-4" />
          <span>Expand Preview</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-[#110d24] rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl">
      {/* Top Studio Control Bar */}
      <div className="p-2.5 sm:p-3 bg-[#171230] border-b border-purple-500/20 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center flex-wrap gap-2">
          {/* Service: Maintenance - Still working Badge */}
          <button
            type="button"
            onClick={onOpenNotice}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-xs text-amber-300 transition cursor-pointer"
            title="Click to view Maintenance & Update notice"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide">Service: Maintenance - Still working</span>
          </button>

          {/* Preset Buttons (Fit, 50%, 75%, 100%) */}
          <div className="flex items-center gap-1 bg-[#100c22] p-1 rounded-lg border border-purple-500/30 text-xs">
            <button
              onClick={() => applyPreset('fit')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                zoomPreset === 'fit' ? 'bg-purple-600 text-white font-medium shadow-xs' : 'text-purple-300 hover:text-white'
              }`}
              title="Fit canvas within fixed frame"
            >
              Fit
            </button>
            <button
              onClick={() => applyPreset(0.5)}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                zoomPreset === 0.5 ? 'bg-purple-600 text-white font-medium shadow-xs' : 'text-purple-300 hover:text-white'
              }`}
              title="50% scale within fixed frame"
            >
              50%
            </button>
            <button
              onClick={() => applyPreset(0.75)}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                zoomPreset === 0.75 ? 'bg-purple-600 text-white font-medium shadow-xs' : 'text-purple-300 hover:text-white'
              }`}
              title="75% scale within fixed frame"
            >
              75%
            </button>
            <button
              onClick={() => applyPreset(1)}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                zoomPreset === 1 ? 'bg-purple-600 text-white font-medium shadow-xs' : 'text-purple-300 hover:text-white'
              }`}
              title="100% scale within fixed frame"
            >
              100%
            </button>
          </div>
        </div>

        {/* Right side controls: Hover Zoom Toggle & Collapse Button */}
        <div className="flex items-center gap-2">
          {/* Hover Zoom Toggle for Desktop */}
          <button
            onClick={() => setHoverZoomEnabled((prev) => !prev)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-righteous transition cursor-pointer ${
              hoverZoomEnabled
                ? 'bg-purple-900/40 border-purple-400/50 text-purple-200'
                : 'bg-black/30 border-purple-500/20 text-purple-400 hover:text-purple-200'
            }`}
            title={hoverZoomEnabled ? 'Hover Zoom is Enabled' : 'Hover Zoom is Disabled'}
          >
            <Search className="w-3.5 h-3.5 text-yellow-300" />
            <span>Hover Zoom: {hoverZoomEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Reset View Button */}
          {(zoomPreset !== 'fit' || pan.x !== 0 || pan.y !== 0) && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 hover:text-white transition cursor-pointer"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Collapse Preview Button */}
          <button
            onClick={handleToggleCollapse}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-righteous text-purple-300 hover:text-white transition cursor-pointer"
            title="Collapse preview frame"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Collapse</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport Area - Resizable matching aspect ratio of preview image (16:9), avoiding height stretch */}
      <div className="w-full aspect-[16/9] bg-transparency-grid relative overflow-hidden flex items-center justify-center p-2 sm:p-3">
        {/* Fixed Preview Frame: strictly preserves 16:9 aspect ratio and never stretches */}
        <div
          ref={frameRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-full aspect-[16/9] max-h-full max-w-full rounded-xl overflow-hidden border border-purple-500/30 bg-[#0c0819] shadow-2xl flex items-center justify-center select-none touch-none cursor-crosshair group"
        >
          {/* Inner Scalable Container (Transforms within the fixed frame) */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${effectiveScale})`,
              transformOrigin: transformOrigin,
              transition: isDraggingRef.current || isPinchingRef.current ? 'none' : 'transform 0.12s ease-out',
            }}
          >
            {/* Main Native 1920x1080 Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain block pointer-events-none"
              style={{ aspectRatio: '16/9' }}
            />

            {/* Interactive Clickable Hotspot Overlays */}
            <div className="absolute inset-0 pointer-events-auto">
              {/* Star slot hotspot */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlot('star');
                }}
                className="absolute left-[24%] top-[30%] w-[18%] h-[52%] rounded-2xl border-2 border-transparent hover:border-indigo-400 hover:bg-indigo-500/10 transition cursor-pointer group/star"
                title="Click to edit Star Mission"
              >
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-righteous px-2 py-0.5 rounded shadow opacity-0 group-hover/star:opacity-100 transition whitespace-nowrap pointer-events-none">
                  Edit Star Mission
                </span>
              </button>

              {/* Pro slot hotspot */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlot('pro');
                }}
                className="absolute left-[66%] top-[30%] w-[18%] h-[52%] rounded-2xl border-2 border-transparent hover:border-pink-400 hover:bg-pink-500/10 transition cursor-pointer group/pro"
                title="Click to edit Pro Mission"
              >
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-[10px] font-righteous px-2 py-0.5 rounded shadow opacity-0 group-hover/pro:opacity-100 transition whitespace-nowrap pointer-events-none">
                  Edit Pro Mission
                </span>
              </button>

              {/* Poster hotspot */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlot('poster');
                }}
                className="absolute right-[2%] bottom-[2%] w-[22%] h-[6%] rounded-full border-2 border-transparent hover:border-pink-400 hover:bg-pink-500/10 transition cursor-pointer group/poster"
                title="Click to edit Poster credit"
              >
                <span className="absolute -top-7 right-2 bg-pink-600 text-white text-[10px] font-righteous px-2 py-0.5 rounded shadow opacity-0 group-hover/poster:opacity-100 transition whitespace-nowrap pointer-events-none">
                  Edit Poster
                </span>
              </button>
            </div>
          </div>

          {/* Hover / Touch Hint Floating Pill */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30 text-[10px] font-righteous text-purple-300 pointer-events-none transition-opacity duration-200 opacity-70 group-hover:opacity-100">
            <span className="hidden sm:inline">Hover to inspect details • Wheel to zoom • Drag to pan</span>
            <span className="sm:hidden">Pinch to zoom • Drag to pan</span>
          </div>

          {/* Current Zoom Indicator Badge */}
          {zoomPreset !== 'fit' && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 border border-purple-500/40 text-[10px] font-righteous text-yellow-300 pointer-events-none">
              {Math.round(effectiveScale * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Zoom Control Bar (Particularly convenient for mobile and precise touch zooming) */}
      <div className="p-2 sm:p-2.5 bg-[#171230] border-t border-purple-500/20 flex items-center justify-between gap-3 text-xs">
        {/* Zoom Out & In Buttons + Slider */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <button
            onClick={() => stepZoom(-0.1)}
            className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 hover:text-white transition cursor-pointer shrink-0"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="0.4"
            max="2.5"
            step="0.05"
            value={zoomScale}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setZoomScale(val);
              if (val === 1) setZoomPreset(1);
              else if (val === 0.75) setZoomPreset(0.75);
              else if (val === 0.5) setZoomPreset(0.5);
              else setZoomPreset('custom');
            }}
            className="w-full accent-pink-500 cursor-pointer h-1.5 bg-purple-950 rounded-lg"
            title="Zoom scale slider"
          />

          <button
            onClick={() => stepZoom(0.1)}
            className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 hover:text-white transition cursor-pointer shrink-0"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-righteous text-purple-300 min-w-[42px] text-right shrink-0">
            {zoomPreset === 'fit' ? 'Fit' : `${Math.round(zoomScale * 100)}%`}
          </span>
        </div>

        {/* Mobile quick preset shortcuts */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => applyPreset('fit')}
            className={`px-2 py-1 rounded text-[11px] font-righteous transition cursor-pointer ${
              zoomPreset === 'fit'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-950/40 text-purple-300 hover:text-white border border-purple-500/20'
            }`}
          >
            Fit
          </button>
          <button
            onClick={() => applyPreset(1)}
            className={`px-2 py-1 rounded text-[11px] font-righteous transition cursor-pointer ${
              zoomPreset === 1
                ? 'bg-purple-600 text-white'
                : 'bg-purple-950/40 text-purple-300 hover:text-white border border-purple-500/20'
            }`}
          >
            100%
          </button>
        </div>
      </div>
    </div>
  );
};

