import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface UpdateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateNoticeModal: React.FC<UpdateNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in transition-opacity duration-300">
      <div className="bg-[#141026] border border-purple-500/40 rounded-2xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between bg-[#191432] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-yellow-300 shadow-sm shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-righteous text-white text-base sm:text-lg tracking-wide">
                  Update Log
                </h3>
              </div>
              <p className="text-[11px] text-purple-300/80">RoBeats! News Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close update log"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div className="bg-[#1b1538]/70 border border-purple-500/25 rounded-xl p-4 text-purple-100 text-xs sm:text-sm leading-relaxed space-y-3">
            <p>
              I have made quite a few changes to the website to better serve the RoBeats!News staff, here are some of those changes:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-purple-100/95">
              <li>New: WEEKLY LEADERBOARD</li>
              <li>
                Website UI Optimization: The UI will now be more compactly arranged, so you won’t have to constantly scroll (which can be quite annoying), but this is available only for Desktop Website, I haven't do it for Mobile and Tablet so you need to wait for next update
              </li>
              <li>
                Changed the template: Yes, I have added Weekly Leaderboard recently, it will also be combined with the Weekly Mission and now, we have Weekly Missions and Weekly Leaderboards in one image
              </li>
              <li>
                Hover Zoom quite annoying, so I make it OFF default (you can zoom with your mouse)
              </li>
              <li>
                Added Leaderboard Button to Song List, now you can direct add a song to Weekly Leaderboard
              </li>
              <li>
                If your data browser have not update new song or new data from Sheets, click to Sync button
              </li>
            </ul>
            <p className="pt-1 text-pink-200">
              I will update this website soon, feel free to give me feedbacks or suggestion to improve the website experience :3
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
