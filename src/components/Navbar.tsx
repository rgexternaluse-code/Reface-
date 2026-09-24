import React from 'react';
import { ShieldCheck, Cpu, AlertTriangle, Wifi, WifiOff, Smartphone } from 'lucide-react';

interface NavbarProps {
  onOpenSpecs: () => void;
  onOpenNotice: () => void;
  onOpenBuildApk: () => void;
  isOffline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSpecs,
  onOpenNotice,
  onOpenBuildApk,
  isOffline,
}) => {
  return (
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 font-black text-white tracking-wider text-base">
            R
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-white text-lg font-mono">REFACE</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                100% On-Device
              </span>
            </div>
          </div>
        </div>

        {/* Status and Action Badges */}
        <div className="flex items-center space-x-2">
          {/* Build APK button */}
          <button
            onClick={onOpenBuildApk}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
            title="Install or Build Android APK"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Build / Install APK</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* Offline indicator */}
          <div
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-zinc-900/90 text-zinc-300 border-zinc-800"
            title={isOffline ? 'Running completely offline' : 'Ready for on-device offline processing'}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Offline Safe</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-zinc-300">No Uploads</span>
              </>
            )}
          </div>

          {/* Hardware Specs button */}
          <button
            id="btn-specs"
            onClick={onOpenSpecs}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition cursor-pointer"
            title="Device Capabilities & Hardware Profiler"
            aria-label="Device Capabilities"
          >
            <Cpu className="w-4 h-4" />
          </button>

          {/* Responsible Use button */}
          <button
            id="btn-notice"
            onClick={onOpenNotice}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition cursor-pointer"
            title="Responsible Use Notice"
            aria-label="Responsible Use Notice"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

