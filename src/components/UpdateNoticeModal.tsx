import React from 'react';
import { X, Wrench } from 'lucide-react';

interface UpdateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateNoticeModal: React.FC<UpdateNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in transition-opacity duration-300">
      <div className="bg-[#141026] border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between bg-[#191432]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
              <Wrench className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-righteous text-white text-base sm:text-lg tracking-wide">
                  Update:
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-righteous bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Notice
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80">RoBeats! News Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 text-purple-100 text-xs sm:text-sm leading-relaxed space-y-3">
            <p>
              The website is currently undergoing maintenance, so some features may occasionally be unavailable (as you might notice in the preview). I am also in the process of incorporating several suggestions from <strong className="text-amber-300 font-semibold">Tishi</strong> and <strong className="text-amber-300 font-semibold">turtle</strong> - thank you both for your feedbacks!
            </p>
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-righteous tracking-wide shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Got it, continue!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
