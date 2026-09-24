import React from 'react';
import { X, Cpu, HardDrive, Zap, Shield, Sparkles } from 'lucide-react';
import { DeviceCapability } from '../types';

interface DeviceCapabilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  capabilities: DeviceCapability;
  selectedResolution: 'Original' | '1080p' | '720p' | '480p';
  onSelectResolution: (res: 'Original' | '1080p' | '720p' | '480p') => void;
}

export const DeviceCapabilitiesModal: React.FC<DeviceCapabilitiesModalProps> = ({
  isOpen,
  onClose,
  capabilities,
  selectedResolution,
  onSelectResolution,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 text-zinc-200 shadow-2xl relative">
        <button
          id="btn-close-specs"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Device Capabilities</h3>
            <p className="text-xs text-zinc-400">On-Device Hardware Profiler &amp; Acceleration</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center space-x-2 text-zinc-400 text-xs mb-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>CPU Concurrency</span>
            </div>
            <div className="text-base font-semibold text-white font-mono">
              {capabilities.hardwareConcurrency} Cores / Threads
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center space-x-2 text-zinc-400 text-xs mb-1">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>Estimated Memory</span>
            </div>
            <div className="text-base font-semibold text-white font-mono">
              {capabilities.memoryGb ? `${capabilities.memoryGb} GB RAM` : 'System Managed'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 col-span-2">
            <div className="flex items-center space-x-2 text-zinc-400 text-xs mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Graphics &amp; Acceleration Pipeline</span>
            </div>
            <div className="text-xs font-mono text-zinc-300 truncate" title={capabilities.gpuRenderer}>
              {capabilities.gpuRenderer || 'Hardware Accelerated WebGL / WebCodecs'}
            </div>
            <div className="mt-1.5 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Mode: {capabilities.hardwareAcceleration}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Zero Cloud Egress
              </span>
            </div>
          </div>
        </div>

        {/* Resolution Options (Section 17) */}
        <div className="mb-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
            Target Render Quality
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Original', '1080p', '720p', '480p'] as const).map((res) => (
              <button
                key={res}
                id={`btn-res-${res.toLowerCase()}`}
                onClick={() => onSelectResolution(res)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                  selectedResolution === res
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Android Export Notice */}
        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-800/40 text-xs text-indigo-300 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Full Android NDK project bundled: </span>
            The complete Android Studio Jetpack Compose + C++ NDK MediaCodec codebase is included in the project for direct APK compilation.
          </div>
        </div>

        <button
          id="btn-done-specs"
          onClick={onClose}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
