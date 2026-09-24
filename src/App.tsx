/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { TargetFaceSelector } from './components/TargetFaceSelector';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultScreen } from './components/ResultScreen';
import { DeviceCapabilitiesModal } from './components/DeviceCapabilitiesModal';
import { ResponsibleUseModal } from './components/ResponsibleUseModal';
import { BuildApkModal } from './components/BuildApkModal';
import {
  DetectedFace,
  DeviceCapability,
  ProcessingProgress,
  RefaceOptions,
  RefaceResult,
  SourceFaceData,
  VideoMetadata,
} from './types';
import { detectFacesOnCanvas, scanAndAnalyzeFacePhoto } from './utils/faceEngine';
import { createSampleVideoBlob, SampleFace } from './utils/sampleMedia';
import { VideoRefacePipeline } from './utils/videoProcessor';
import { AlertCircle, X } from 'lucide-react';

type AppView = 'home' | 'select_target_face' | 'processing' | 'result';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isBuildApkOpen, setIsBuildApkOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<'Original' | '1080p' | '720p' | '480p'>('Original');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Enhanced Reface Blending Options
  const [refaceOptions, setRefaceOptions] = useState<RefaceOptions>({
    blendSoftness: 'ultra_smooth',
    skinMatchStrength: 0.75,
    faceScaleAdjust: 1.05,
    horizontalOffsetPct: 0,
    verticalOffsetPct: 0,
    coverageMode: 'full',
  });

  // Device specs
  const [capabilities, setCapabilities] = useState<DeviceCapability>({
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    memoryGb: (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8,
    gpuRenderer: 'Detecting...',
    isOffline: !navigator.onLine,
    recommendedResolution: 'Original',
    hardwareAcceleration: 'GPU/NPU',
  });

  // Source face state
  const [sourceFace, setSourceFace] = useState<SourceFaceData>({
    file: null,
    dataUrl: '',
    detectedFace: null,
    isValid: false,
    statusMessage: '',
  });

  // Video state
  const [videoMeta, setVideoMeta] = useState<VideoMetadata | null>(null);
  const [isGeneratingSampleVideo, setIsGeneratingSampleVideo] = useState(false);

  // Target faces in video
  const [targetFaces, setTargetFaces] = useState<DetectedFace[]>([]);
  const [selectedTargetFace, setSelectedTargetFace] = useState<DetectedFace | null>(null);

  // Processing state
  const [progress, setProgress] = useState<ProcessingProgress>({
    step: 'idle',
    statusMessage: 'Ready',
    currentFrame: 0,
    totalFrames: 0,
    percent: 0,
    fps: 0,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
  });

  // Result state
  const [result, setResult] = useState<RefaceResult | null>(null);

  // Active pipeline instance
  const pipelineRef = useRef<VideoRefacePipeline | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Monitor online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Profile WebGL / GPU Renderer
    try {
      const glCanvas = document.createElement('canvas');
      const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          setCapabilities((prev) => ({
            ...prev,
            gpuRenderer: renderer || 'Hardware Accelerated WebGL',
          }));
        }
      }
    } catch {
      // Fallback
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process Source Face Image
  const handleProcessFaceImage = async (dataUrl: string, file: File | null = null) => {
    setErrorMessage(null);

    // Immediately reflect active scanning state
    setSourceFace({
      file,
      dataUrl,
      detectedFace: null,
      isValid: false,
      statusMessage: 'Scanning photo for facial geometry...',
      isScanning: true,
      scanProgress: 12,
      scanPhase: 'Initializing image matrix & luminance field...',
      candidateFaces: [],
      activeFaceIndex: 0,
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataUrl;

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      try {
        const scanResult = await scanAndAnalyzeFacePhoto(canvas, (phase, prog) => {
          setSourceFace((prev) => ({
            ...prev,
            scanPhase: phase,
            scanProgress: prog,
          }));
        });

        if (scanResult.faces.length > 0) {
          setSourceFace({
            file,
            dataUrl,
            detectedFace: scanResult.faces[0],
            isValid: true,
            statusMessage: '✓ Exact face detected & verified',
            isScanning: false,
            scanProgress: 100,
            scanPhase: 'Exact face locked and verified',
            candidateFaces: scanResult.faces,
            activeFaceIndex: 0,
          });
        } else {
          setSourceFace({
            file,
            dataUrl,
            detectedFace: null,
            isValid: false,
            statusMessage:
              scanResult.rejectionReason ||
              'No face detected. Please select a clear photo containing one visible face.',
            isScanning: false,
            scanProgress: 100,
            scanPhase: 'Analysis failed: No face detected',
            candidateFaces: [],
            activeFaceIndex: 0,
          });
        }
      } catch (err: any) {
        setSourceFace({
          file,
          dataUrl,
          detectedFace: null,
          isValid: false,
          statusMessage: 'Failed to process face photo. Please select another image.',
          isScanning: false,
          scanProgress: 0,
          candidateFaces: [],
          activeFaceIndex: 0,
        });
      }
    };
  };

  const handleSelectCandidateFace = (face: DetectedFace, index: number) => {
    setSourceFace((prev) => ({
      ...prev,
      detectedFace: face,
      activeFaceIndex: index,
    }));
  };

  const handleUpdateFaceCrop = (face: DetectedFace) => {
    setSourceFace((prev) => ({
      ...prev,
      detectedFace: face,
    }));
  };

  const handleSelectFaceFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleProcessFaceImage(e.target.result as string, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleFace = (sample: SampleFace) => {
    handleProcessFaceImage(sample.dataUrl, null);
  };

  // Inspect Target Video
  const handleInspectVideo = async (url: string, file: File | null = null) => {
    setErrorMessage(null);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;

    tempVideo.onloadedmetadata = async () => {
      const duration = tempVideo.duration || 3.0;
      const width = tempVideo.videoWidth || 640;
      const height = tempVideo.videoHeight || 480;

      const meta: VideoMetadata = {
        file,
        url,
        duration,
        width,
        height,
        fps: 30,
        hasAudio: true,
        sizeBytes: file ? file.size : 2_500_000,
      };

      setVideoMeta(meta);

      // Perform fast keyframe face scan to detect candidate faces in the video
      tempVideo.currentTime = Math.min(0.5, duration / 2);
      tempVideo.onseeked = async () => {
        const scanCanvas = document.createElement('canvas');
        scanCanvas.width = width;
        scanCanvas.height = height;
        const sCtx = scanCanvas.getContext('2d');
        if (sCtx) {
          sCtx.drawImage(tempVideo, 0, 0);
          const faces = await detectFacesOnCanvas(scanCanvas, 0.5);
          if (faces.length > 0) {
            setTargetFaces(faces);
            setSelectedTargetFace(faces[0]);
          }
        }
      };
    };
  };

  const handleSelectVideoFile = (file: File) => {
    const url = URL.createObjectURL(file);
    handleInspectVideo(url, file);
  };

  const handleSelectSampleVideo = async () => {
    try {
      setIsGeneratingSampleVideo(true);
      const { url } = await createSampleVideoBlob();
      await handleInspectVideo(url, null);
    } catch {
      setErrorMessage('Failed to initialize sample video on device.');
    } finally {
      setIsGeneratingSampleVideo(false);
    }
  };

  // Trigger Reface
  const handleStartReface = () => {
    if (!sourceFace.isValid || !videoMeta) return;

    // If multiple faces detected in target video, present Section 9 multi-face picker
    if (targetFaces.length > 1) {
      setView('select_target_face');
    } else {
      const faceToUse = selectedTargetFace || targetFaces[0];
      if (faceToUse) {
        startExecutionPipeline(faceToUse);
      } else {
        // Fallback: build a default centered target face descriptor
        const defaultFace: DetectedFace = {
          id: 'face_default',
          label: 'Face 1',
          confidence: 0.85,
          box: {
            x: Math.round(videoMeta.width * 0.25),
            y: Math.round(videoMeta.height * 0.15),
            width: Math.round(videoMeta.width * 0.5),
            height: Math.round(videoMeta.height * 0.6),
          },
          landmarks: {
            forehead: { x: videoMeta.width * 0.5, y: videoMeta.height * 0.2 },
            leftEye: { x: videoMeta.width * 0.4, y: videoMeta.height * 0.35 },
            rightEye: { x: videoMeta.width * 0.6, y: videoMeta.height * 0.35 },
            nose: { x: videoMeta.width * 0.5, y: videoMeta.height * 0.48 },
            mouthLeft: { x: videoMeta.width * 0.42, y: videoMeta.height * 0.6 },
            mouthRight: { x: videoMeta.width * 0.58, y: videoMeta.height * 0.6 },
            chin: { x: videoMeta.width * 0.5, y: videoMeta.height * 0.72 },
            leftCheek: { x: videoMeta.width * 0.32, y: videoMeta.height * 0.48 },
            rightCheek: { x: videoMeta.width * 0.68, y: videoMeta.height * 0.48 },
          },
          thumbnailUrl: sourceFace.dataUrl,
        };
        startExecutionPipeline(defaultFace);
      }
    }
  };

  const startExecutionPipeline = async (targetFace: DetectedFace) => {
    if (!videoMeta || !sourceFace.detectedFace) return;

    setView('processing');
    setProgress({
      step: 'preparing',
      statusMessage: 'Preparing on-device pipeline...',
      currentFrame: 0,
      totalFrames: Math.round(videoMeta.duration * videoMeta.fps),
      percent: 1,
      fps: videoMeta.fps,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
    });

    const pipeline = new VideoRefacePipeline();
    pipelineRef.current = pipeline;

    try {
      const res = await pipeline.processVideo(
        sourceFace,
        videoMeta,
        targetFace,
        {
          onProgress: (p) => setProgress(p),
          onPreviewFrame: (canvas) => {
            if (previewCanvasRef.current) {
              const targetCanvas = previewCanvasRef.current;
              if (targetCanvas.width !== canvas.width || targetCanvas.height !== canvas.height) {
                targetCanvas.width = canvas.width;
                targetCanvas.height = canvas.height;
              }
              const ctx = targetCanvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(canvas, 0, 0);
              }
            }
          },
        },
        refaceOptions
      );

      setResult(res);
      setView('result');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Processing failed';
      if (msg.includes('cancelled')) {
        setView('home');
      } else {
        setErrorMessage(msg);
        setView('home');
      }
    } finally {
      pipelineRef.current = null;
    }
  };

  const handleCancelProcessing = () => {
    if (pipelineRef.current) {
      pipelineRef.current.cancel();
    }
    setView('home');
  };

  const handleNewReface = () => {
    setResult(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar with Offline/Specs/Notice/Build APK */}
      <Navbar
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenNotice={() => setIsNoticeOpen(true)}
        onOpenBuildApk={() => setIsBuildApkOpen(true)}
        isOffline={isOffline}
      />

      {/* Global error banner */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto w-full px-4 pt-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-center">
        {view === 'home' && (
          <HomeScreen
            sourceFace={sourceFace}
            videoMeta={videoMeta}
            onSelectFaceFile={handleSelectFaceFile}
            onSelectSampleFace={handleSelectSampleFace}
            onSelectVideoFile={handleSelectVideoFile}
            onSelectSampleVideo={handleSelectSampleVideo}
            onStartReface={handleStartReface}
            isGeneratingSampleVideo={isGeneratingSampleVideo}
            onSelectCandidateFace={handleSelectCandidateFace}
            onUpdateFaceCrop={handleUpdateFaceCrop}
            refaceOptions={refaceOptions}
            onUpdateRefaceOptions={(opts) => setRefaceOptions((prev) => ({ ...prev, ...opts }))}
            onOpenBuildApk={() => setIsBuildApkOpen(true)}
          />
        )}

        {view === 'select_target_face' && (
          <TargetFaceSelector
            faces={targetFaces}
            selectedFaceId={selectedTargetFace?.id || null}
            onSelectFace={(face) => setSelectedTargetFace(face)}
            onContinue={() => {
              if (selectedTargetFace) {
                startExecutionPipeline(selectedTargetFace);
              } else if (targetFaces[0]) {
                startExecutionPipeline(targetFaces[0]);
              }
            }}
            onBack={() => setView('home')}
          />
        )}

        {view === 'processing' && (
          <ProcessingScreen
            progress={progress}
            onCancel={handleCancelProcessing}
            previewCanvasRef={previewCanvasRef}
          />
        )}

        {view === 'result' && result && (
          <ResultScreen result={result} onNewReface={handleNewReface} />
        )}
      </main>

      {/* Device Capabilities & Profiler Modal */}
      <DeviceCapabilitiesModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        capabilities={capabilities}
        selectedResolution={selectedResolution}
        onSelectResolution={setSelectedResolution}
      />

      {/* Responsible Use Policy Modal */}
      <ResponsibleUseModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
      />

      {/* Build & Install APK Guide Modal */}
      <BuildApkModal
        isOpen={isBuildApkOpen}
        onClose={() => setIsBuildApkOpen(false)}
      />

      {/* Persistent Privacy Seal Footer */}
      <footer className="border-t border-zinc-900 py-3 text-center text-[11px] text-zinc-600">
        <p>REFACE • 100% On-Device AI Video Face Replacement • No External Network Dependencies</p>
      </footer>
    </div>
  );
}
