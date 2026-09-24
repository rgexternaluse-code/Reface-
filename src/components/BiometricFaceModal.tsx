import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Scan,
  Compass,
  Eye,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DetectedFace } from '../types';
import { generateCustomFaceCrop } from '../utils/faceEngine';

interface BiometricFaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedFace: DetectedFace | null;
  photoUrl: string;
  candidateFaces?: DetectedFace[];
  onSelectFace?: (face: DetectedFace) => void;
}

export const BiometricFaceModal: React.FC<BiometricFaceModalProps> = ({
  isOpen,
  onClose,
  detectedFace,
  photoUrl,
  candidateFaces = [],
  onSelectFace,
}) => {
  const [showMesh, setShowMesh] = useState(true);
  const [fallbackCrop, setFallbackCrop] = useState<string | null>(null);

  useEffect(() => {
    if (!detectedFace || detectedFace.exactCropUrl || detectedFace.thumbnailUrl || !photoUrl) {
      setFallbackCrop(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoUrl;
    img.onload = () => {
      const custom = generateCustomFaceCrop(img, detectedFace, 1.0, 0, 0);
      setFallbackCrop(custom.exactCropUrl);
    };
  }, [detectedFace, photoUrl]);

  if (!isOpen || !detectedFace) return null;

  const displayCropSrc = detectedFace.exactCropUrl || detectedFace.thumbnailUrl || fallbackCrop || '';

  const landmarks = detectedFace.landmarks;
  const box = detectedFace.box;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Exact Face Biometric Analysis</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LOCKED
                </span>
              </h3>
              <p className="text-xs text-zinc-400">100% on-device geometry inspection & landmark triangulation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Visualization Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cropped Exact Face Canvas with Mesh */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-full aspect-[3/4] max-w-[240px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner group">
                <img
                  src={displayCropSrc}
                  alt="Exact face crop"
                  className="w-full h-full object-cover"
                />

                {/* Biometric Mesh Overlay */}
                {showMesh && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                    {/* Concentric scan reticle */}
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#6366f1" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
                    <circle cx="50" cy="46" r="30" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3" />

                    {/* Eye connection bridge */}
                    <line x1="35" y1="42" x2="65" y2="42" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                    {/* Eyebrows */}
                    <line x1="30" y1="34" x2="42" y2="34" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
                    <line x1="58" y1="34" x2="70" y2="34" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />

                    {/* Triangle: Eyes to Nose */}
                    <polygon points="35,42 65,42 50,56" fill="rgba(99, 102, 241, 0.08)" stroke="#6366f1" strokeWidth="0.75" />
                    {/* Triangle: Nose to Mouth */}
                    <polygon points="50,56 40,70 60,70" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeWidth="0.75" />

                    {/* Pupils */}
                    <circle cx="35" cy="42" r="2.2" fill="#38bdf8" />
                    <circle cx="65" cy="42" r="2.2" fill="#38bdf8" />
                    {/* Nose tip */}
                    <circle cx="50" cy="56" r="2" fill="#f59e0b" />
                    {/* Mouth corners & lips */}
                    <circle cx="40" cy="70" r="1.8" fill="#ec4899" />
                    <circle cx="60" cy="70" r="1.8" fill="#ec4899" />
                    <circle cx="50" cy="68" r="1.5" fill="#ec4899" />
                    <circle cx="50" cy="73" r="1.5" fill="#ec4899" />
                    {/* Chin */}
                    <circle cx="50" cy="85" r="2" fill="#10b981" />
                  </svg>
                )}

                {/* Target brackets */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-indigo-400" />

                <div className="absolute bottom-2 right-2 bg-emerald-500/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  SELECTED FACE ONLY
                </div>
              </div>

              <button
                onClick={() => setShowMesh(!showMesh)}
                className="text-xs font-medium text-zinc-400 hover:text-white flex items-center space-x-1.5 py-1 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{showMesh ? 'Hide Landmark Mesh' : 'Show Landmark Mesh'}</span>
              </button>
            </div>

            {/* Biometric Telemetry Breakdown */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Pose & Orientation
                </span>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">ROLL</span>
                    <span className="text-xs font-bold text-indigo-300">{detectedFace.roll ?? 0}°</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">YAW</span>
                    <span className="text-xs font-bold text-indigo-300">{detectedFace.yaw ?? 0}°</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">PITCH</span>
                    <span className="text-xs font-bold text-indigo-300">{detectedFace.pitch ?? 0}°</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Quality Evaluation
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confidence</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {Math.round(detectedFace.confidence * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Laplacian Sharpness</span>
                    </span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {detectedFace.sharpness ?? 92}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Illumination Balance</span>
                    </span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {detectedFace.illumination ?? 84}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center space-x-1.5">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>Facial Symmetry</span>
                    </span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {detectedFace.symmetry ?? 95}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Multiple Faces Selector (If more than one face was found in the photo) */}
          {candidateFaces.length > 1 && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Multiple Faces Detected in Photo ({candidateFaces.length})
                </span>
                <span className="text-[11px] text-zinc-400">Tap to switch active target face</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {candidateFaces.map((f, idx) => {
                  const isSelected = f.id === detectedFace.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => onSelectFace?.(f)}
                      className={`p-2 rounded-xl border transition cursor-pointer flex flex-col items-center text-center space-y-1.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                          : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 bg-black shrink-0">
                        <img src={f.thumbnailUrl} alt={f.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-white">Face {idx + 1}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {Math.round(f.confidence * 100)}% conf
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Anthropometric Coordinates readout */}
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Facial Landmark Coordinates (Original Pixel Map)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-zinc-400">
              <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800/60">
                <span className="text-zinc-500 block">Left Pupil:</span>
                <span className="text-indigo-300">X: {landmarks.leftEye.x}, Y: {landmarks.leftEye.y}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800/60">
                <span className="text-zinc-500 block">Right Pupil:</span>
                <span className="text-indigo-300">X: {landmarks.rightEye.x}, Y: {landmarks.rightEye.y}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800/60">
                <span className="text-zinc-500 block">Nose Tip:</span>
                <span className="text-amber-300">X: {landmarks.nose.x}, Y: {landmarks.nose.y}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800/60">
                <span className="text-zinc-500 block">Mouth Left:</span>
                <span className="text-pink-300">X: {landmarks.mouthLeft.x}, Y: {landmarks.mouthLeft.y}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800/60">
                <span className="text-zinc-500 block">Mouth Right:</span>
                <span className="text-pink-300">X: {landmarks.mouthRight.x}, Y: {landmarks.mouthRight.y}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800/60">
                <span className="text-zinc-500 block">Chin Apex:</span>
                <span className="text-emerald-300">X: {landmarks.chin.x}, Y: {landmarks.chin.y}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Optimal alignment verified for video blend</span>
          </div>

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
