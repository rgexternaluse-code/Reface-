export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouthLeft: { x: number; y: number };
  mouthRight: { x: number; y: number };
  chin: { x: number; y: number };
  forehead: { x: number; y: number };
  leftCheek: { x: number; y: number };
  rightCheek: { x: number; y: number };
  leftEyebrow?: { x: number; y: number };
  rightEyebrow?: { x: number; y: number };
  noseTip?: { x: number; y: number };
  upperLip?: { x: number; y: number };
  lowerLip?: { x: number; y: number };
  contourPoints?: { x: number; y: number }[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedFace {
  id: string;
  label: string;
  confidence: number;
  box: BoundingBox;
  landmarks: FaceLandmarks;
  thumbnailUrl: string;
  exactCropUrl?: string;
  skinTone?: { r: number; g: number; b: number };
  roll?: number; // degrees
  yaw?: number; // degrees
  pitch?: number; // degrees
  sharpness?: number; // 0 - 100
  illumination?: number; // 0 - 100
  symmetry?: number; // 0 - 100
  qualityLabel?: 'Optimal' | 'High' | 'Good' | 'Acceptable' | 'Low';
}

export interface SourceFaceData {
  file: File | null;
  dataUrl: string;
  detectedFace: DetectedFace | null;
  isValid: boolean;
  statusMessage: string;
  isScanning?: boolean;
  scanProgress?: number; // 0 - 100
  scanPhase?: string;
  candidateFaces?: DetectedFace[];
  activeFaceIndex?: number;
  rejectionReason?: string | null;
}

export interface VideoMetadata {
  file: File | null;
  url: string;
  duration: number; // in seconds
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
  sizeBytes: number;
}

export type ProcessingStep =
  | 'idle'
  | 'preparing'
  | 'detecting'
  | 'tracking'
  | 'processing'
  | 'blending'
  | 'encoding'
  | 'restoring_audio'
  | 'saving';

export interface ProcessingProgress {
  step: ProcessingStep;
  statusMessage: string;
  currentFrame: number;
  totalFrames: number;
  percent: number;
  fps: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
}

export interface DeviceCapability {
  hardwareConcurrency: number;
  memoryGb: number;
  gpuRenderer: string;
  isOffline: boolean;
  recommendedResolution: 'Original' | '1080p' | '720p' | '480p';
  hardwareAcceleration: 'GPU/NPU' | 'Balanced' | 'CPU';
}

export interface RefaceResult {
  videoBlob: Blob;
  videoUrl: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  processingTimeSeconds: number;
}

export interface RefaceOptions {
  blendSoftness: 'ultra_smooth' | 'natural' | 'crisp';
  skinMatchStrength: number; // 0 to 1
  faceScaleAdjust: number; // e.g. 0.95 - 1.25
  verticalOffsetPct: number; // -0.2 to 0.2
  horizontalOffsetPct: number; // -0.2 to 0.2
  coverageMode: 'full' | 'features';
}
