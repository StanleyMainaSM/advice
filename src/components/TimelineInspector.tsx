/**
 * Interactive Timeline & Dialogue Inspector
 * Allows navigating shots, inspecting the exact word-for-word transcript, and loading original audio.
 */

import React, { useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  Volume2, 
  VolumeX, 
  Clock, 
  Eye, 
  User, 
  FileAudio,
  Sliders,
  CheckCircle
} from 'lucide-react';
import { DIALOGUE_TIMELINE, TOTAL_DURATION, DialogueLine, CameraShotType } from '../data/dialogueTimeline';
import { globalAudioEngine } from '../utils/audioEngine';

interface TimelineInspectorProps {
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  hasCustomAudio: boolean;
  onAudioUploaded: (filename: string) => void;
  onAudioRemoved: () => void;
  bgmVolume: number;
  onBgmVolumeChange: (vol: number) => void;
}

export const TimelineInspector: React.FC<TimelineInspectorProps> = ({
  currentTime,
  isPlaying,
  onSeek,
  onTogglePlay,
  hasCustomAudio,
  onAudioUploaded,
  onAudioRemoved,
  bgmVolume,
  onBgmVolumeChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await globalAudioEngine.loadCustomAudio(file);
      onAudioUploaded(file.name);
    } catch (err) {
      console.error('Audio load error:', err);
      alert('Could not parse audio file. Supported formats: MP3, WAV, M4A, OGG, WebM');
    }
  };

  const activeLine = DIALOGUE_TIMELINE.find(
    l => currentTime >= l.start && currentTime < l.end
  ) || DIALOGUE_TIMELINE[0];

  const getShotLabel = (shot: CameraShotType) => {
    switch (shot) {
      case 'mentor_closeup':
        return 'Mentor Close-Up (35mm)';
      case 'over_shoulder':
        return 'Over The Shoulder';
      case 'young_man_reaction':
        return 'Young Man Reflection';
      case 'two_shot':
        return 'Study Room Two-Shot';
      case 'mentor_hands':
        return 'Weathered Hands Detail';
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 border border-stone-800 rounded-xl overflow-hidden text-stone-200">
      {/* Top Bar: Playback Controls & Time */}
      <div className="p-4 bg-stone-950/60 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center font-bold transition-all shadow-md active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => onSeek(0)}
            className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="ml-2 font-mono text-sm tracking-tight">
            <span className="text-white font-bold">{formatTime(currentTime)}</span>
            <span className="text-stone-500 mx-1">/</span>
            <span className="text-stone-400">{formatTime(TOTAL_DURATION)}</span>
          </div>
        </div>

        {/* Audio Source Status & Upload */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {hasCustomAudio ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-400 text-xs">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Original Audio Synced</span>
              <button
                onClick={onAudioRemoved}
                className="ml-1 text-stone-400 hover:text-white underline text-[10px]"
              >
                Reset
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-stone-300 hover:text-white text-xs font-medium transition-colors"
              title="Attach your local voice recording file if desired"
            >
              <FileAudio className="w-3.5 h-3.5 text-amber-400" />
              <span>Sync Audio File</span>
            </button>
          )}

          {/* Background music volume slider */}
          <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700/80 text-xs">
            {bgmVolume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-[10px] text-stone-400 hidden sm:inline">Score:</span>
            <input
              type="range"
              min="0"
              max="0.4"
              step="0.02"
              value={bgmVolume}
              onChange={(e) => onBgmVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 accent-amber-400 bg-stone-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Scrubber Bar */}
      <div className="px-4 py-3 bg-stone-950/30 border-b border-stone-800">
        <div className="relative w-full h-8 flex items-center group cursor-pointer">
          <input
            type="range"
            min="0"
            max={TOTAL_DURATION}
            step="0.1"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400 z-10"
          />
        </div>

        {/* Shot blocks indicator */}
        <div className="flex w-full h-2 rounded-xs overflow-hidden gap-0.5 mt-1">
          {DIALOGUE_TIMELINE.map((line) => {
            const widthPct = ((line.end - line.start) / TOTAL_DURATION) * 100;
            const isActive = currentTime >= line.start && currentTime < line.end;
            let color = 'bg-stone-700';
            if (line.shot === 'mentor_closeup') color = 'bg-amber-600';
            else if (line.shot === 'over_shoulder') color = 'bg-sky-600';
            else if (line.shot === 'young_man_reaction') color = 'bg-emerald-600';
            else if (line.shot === 'two_shot') color = 'bg-indigo-600';
            else if (line.shot === 'mentor_hands') color = 'bg-rose-600';

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
            <span>Theme: <strong className="text-stone-200">{activeLine.topicTag}</strong></span>
          </div>
        </div>
      </div>

      {/* Script & Dialogue List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-stone-800/40">
        <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Dialogue & Emotional Direction</span>
          <span>Click any line to seek</span>
        </div>

        {DIALOGUE_TIMELINE.map((line) => {
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
                    {formatTime(line.start)}
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
                {line.text || '— [Silent pause: Mentor reflective gaze, slow fade to black] —'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
