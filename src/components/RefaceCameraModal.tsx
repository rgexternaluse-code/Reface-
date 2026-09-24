import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle } from 'lucide-react';

interface RefaceCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const RefaceCameraModal: React.FC<RefaceCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPreview(null);
      setCapturedBlob(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Unable to access camera on this device.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleFacing = () => {
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front-facing selfie
    if (cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setIsCapturing(false);
        if (blob) {
          setCapturedBlob(blob);
          setCapturedPreview(URL.createObjectURL(blob));
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const confirmSnapshot = () => {
    if (capturedBlob) {
      const file = new File([capturedBlob], `selfie_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      onCapture(file);
      onClose();
    }
  };

  const retakeSnapshot = () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedPreview(null);
    setCapturedBlob(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-mono">REFACE SELFIE CAMERA</h3>
              <p className="text-[11px] text-zinc-400">Align your face inside the oval guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex-1 bg-black aspect-[3/4] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm text-zinc-300 font-medium">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
              >
                Try Again
              </button>
            </div>
          ) : capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Selfie Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Reface Oval Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-64 h-84 border-2 border-dashed border-indigo-400/80 rounded-[50%] shadow-[0_0_25px_rgba(99,102,241,0.25)] flex items-center justify-center">
                  {/* Crosshair markers */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-500 text-[10px] font-mono font-bold text-white tracking-wider">
                    HEAD TOP
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-500 text-[10px] font-mono font-bold text-white tracking-wider">
                    CHIN
                  </div>
                  <div className="w-8 h-8 rounded-full border border-indigo-400/40 opacity-40" />
                </div>
              </div>

              {/* HUD Badge */}
              <div className="absolute top-4 left-4 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  LIVE BIOMETRIC HUD
                </span>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Camera Controls */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={retakeSnapshot}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-200 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={confirmSnapshot}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition"
              >
                <Check className="w-4 h-4" />
                <span>Use Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleFacing}
                className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                title="Switch Camera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={takeSnapshot}
                disabled={isCapturing || !!cameraError}
                className="relative p-1 rounded-full border-4 border-white hover:border-indigo-400 transition cursor-pointer active:scale-95"
              >
                <div className="w-14 h-14 rounded-full bg-white hover:bg-indigo-400 transition" />
              </button>

              <div className="w-11" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
