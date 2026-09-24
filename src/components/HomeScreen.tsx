import React, { useRef, useState } from 'react';
import {
  User,
  Video,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  Clock,
  Maximize2,
  Film,
  Upload,
  Sliders,
  ChevronDown,
  ChevronUp,
  Palette,
  Camera,
  Smartphone,
} from 'lucide-react';
import { DetectedFace, RefaceOptions, SourceFaceData, VideoMetadata } from '../types';
import { SAMPLE_FACES, SampleFace } from '../utils/sampleMedia';
import { FaceScannerHUD } from './FaceScannerHUD';
import { BiometricFaceModal } from './BiometricFaceModal';
import { RefaceCameraModal } from './RefaceCameraModal';

interface HomeScreenProps {
  sourceFace: SourceFaceData;
  videoMeta: VideoMetadata | null;
  onSelectFaceFile: (file: File) => void;
  onSelectSampleFace: (sample: SampleFace) => void;
  onSelectVideoFile: (file: File) => void;
  onSelectSampleVideo: () => void;
  onStartReface: () => void;
  isGeneratingSampleVideo: boolean;
  onSelectCandidateFace?: (face: DetectedFace, index: number) => void;
  onUpdateFaceCrop?: (face: DetectedFace) => void;
  refaceOptions?: RefaceOptions;
  onUpdateRefaceOptions?: (options: Partial<RefaceOptions>) => void;
  onOpenBuildApk?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  sourceFace,
  videoMeta,
  onSelectFaceFile,
  onSelectSampleFace,
  onSelectVideoFile,
  onSelectSampleVideo,
  onStartReface,
  isGeneratingSampleVideo,
  onSelectCandidateFace,
  onUpdateFaceCrop,
  refaceOptions,
  onUpdateRefaceOptions,
  onOpenBuildApk,
}) => {
  const faceInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isFaceDragOver, setIsFaceDragOver] = useState(false);
  const [isVideoDragOver, setIsVideoDragOver] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [showBlendingControls, setShowBlendingControls] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const canStart = sourceFace.isValid && videoMeta !== null && !isGeneratingSampleVideo && !sourceFace.isScanning;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFaceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsFaceDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onSelectFaceFile(file);
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.name.endsWith('.mov'))) {
      onSelectVideoFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Biometric Inspector Modal */}
      <BiometricFaceModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        detectedFace={sourceFace.detectedFace}
        photoUrl={sourceFace.dataUrl}
        candidateFaces={sourceFace.candidateFaces}
        onSelectFace={(f) => {
          const idx = sourceFace.candidateFaces?.findIndex((cand) => cand.id === f.id) ?? 0;
          onSelectCandidateFace?.(f, idx);
        }}
      />

      {/* Reface Live Selfie Camera Modal */}
      <RefaceCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => onSelectFaceFile(file)}
      />

      {/* Hero / Header (Section 6) */}
      <div className="text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">100% ON DEVICE • ZERO CLOUD UPLOADS</span>
          </div>

          {onOpenBuildApk && (
            <button
              onClick={onOpenBuildApk}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800 hover:to-purple-800 border border-indigo-500/40 text-xs text-indigo-200 transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">Build / Install APK</span>
            </button>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
          REFACE
        </h1>
        <p className="text-sm uppercase tracking-widest text-zinc-400 font-semibold">
          AI Video Face Swap
        </p>
      </div>

      {/* Main Selection Cards Grid */}
      <div className="space-y-5">
        {/* 1. SOURCE FACE CARD (Section 7) */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl relative overflow-hidden">
          <input
            type="file"
            ref={faceInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onSelectFaceFile(f);
            }}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Source Face</h2>
                <p className="text-[11px] text-zinc-400">Exact face scanned & mapped on-device</p>
              </div>
            </div>

            {sourceFace.dataUrl && !sourceFace.isScanning && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="text-xs font-medium text-zinc-300 hover:text-white flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 transition cursor-pointer"
                  title="Take new selfie with camera"
                >
                  <Camera className="w-3 h-3 text-indigo-400" />
                  <span>Selfie</span>
                </button>
                <button
                  id="btn-change-face"
                  onClick={() => faceInputRef.current?.click()}
                  className="text-xs font-medium text-zinc-400 hover:text-white flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>
            )}
          </div>

          {!sourceFace.dataUrl ? (
            <div className="space-y-4">
              <div
                onClick={() => faceInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsFaceDragOver(true);
                }}
                onDragLeave={() => setIsFaceDragOver(false)}
                onDrop={handleFaceDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition bg-zinc-950/40 hover:bg-zinc-950/80 group ${
                  isFaceDragOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-zinc-800 hover:border-indigo-500/60'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 group-hover:text-indigo-400 group-hover:scale-105 transition mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    id="btn-select-face"
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/20 cursor-pointer pointer-events-none"
                  >
                    Select Photo
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCameraOpen(true);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium text-sm transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span>Take Selfie</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-400 mt-2.5">
                  Upload portrait or snap a selfie with camera
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  100% on-device facial scanning & biometric alignment
                </p>
              </div>

              {/* Sample Faces Quick Pick */}
              <div>
                <span className="text-xs font-medium text-zinc-400 mb-2 block">Or try sample portrait:</span>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {SAMPLE_FACES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => onSelectSampleFace(sample)}
                      className="flex items-center space-x-2 py-1.5 px-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-indigo-500/50 hover:bg-zinc-900 text-xs text-zinc-300 transition shrink-0 cursor-pointer"
                    >
                      <img
                        src={sample.dataUrl}
                        alt={sample.name}
                        className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                      />
                      <span>{sample.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <FaceScannerHUD
              sourceFace={sourceFace}
              onOpenInspector={() => setIsInspectorOpen(true)}
              onSelectCandidateFace={(cand, idx) => onSelectCandidateFace?.(cand, idx)}
              onChangeFace={() => faceInputRef.current?.click()}
              onUpdateFaceCrop={onUpdateFaceCrop}
            />
          )}
        </div>

        {/* 2. TARGET VIDEO CARD (Section 8) */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl relative overflow-hidden">
          <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onSelectVideoFile(f);
            }}
            accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
            className="hidden"
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Video className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Target Video</h2>
            </div>

            {videoMeta && (
              <button
                id="btn-change-video"
                onClick={() => videoInputRef.current?.click()}
                className="text-xs font-medium text-zinc-400 hover:text-white flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Change Video</span>
              </button>
            )}
          </div>

          {!videoMeta ? (
            <div className="space-y-4">
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-violet-500/60 rounded-xl p-6 text-center cursor-pointer transition bg-zinc-950/40 hover:bg-zinc-950/80 group"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 group-hover:text-violet-400 group-hover:scale-105 transition mb-3">
                  <Film className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  id="btn-select-video"
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-violet-500/20 cursor-pointer pointer-events-none"
                >
                  Select Video
                </button>
                <p className="text-xs text-zinc-500 mt-2">MP4, MOV, MKV, or WebM video file</p>
              </div>

              {/* Sample Video One-Click Generator */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60">
                <div className="flex items-center space-x-2 text-xs text-zinc-400">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>No video handy? Try our 3s on-device test clip</span>
                </div>
                <button
                  id="btn-sample-video"
                  onClick={onSelectSampleVideo}
                  disabled={isGeneratingSampleVideo}
                  className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingSampleVideo ? 'Generating...' : 'Use Test Video'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-700/80 bg-black shadow-md">
                <video
                  src={videoMeta.url}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Video Inspection Metadata (Section 8) */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <div className="text-zinc-500 flex items-center justify-center space-x-1 mb-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Duration</span>
                  </div>
                  <div className="font-semibold text-white font-mono">{formatDuration(videoMeta.duration)}</div>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <div className="text-zinc-500 flex items-center justify-center space-x-1 mb-0.5">
                    <Maximize2 className="w-3 h-3" />
                    <span>Resolution</span>
                  </div>
                  <div className="font-semibold text-white font-mono">
                    {videoMeta.width} × {videoMeta.height}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <div className="text-zinc-500 flex items-center justify-center space-x-1 mb-0.5">
                    <Film className="w-3 h-3" />
                    <span>FPS</span>
                  </div>
                  <div className="font-semibold text-white font-mono">{videoMeta.fps}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Blending & Quality Controls */}
      {refaceOptions && onUpdateRefaceOptions && (
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setShowBlendingControls((prev) => !prev)}
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-200 flex items-center space-x-2">
                  <span>Enhanced Blending & Alignment</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    High Quality
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  {refaceOptions.blendSoftness === 'ultra_smooth' ? 'Ultra-Smooth Feather' : refaceOptions.blendSoftness === 'natural' ? 'Natural Feather' : 'Crisp Edge'} • Skin Match {Math.round(refaceOptions.skinMatchStrength * 100)}%
                </div>
              </div>
            </div>

            <button
              type="button"
              className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              {showBlendingControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showBlendingControls && (
            <div className="pt-3 border-t border-zinc-800/80 space-y-4 text-xs animate-in fade-in duration-200">
              {/* Blend Softness Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="font-medium">Facial Contour Feathering</span>
                  <span className="text-zinc-500 text-[11px]">Organic boundary blend</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['ultra_smooth', 'natural', 'crisp'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onUpdateRefaceOptions({ blendSoftness: mode })}
                      className={`py-2 px-3 rounded-xl font-medium border text-center transition cursor-pointer ${
                        refaceOptions.blendSoftness === mode
                          ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-200 shadow-sm'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {mode === 'ultra_smooth' && 'Ultra-Smooth (20px)'}
                      {mode === 'natural' && 'Natural (14px)'}
                      {mode === 'crisp' && 'Crisp (8px)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Tone Transfer Strength */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="font-medium flex items-center space-x-1.5">
                    <Palette className="w-3.5 h-3.5 text-violet-400" />
                    <span>Skin Tone & Illumination Match</span>
                  </span>
                  <span className="font-mono text-indigo-400 font-semibold">
                    {Math.round(refaceOptions.skinMatchStrength * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={refaceOptions.skinMatchStrength}
                  onChange={(e) => onUpdateRefaceOptions({ skinMatchStrength: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Source Original (0%)</span>
                  <span>Balanced Natural (75%)</span>
                  <span>Full Target Color (100%)</span>
                </div>
              </div>

              {/* Face Scale Adjust */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="font-medium">Proportional Face Scale</span>
                  <span className="font-mono text-indigo-400 font-semibold">
                    {Math.round(refaceOptions.faceScaleAdjust * 100)}%
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0.92"
                    max="1.20"
                    step="0.02"
                    value={refaceOptions.faceScaleAdjust}
                    onChange={(e) => onUpdateRefaceOptions({ faceScaleAdjust: parseFloat(e.target.value) })}
                    className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateRefaceOptions({ faceScaleAdjust: 1.05 })}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* START REFACE BUTTON (Section 6) */}
      <div className="space-y-3 pt-2">
        <button
          id="btn-start-reface"
          onClick={onStartReface}
          disabled={!canStart}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition flex items-center justify-center space-x-2 cursor-pointer shadow-xl ${
            canStart
              ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed'
          }`}
        >
          <span>START REFACE</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Small Privacy Text (Section 6) */}
        <p className="text-center text-xs text-zinc-500 font-medium">
          Your photos and videos stay on your device. No cloud processing.
        </p>
      </div>
    </div>
  );
};
