/**
 * Simulated Instagram Reel Overlay
 * Allows previewing how the video will appear with native Instagram UI elements (actions, audio badge, captions).
 */

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreVertical, Music2, Check, UserPlus } from 'lucide-react';

interface ReelInstagramOverlayProps {
  currentAdviceTopic?: string;
  hasCustomAudio?: boolean;
}

export const ReelInstagramOverlay: React.FC<ReelInstagramOverlayProps> = ({
  currentAdviceTopic = 'The Core Wealth Rule',
  hasCustomAudio = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(142850);

  const toggleLike = () => {
    setIsLiked(prev => !prev);
    setLikeCount(prev => prev + (isLiked ? -1 : 1));
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20 text-white font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2 px-1 text-sm font-semibold tracking-wide drop-shadow-md">
        <span className="text-base font-bold tracking-tight">Reels</span>
        <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-xs font-mono">
          9:16
        </span>
      </div>

      {/* Center empty for video clarity */}
      <div className="flex-1" />

      {/* Bottom Interface */}
      <div className="flex items-end justify-between pb-3">
        {/* Left column: Creator, Caption, Audio badge */}
        <div className="flex-1 pr-4 pointer-events-auto">
          {/* Creator Profile */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 border-2 border-white flex items-center justify-center text-xs font-bold text-stone-900 shadow">
              M
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-white drop-shadow">the.elder.mentor</span>
              <span className="text-[10px] text-amber-300">✓</span>
            </div>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold border transition-all ${
                isFollowing 
                  ? 'bg-transparent border-white/60 text-white' 
                  : 'bg-white text-stone-950 border-white hover:bg-stone-100'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Caption */}
          <div className="text-xs text-white/95 leading-snug mb-2.5 drop-shadow-md line-clamp-2">
            <span className="font-semibold mr-1">the.elder.mentor</span>
            If you remember only one thing, let it be this. Getting rich is not about what you make...
            <span className="text-stone-300 ml-1">#wealth #lifeadvice #mentor #financialfreedom</span>
          </div>

          {/* Topic Badge & Audio Tag */}
          <div className="flex items-center gap-2 text-[11px] text-white/90">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-full border border-white/10 max-w-[200px] truncate">
              <Music2 className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">
                {hasCustomAudio ? 'Original audio · Uploaded Voice' : 'Original audio · The 70yo Mentor Voice'}
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
              {currentAdviceTopic}
            </span>
          </div>
        </div>

        {/* Right column: Action buttons */}
        <div className="flex flex-col items-center gap-4 pb-1 pointer-events-auto">
          {/* Like */}
          <button onClick={toggleLike} className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-full bg-black/20 backdrop-blur-xs transition-transform active:scale-125">
              <Heart 
                className={`w-6 h-6 transition-colors ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-white'
                }`} 
              />
            </div>
            <span className="text-[10px] font-medium drop-shadow">
              {(likeCount / 1000).toFixed(1)}k
            </span>
          </button>

          {/* Comment */}
          <button className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-full bg-black/20 backdrop-blur-xs transition-transform active:scale-125">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-medium drop-shadow">2,840</span>
          </button>

          {/* Share */}
          <button className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-full bg-black/20 backdrop-blur-xs transition-transform active:scale-125">
              <Send className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-medium drop-shadow">54.2k</span>
          </button>

          {/* Bookmark */}
          <button onClick={() => setIsSaved(!isSaved)} className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-full bg-black/20 backdrop-blur-xs transition-transform active:scale-125">
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
            </div>
          </button>

          {/* Spinning Vinyl Record */}
          <div className="w-7 h-7 rounded-full bg-stone-900 border-2 border-stone-700 flex items-center justify-center animate-spin [animation-duration:4s] shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
