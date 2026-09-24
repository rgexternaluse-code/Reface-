import React, { useState } from 'react';
import { Check, ArrowLeft, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { DetectedFace } from '../types';

interface TargetFaceSelectorProps {
  faces: DetectedFace[];
  selectedFaceId: string | null;
  onSelectFace: (face: DetectedFace) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const TargetFaceSelector: React.FC<TargetFaceSelectorProps> = ({
  faces,
  selectedFaceId,
  onSelectFace,
  onContinue,
  onBack,
}) => {
  const currentSelection = faces.find((f) => f.id === selectedFaceId) || faces[0];
  const [activeId, setActiveId] = useState<string>(currentSelection?.id || '');

  const handlePick = (face: DetectedFace) => {
    setActiveId(face.id);
    onSelectFace(face);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-home"
          onClick={onBack}
          className="flex items-center space-x-1 text-xs font-semibold text-zinc-400 hover:text-white py-1.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-1.5 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Detection Scan</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
          SELECT FACE TO REPLACE
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          We detected {faces.length} candidate face{faces.length > 1 ? 's' : ''} in the target video.
          Choose which face you want to replace.
        </p>
      </div>

      {/* Faces Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
        {faces.map((face) => {
          const isSelected = activeId === face.id;
          return (
            <div
              key={face.id}
              id={`card-face-${face.id}`}
              onClick={() => handlePick(face)}
              className={`p-4 rounded-2xl border transition text-center cursor-pointer flex flex-col items-center justify-between relative group ${
                isSelected
                  ? 'bg-zinc-900 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700/80 mb-3 bg-zinc-900 shadow-inner group-hover:scale-105 transition">
                <img
                  src={face.exactCropUrl || face.thumbnailUrl}
                  alt={face.label}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-white font-mono">{face.label}</div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Conf: {Math.round(face.confidence * 100)}%
                </div>
              </div>

              <div className="mt-4 w-full">
                <span
                  className={`block py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  {isSelected ? '[ SELECTED ]' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Continue Action */}
      <div className="pt-4">
        <button
          id="btn-continue-reface"
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base transition flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/20 cursor-pointer"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
