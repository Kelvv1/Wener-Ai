import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, ShieldAlert, Maximize2 } from 'lucide-react';

export interface LandmarkPoint {
  x: number;
  y: number;
  label: string;
}

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  landmarks?: LandmarkPoint[];
  showLandmarksToggle?: boolean;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  landmarks = [],
  showLandmarksToggle = true,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percentage = (clampedX / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className="flex flex-col gap-3">
      {/* Visualizer Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
            Interactive Split Comparison
          </span>
          {showLandmarksToggle && (
            <button
              onClick={() => setShowLandmarks(!showLandmarks)}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 border ${
                showLandmarks
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>5-pt Facial Landmarks</span>
            </button>
          )}
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          Drag slider horizontally to inspect face blend
        </div>
      </div>

      {/* Comparison Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square max-h-[500px] rounded-2xl overflow-hidden select-none bg-slate-950 border border-slate-800 shadow-2xl cursor-ew-resize group"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
      >
        {/* Layer 1: Swapped Result (Underneath, Full Width) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={afterUrl}
            alt="Face Swapped Result"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg">
            Swapped Output
          </div>
        </div>

        {/* Layer 2: Original Target (Clipped on the Left) */}
        <div
          className="absolute inset-0 h-full overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="relative w-full h-full" style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}>
            <img
              src={beforeUrl}
              alt="Original Target"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-slate-200 border border-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg">
              Original Target
            </div>
          </div>
        </div>

        {/* Landmarks visualizer overlay (Educational) */}
        {showLandmarks && landmarks.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {landmarks.map((pt, i) => (
              <div
                key={i}
                className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              >
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white shadow-md"></span>
                </span>
                <span className="absolute left-5 top-0 bg-black/80 text-amber-300 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 whitespace-nowrap font-mono shadow">
                  {pt.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Split Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl border-2 border-slate-900 cursor-ew-resize">
            <div className="flex gap-0.5">
              <span className="w-0.5 h-3 bg-slate-600 rounded"></span>
              <span className="w-0.5 h-3 bg-slate-600 rounded"></span>
            </div>
          </div>
        </div>

        {/* MANDATORY UNREMOVABLE WATERMARK BANNER (Responsible AI requirement) */}
        <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono font-extrabold text-[11px] tracking-wider shadow-2xl">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-GENERATED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
