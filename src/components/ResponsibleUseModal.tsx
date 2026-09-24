import React from 'react';
import { ShieldCheck, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ResponsibleUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResponsibleUseModal: React.FC<ResponsibleUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 text-zinc-200 shadow-2xl relative">
        <button
          id="btn-close-notice"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Responsible Use Policy</h3>
            <p className="text-xs text-zinc-400">REFACE Ethics & Legitimate Creative Use</p>
          </div>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-300 leading-relaxed border-t border-b border-zinc-800/80 py-4 my-4">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <p>
              <strong className="text-white">Consent required:</strong> Only use images and videos you have permission and rights to modify.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <p>
              <strong className="text-white">No deception:</strong> Do not use REFACE to impersonate, harass, defame, or deceive people.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <p>
              <strong className="text-white">Transparency:</strong> Generated media is stamped with an on-device indicator and should not be presented as authentic footage.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p>
              <strong className="text-white">100% Privacy:</strong> All computations are strictly local. No media is ever sent to third parties or remote servers.
            </p>
          </div>
        </div>

        <button
          id="btn-confirm-notice"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
};
