import React, { useState, useEffect } from 'react';
import {
  Scan,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Sparkles,
  Maximize2,
  Users,
  Compass,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { DetectedFace, SourceFaceData } from '../types';
import { generateCustomFaceCrop } from '../utils/faceEngine';

interface FaceScannerHUDProps {
  sourceFace: SourceFaceData;
  onOpenInspector: () => void;
  onSelectCandidateFace: (face: DetectedFace, index: number) => void;
  onChangeFace: () => void;
  onUpdateFaceCrop?: (face: DetectedFace) => void;
}

export const FaceScannerHUD: React.FC<FaceScannerHUDProps> = ({
  sourceFace,
  onOpenInspector,
  onSelectCandidateFace,
  onChangeFace,
  onUpdateFaceCrop,
}) => {
  const [showMeshOverlay, setShowMeshOverlay] = useState(false);
  const [fallbackCrop, setFallbackCrop] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [verticalOffset, setVerticalOffset] = useState<number>(0);

  const isScanning = sourceFace.isScanning;
  const face = sourceFace.detectedFace;
  const candidates = sourceFace.candidateFaces || [];

  // Fine-tune crop framing
  const handleAdjustCrop = (newZoom: number, newVOffset: number) => {
    if (!face || !sourceFace.dataUrl) return;
    setZoomLevel(newZoom);
    setVerticalOffset(newVOffset);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceFace.dataUrl;
    img.onload = () => {
      const custom = generateCustomFaceCrop(img, face, newZoom, 0, newVOffset);
      const updatedFace: DetectedFace = {
        ...face,
        exactCropUrl: custom.exactCropUrl,
        thumbnailUrl: custom.thumbnailUrl,
        box: custom.box,
      };
      onUpdateFaceCrop?.(updatedFace);
    };
  };

  // Guarantee that only the selected face is displayed (never the entire raw photo)
  useEffect(() => {
    if (!face || !sourceFace.dataUrl) {
      setFallbackCrop(null);
      return;
    }

    if (!face.exactCropUrl && !face.thumbnailUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = sourceFace.dataUrl;
      img.onload = () => {
        const custom = generateCustomFaceCrop(img, face, zoomLevel, 0, verticalOffset);
        setFallbackCrop(custom.exactCropUrl);
      };
    }
  }, [face, sourceFace.dataUrl, zoomLevel, verticalOffset]);

  const displayFaceSrc = face?.exactCropUrl || face?.thumbnailUrl || fallbackCrop || '';

  return (
    <div className="space-y-4">
      {/* 1. SCANNING IN PROGRESS STATE */}
      {isScanning && (
        <div className="relative rounded-xl overflow-hidden border border-indigo-500/40 bg-zinc-950 p-4 shadow-lg space-y-4">
          <div className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden bg-black flex items-center justify-center">
            {sourceFace.dataUrl && (
              <img
                src={sourceFace.dataUrl}
                alt="Scanning face"
                className="w-full h-full object-contain opacity-50 blur-[0.5px]"
              />
            )}

            {/* Neon Scanning Laser Line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-pulse pointer-events-none transition-all duration-300"
              style={{
                top: `${sourceFace.scanProgress ?? 40}%`,
              }}
            />

            {/* Cyan Radar Grid Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1)_0,transparent_70%)] pointer-events-none" />

            {/* HUD Corner Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

            {/* Central Targeting Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full border border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="w-16 h-16 rounded-full border border-indigo-500/50" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            </div>

            <div className="absolute top-3 left-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold text-cyan-300 tracking-wider">
                ACTIVE SCANNER • {sourceFace.scanProgress ?? 50}%
              </span>
            </div>
          </div>

          {/* Telemetry Stage Readout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-mono font-medium flex items-center space-x-2">
                <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{sourceFace.scanPhase || 'Analyzing facial geometry...'}</span>
              </span>
              <span className="text-cyan-400 font-mono font-bold">{sourceFace.scanProgress ?? 0}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${sourceFace.scanProgress ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. SCAN COMPLETED & FACE LOCKED STATE */}
      {!isScanning && sourceFace.isValid && face && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 shadow-inner">
            {/* Left: Interactive Photo with Exact Bounding Box & Landmark Mesh */}
            <div className="flex flex-col items-center space-y-2 shrink-0">
              <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-black group shadow-xl">
                <img
                  src={displayFaceSrc}
                  alt="Selected face only"
                  className="w-full h-full object-cover"
                />

                {/* Glowing Landmark Dots & Mesh Overlay */}
                {showMeshOverlay && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                    <line x1="33" y1="38" x2="67" y2="38" stroke="#38bdf8" strokeWidth="1" strokeDasharray="1.5 1.5" />
                    <line x1="50" y1="38" x2="50" y2="56" stroke="#10b981" strokeWidth="0.8" />
                    <circle cx="33" cy="38" r="3" fill="#38bdf8" />
                    <circle cx="67" cy="38" r="3" fill="#38bdf8" />
                    <circle cx="50" cy="56" r="2.5" fill="#f59e0b" />
                    <circle cx="40" cy="72" r="2" fill="#ec4899" />
                    <circle cx="60" cy="72" r="2" fill="#ec4899" />
                    <circle cx="50" cy="85" r="2.5" fill="#10b981" />
                  </svg>
                )}

                {/* Exact Face Targeting Brackets */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                <div className="absolute bottom-2 inset-x-2 bg-emerald-500/90 text-white font-mono text-[9px] font-bold py-0.5 rounded shadow text-center">
                  SELECTED FACE ONLY
                </div>
              </div>

              {/* Instant Framing Micro-Adjustments */}
              <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400 font-medium">
                <span>Framing:</span>
                <button
                  type="button"
                  onClick={() => handleAdjustCrop(1.0, 0)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    zoomLevel === 1.0 ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                  title="Reference tight face crop"
                >
                  Face
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustCrop(1.22, -0.05)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    zoomLevel > 1.1 ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                  title="Closer portrait crop"
                >
                  Close-up
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustCrop(zoomLevel, verticalOffset - 0.08)}
                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                  title="Shift crop up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustCrop(zoomLevel, verticalOffset + 0.08)}
                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                  title="Shift crop down"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Right: Telemetry & Quality Details */}
            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected Face Locked</span>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-mono">
                  Face Only Crop
                </span>

                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-mono">
                  {Math.round(face.confidence * 100)}% Confidence
                </span>

                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-mono">
                  {face.qualityLabel || 'Optimal'} Quality
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Biometric landmarks extracted and normalized. Coordinates aligned for video blend.
              </p>

              {/* Quick Biometric Stats Row */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block">ROLL</span>
                  <span className="text-xs font-bold text-zinc-200">{face.roll ?? 0}°</span>
                </div>
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block">SHARPNESS</span>
                  <span className="text-xs font-bold text-zinc-200">{face.sharpness ?? 90}%</span>
                </div>
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block">SYMMETRY</span>
                  <span className="text-xs font-bold text-zinc-200">{face.symmetry ?? 95}%</span>
                </div>
              </div>

              {/* Interactive Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowMeshOverlay(!showMeshOverlay)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{showMeshOverlay ? 'Hide Landmarks' : 'Show Landmarks'}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenInspector}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inspect Biometrics</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. MULTIPLE FACES SELECTOR (Section 21: "Multiple faces detected. Please select the face you want to use") */}
          {candidates.length > 1 && (
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Multiple Faces Detected in Photo ({candidates.length} faces)</span>
                </span>
                <span className="text-[11px] text-zinc-400">Select which face to use:</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {candidates.map((cand, idx) => {
                  const isSelected = cand.id === face.id;
                  return (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => onSelectCandidateFace(cand, idx)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center space-y-1 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 ring-1 ring-indigo-500 shadow-md'
                          : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-700 bg-black shrink-0 relative">
                        <img src={cand.thumbnailUrl} alt={cand.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-white">Face {idx + 1}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{Math.round(cand.confidence * 100)}% conf</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SCAN COMPLETED BUT NO FACE DETECTED */}
      {!isScanning && !sourceFace.isValid && sourceFace.dataUrl && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-rose-500/50 bg-black shrink-0 relative">
              <img src={sourceFace.dataUrl} alt="Failed face" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center bg-rose-950/60">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>No Face Detected</span>
              </div>
              <p className="text-xs text-zinc-300">
                {sourceFace.statusMessage ||
                  'No human face detected in photo. Please select a clear, front-facing photo.'}
              </p>
              <p className="text-[11px] text-zinc-500">
                Tips: Ensure good lighting, eyes and mouth visible, and avoid heavy sunglasses or extreme side profiles.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-center sm:justify-start">
            <button
              type="button"
              onClick={onChangeFace}
              className="py-1.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Select Another Photo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
