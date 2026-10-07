/**
 * Interactive Timeline & Dialogue Inspector
 * Supports all 3 video formats (YouTube Short, Reels/TikTok, Normal YouTube 16:9).
 * Master visual timing synchronized to dialogue and scene changes.
 */

import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Flame,
  Smartphone,
  Tv,
  CheckCircle2
} from 'lucide-react';
import { 
  DIALOGUE_TIMELINE, 
  SHORT_TIMELINE, 
  TOTAL_DURATION, 
  SHORT_DURATION, 
  DialogueLine, 
  CameraShotType 
} from '../data/dialogueTimeline';
import { ExportFormat } from './VideoExporter';

interface TimelineInspectorProps {
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  activeFormat?: ExportFormat;
  onSelectFormat?: (format: ExportFormat) => void;
  hasCustomAudio?: boolean;
  onAudioUploaded?: (filename: string) => void;
  onAudioRemoved?: () => void;
  bgmVolume?: number;
  onBgmVolumeChange?: (vol: number) => void;
}

export const TimelineInspector: React.FC<TimelineInspectorProps> = ({
  currentTime,
  isPlaying,
  onSeek,
  onTogglePlay,
  activeFormat = 'reels_tiktok',
  onSelectFormat,
}) => {
  const isShort = activeFormat === 'youtube_short';
  const activeDuration = isShort ? SHORT_DURATION : TOTAL_DURATION;
  const activeTimeline = isShort ? SHORT_TIMELINE : DIALOGUE_TIMELINE;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const activeLine = activeTimeline.find(
    l => currentTime >= l.start && currentTime < l.end
  ) || activeTimeline[0];

  const getShotLabel = (shot: CameraShotType) => {
    switch (shot) {
      case 'mentor_closeup':
        return 'Mentor Close-Up';
      case 'over_shoulder':
        return 'Over The Shoulder';
      case 'young_man_reaction':
        return 'Young Man Reflection';
      case 'two_shot':
        return 'Study Room Two-Shot';
      case 'mentor_hands':
        return 'Weathered Hands Gesture';
      case 'stocks_chart':
        return 'Stocks & Candlesticks';
      case 'coins_savings':
        return 'Coins & Shillings Ledger';
      case 'business_plans':
        return 'Business Plans & Workshop';
      case 'patience_plant':
        return 'Quiet Growth Sapling';
      case 'avoid_scams':
        return 'Contract & Scrutiny';
      case 'hourglass_time':
        return 'Hourglass & Time Value';
      case 'young_man_notes':
        return 'Young Man Taking Notes';
      case 'mentor_smile':
        return 'Mentor Warm Smile';
      case 'family_bookshelf':
        return 'Family & Living Room';
      case 'multiple_income':
        return 'Multiple Income Streams';
      default:
        return 'Cinematic Frame';
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 border border-stone-800 rounded-xl overflow-hidden text-stone-200">
      {/* Top Bar: Playback Controls & Format Switcher */}
      <div className="p-3.5 bg-stone-950/60 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center font-bold transition-all shadow-md active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => onSeek(0)}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
            title="Restart timeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="ml-1.5 font-mono text-xs tracking-tight">
            <span className="text-white font-bold">{formatTime(Math.min(currentTime, activeDuration))}</span>
            <span className="text-stone-500 mx-1">/</span>
            <span className="text-stone-400">{formatTime(activeDuration)}</span>
          </div>
        </div>

        {/* Format Selector Pills */}
        {onSelectFormat && (
          <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-lg border border-stone-800 text-[11px]">
            <button
              onClick={() => onSelectFormat('youtube_short')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
                activeFormat === 'youtube_short'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>V1 Short (40s)</span>
            </button>
            <button
              onClick={() => onSelectFormat('reels_tiktok')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
                activeFormat === 'reels_tiktok'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3 text-amber-400" />
              <span>V2 Reels (3:30)</span>
            </button>
            <button
              onClick={() => onSelectFormat('youtube_horizontal')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
                activeFormat === 'youtube_horizontal'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Tv className="w-3 h-3 text-sky-400" />
              <span>V3 16:9 (3:30)</span>
            </button>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-stone-800/80 border border-stone-700/60 rounded-md text-[11px] text-stone-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Visuals Only · 0 Audio</span>
        </div>
      </div>

      {/* Scrubber Bar */}
      <div className="px-4 py-3 bg-stone-950/30 border-b border-stone-800">
        <div className="relative w-full h-8 flex items-center group cursor-pointer">
          <input
            type="range"
            min="0"
            max={activeDuration}
            step="0.1"
            value={Math.min(currentTime, activeDuration)}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400 z-10"
          />
        </div>

        {/* Visual Shot blocks indicator */}
        <div className="flex w-full h-2 rounded-xs overflow-hidden gap-0.5 mt-1">
          {activeTimeline.map((line) => {
            const widthPct = ((line.end - line.start) / activeDuration) * 100;
            const isActive = currentTime >= line.start && currentTime < line.end;
            let color = 'bg-stone-700';
            if (line.shot === 'mentor_closeup') color = 'bg-amber-600';
            else if (line.shot === 'over_shoulder') color = 'bg-sky-600';
            else if (line.shot === 'young_man_reaction') color = 'bg-emerald-600';
            else if (line.shot === 'two_shot') color = 'bg-indigo-600';
            else if (line.shot === 'mentor_hands') color = 'bg-rose-600';
            else if (line.shot === 'stocks_chart') color = 'bg-cyan-600';
            else if (line.shot === 'coins_savings') color = 'bg-yellow-600';
            else if (line.shot === 'business_plans') color = 'bg-blue-600';
            else if (line.shot === 'patience_plant') color = 'bg-green-600';
            else if (line.shot === 'avoid_scams') color = 'bg-red-600';
            else if (line.shot === 'hourglass_time') color = 'bg-amber-500';
            else if (line.shot === 'young_man_notes') color = 'bg-teal-600';
            else if (line.shot === 'mentor_smile') color = 'bg-orange-500';
            else if (line.shot === 'family_bookshelf') color = 'bg-purple-600';
            else if (line.shot === 'multiple_income') color = 'bg-emerald-500';

            return (
              <div
                key={line.id}
                title={`${formatTime(line.start)}: ${getShotLabel(line.shot)} — ${line.topicTag}`}
                onClick={() => onSeek(line.start)}
                style={{ width: `${widthPct}%` }}
                className={`h-full cursor-pointer transition-opacity ${color} ${
                  isActive ? 'opacity-100 ring-2 ring-white z-10' : 'opacity-60 hover:opacity-100'
                }`}
              />
            );
          })}
        </div>

        {/* Active Shot Badge */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Current Shot:</span>
            <span className="font-semibold text-amber-300">
              {getShotLabel(activeLine.shot)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Tag: <strong className="text-stone-200">{activeLine.topicTag}</strong></span>
          </div>
        </div>
      </div>

      {/* Script & Dialogue List with visual cuts */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-stone-800/40">
        <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>{activeTimeline.length} Visual Cuts ({isShort ? 'YouTube Short' : 'Full Storyboard'})</span>
          <span>Click any line to seek</span>
        </div>

        {activeTimeline.map((line, idx) => {
          const isActive = currentTime >= line.start && currentTime < line.end;

          return (
            <div
              key={line.id}
              onClick={() => onSeek(line.start)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? 'bg-amber-400/10 border border-amber-400/40 shadow-sm'
                  : 'hover:bg-stone-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-amber-400">
                    #{idx + 1} · {formatTime(line.start)}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                    {getShotLabel(line.shot)}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 italic">
                  {line.emotion.replace('_', ' ')}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${isActive ? 'text-white font-medium' : 'text-stone-300'}`}>
                {line.text || '— [Contemplative silent gaze & fade to black] —'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
