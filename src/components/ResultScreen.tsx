import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Share2,
  RotateCcw,
  Clock,
  Maximize2,
  Film,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { RefaceResult } from '../types';

interface ResultScreenProps {
  result: RefaceResult;
  onNewReface: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ result, onNewReface }) => {
  const [copied, setCopied] = useState(false);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveToGallery = () => {
    const a = document.createElement('a');
    a.href = result.videoUrl;
    const extension = result.videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
    a.download = `REFACE_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const extension = result.videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([result.videoBlob], `REFACE_${Date.now()}.${extension}`, {
          type: result.videoBlob.type,
        });
        await navigator.share({
          title: 'REFACE AI Video',
          text: 'Created with REFACE — 100% On-Device AI Video Face Swap',
          files: [file],
        });
      } catch {
        // Fallback if file sharing rejected
      }
    } else {
      // Fallback: copy link and show toast
      try {
        await navigator.clipboard.writeText(result.videoUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        handleSaveToGallery();
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-7 animate-in fade-in duration-300">
      {/* Result Header (Section 20) */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>✓ REFACE COMPLETE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
          Ready for Gallery
        </h2>
        <p className="text-xs text-zinc-400">
          Generated entirely on-device in {result.processingTimeSeconds} seconds with audio preserved.
        </p>
      </div>

      {/* Video Preview Player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-700/80 bg-black shadow-2xl">
        <video
          src={result.videoUrl}
          controls
          autoPlay
          loop
          playsInline
          className="w-full h-full object-contain"
        />
      </div>

      {/* Video Metadata Cards (Section 20) */}
      <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-zinc-500 flex items-center justify-center space-x-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Duration</span>
          </div>
          <div className="font-semibold text-white font-mono">{formatDuration(result.duration)}</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-zinc-500 flex items-center justify-center space-x-1 mb-1">
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Resolution</span>
          </div>
          <div className="font-semibold text-white font-mono">
            {result.width} × {result.height}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-zinc-500 flex items-center justify-center space-x-1 mb-1">
            <Film className="w-3.5 h-3.5 text-indigo-400" />
            <span>FPS</span>
          </div>
          <div className="font-semibold text-white font-mono">{result.fps}</div>
        </div>
      </div>

      {/* Action Buttons (Section 20) */}
      <div className="space-y-3 pt-2">
        {/* Save to Gallery button */}
        <button
          id="btn-save-to-gallery"
          onClick={handleSaveToGallery}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base transition flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/25 cursor-pointer active:scale-[0.99]"
        >
          <Download className="w-5 h-5" />
          <span>SAVE TO GALLERY</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {/* Share button */}
          <button
            id="btn-share-result"
            onClick={handleShare}
            className="py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-white font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-zinc-300" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>

          {/* New Reface button */}
          <button
            id="btn-new-reface"
            onClick={onNewReface}
            className="py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-zinc-400" />
            <span>New Reface</span>
          </button>
        </div>
      </div>

      {/* Local Privacy Seal */}
      <div className="flex items-center justify-center space-x-2 text-[11px] text-zinc-500 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Processed locally on device • No cloud transmission</span>
      </div>
    </div>
  );
};
