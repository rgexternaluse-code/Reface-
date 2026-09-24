import React, { useEffect, useRef } from 'react';
import { Loader2, X, ShieldAlert, Cpu } from 'lucide-react';
import { ProcessingProgress } from '../types';

interface ProcessingScreenProps {
  progress: ProcessingProgress;
  onCancel: () => void;
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  progress,
  onCancel,
  previewCanvasRef,
}) => {
  const stepsList = [
    { key: 'preparing', label: 'Preparing video' },
    { key: 'detecting', label: 'Detecting face' },
    { key: 'tracking', label: 'Tracking face' },
    { key: 'blending', label: 'Blending face' },
    { key: 'encoding', label: 'Encoding video' },
    { key: 'restoring_audio', label: 'Restoring audio' },
    { key: 'saving', label: 'Saving result' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-7 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-white font-mono">REFACE</h2>
        <p className="text-sm font-semibold text-indigo-400">Processing video...</p>
      </div>

      {/* Live Frame Preview Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl flex items-center justify-center">
        <canvas
          ref={previewCanvasRef}
          className="w-full h-full object-contain"
        />

        {/* Overlay badge with current frame and percent */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300 flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE ON-DEVICE PIPELINE</span>
        </div>

        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
          {progress.fps > 0 ? `${progress.fps} FPS` : 'Processing'}
        </div>
      </div>

      {/* Numerical Progress & Frame Counts (Section 18) */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {progress.percent}%
          </div>
          <div className="text-xs font-mono text-zinc-400">
            Frame <span className="text-white font-semibold">{progress.currentFrame}</span> / {progress.totalFrames || '...'}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 rounded-full transition-all duration-200 shadow-sm"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        {/* Current status message */}
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span className="text-zinc-300">{progress.statusMessage || 'Processing on-device...'}</span>
          </div>
          {progress.estimatedRemainingMs > 0 && (
            <span>~{Math.ceil(progress.estimatedRemainingMs / 1000)}s left</span>
          )}
        </div>
      </div>

      {/* Stage indicators */}
      <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
        <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
          Pipeline Status
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          {stepsList.map((step) => {
            const isCurrent = progress.step === step.key;
            return (
              <div
                key={step.key}
                className={`py-1.5 px-2 rounded-lg border text-center transition ${
                  isCurrent
                    ? 'bg-indigo-600/20 border-indigo-500/80 text-indigo-300 font-semibold'
                    : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-500'
                }`}
              >
                {step.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Guidance Note (Section 18) */}
      <p className="text-center text-xs text-zinc-500">
        Please keep the app open. Rendering 100% locally in your device memory.
      </p>

      {/* Cancel Button (Section 19) */}
      <div className="pt-1">
        <button
          id="btn-cancel-processing"
          onClick={onCancel}
          className="w-full py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold tracking-wider uppercase transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <X className="w-4 h-4 text-zinc-400" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};
