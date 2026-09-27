/**
 * Main Application: 9:16 Instagram Reel Generator & Cinematic Player
 * "The Mentor's Wealth Advice"
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Film, 
  Sliders, 
  Sparkles, 
  Download, 
  Volume2, 
  FileAudio, 
  Smartphone, 
  Maximize2, 
  Eye, 
  Check, 
  Layers, 
  HelpCircle,
  BookOpen,
  Camera,
  Music
} from 'lucide-react';
import { ReelCanvasPlayer, ColorGradePreset } from './components/ReelCanvasPlayer';
import { ReelInstagramOverlay } from './components/ReelInstagramOverlay';
import { TimelineInspector } from './components/TimelineInspector';
import { VideoExporter } from './components/VideoExporter';
import { globalAudioEngine } from './utils/audioEngine';
import { DIALOGUE_TIMELINE, SHOT_IMAGES, CameraShotType, TOTAL_DURATION } from './data/dialogueTimeline';

export default function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [colorGrade, setColorGrade] = useState<ColorGradePreset>('warm_35mm');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleStyle, setSubtitleStyle] = useState<'bold_yellow' | 'clean_white' | 'gold_serif'>('bold_yellow');
  const [showInstagramUi, setShowInstagramUi] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [filmGrainEnabled, setFilmGrainEnabled] = useState(true);
  const [hasCustomAudio, setHasCustomAudio] = useState(false);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState(0.12);
  const [activeTab, setActiveTab] = useState<'timeline' | 'export' | 'shots' | 'script'>('timeline');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync with audio engine
  useEffect(() => {
    const unsubTime = globalAudioEngine.onTimeUpdate((t) => {
      setCurrentTime(t);
    });
    const unsubPlay = globalAudioEngine.onPlayStateChange((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      unsubTime();
      unsubPlay();
    };
  }, []);

  const handleSeek = (time: number) => {
    globalAudioEngine.seek(time);
    setCurrentTime(time);
  };

  const handleTogglePlay = () => {
    globalAudioEngine.togglePlay();
  };

  const handleBgmVolumeChange = (vol: number) => {
    setBgmVolume(vol);
    globalAudioEngine.setScoreVolume(vol);
  };

  const handleAudioUploaded = (filename: string) => {
    setHasCustomAudio(true);
    setCustomAudioName(filename);
  };

  const handleAudioRemoved = () => {
    globalAudioEngine.removeCustomAudio();
    setHasCustomAudio(false);
    setCustomAudioName(null);
  };

  const currentLine = DIALOGUE_TIMELINE.find(
    l => currentTime >= l.start && currentTime < l.end
  ) || DIALOGUE_TIMELINE[0];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      {/* Universal 3-Zone Top Bar Contract */}
      <header className="h-16 px-6 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-50">
        {/* Zone 1: Single text wordmark */}
        <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="font-serif italic text-amber-400">The Mentor</span>
          <span className="text-stone-600 font-mono text-xs">/</span>
          <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">9:16 Reel Studio</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-400">
          <button 
            onClick={() => setActiveTab('timeline')} 
            className={`transition-colors hover:text-white pb-0.5 ${activeTab === 'timeline' ? 'text-amber-400 border-b border-amber-400' : ''}`}
          >
            Cinematic Timeline
          </button>
          <button 
            onClick={() => setActiveTab('shots')} 
            className={`transition-colors hover:text-white pb-0.5 ${activeTab === 'shots' ? 'text-amber-400 border-b border-amber-400' : ''}`}
          >
            Camera & Characters
          </button>
          <button 
            onClick={() => setActiveTab('script')} 
            className={`transition-colors hover:text-white pb-0.5 ${activeTab === 'script' ? 'text-amber-400 border-b border-amber-400' : ''}`}
          >
            Wealth Advice Script
          </button>
          <button 
            onClick={() => setActiveTab('export')} 
            className={`transition-colors hover:text-white pb-0.5 ${activeTab === 'export' ? 'text-amber-400 border-b border-amber-400' : ''}`}
          >
            Export Video
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('export')}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold transition-all shadow hover:shadow-amber-400/20 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Reel (MP4)</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: 9:16 Reel Player & Instagram Preview (5 Cols on Large screens) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* 9:16 Canvas Phone Frame Container */}
          <div className="relative w-full max-w-[390px] aspect-[9/16] bg-black rounded-3xl p-3 shadow-2xl ring-1 ring-stone-800 shadow-stone-950 flex flex-col overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-stone-900/90 rounded-full z-30 pointer-events-none flex items-center justify-center">
              <div className="w-12 h-1 bg-stone-800 rounded-full" />
            </div>

            {/* Inner 9:16 Screen */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <ReelCanvasPlayer
                currentTime={currentTime}
                isPlaying={isPlaying}
                colorGrade={colorGrade}
                showSubtitles={showSubtitles}
                subtitleStyle={subtitleStyle}
                showSafeZones={showSafeZones}
                filmGrainEnabled={filmGrainEnabled}
                onCanvasReady={(c) => {
                  canvasRef.current = c;
                }}
              />

              {/* Instagram Reel Native Overlay */}
              {showInstagramUi && (
                <ReelInstagramOverlay
                  currentAdviceTopic={currentLine.topicTag}
                  hasCustomAudio={hasCustomAudio}
                />
              )}

              {/* Play/Pause Quick Tap Overlay */}
              <button
                onClick={handleTogglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors group cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110">
                    <Play className="w-8 h-8 fill-current ml-1 text-amber-400" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Quick Player Bar */}
          <div className="w-full max-w-[390px] mt-4 flex items-center justify-between px-2 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInstagramUi(!showInstagramUi)}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                  showInstagramUi 
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-300' 
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                Instagram UI {showInstagramUi ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => setShowSafeZones(!showSafeZones)}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                  showSafeZones 
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' 
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                Safe Zones {showSafeZones ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-stone-300 text-xs">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
              </span>
              <span className="text-stone-600">/</span>
              <span className="font-mono text-stone-500 text-xs">03:30</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Control Studio & Inspector (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Segmented Mode Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-900/90 border border-stone-800 rounded-xl">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                activeTab === 'timeline'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Timeline & Audio
            </button>
            <button
              onClick={() => setActiveTab('shots')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                activeTab === 'shots'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              5 Cinematic Angles
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                activeTab === 'script'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Full Dialogue & Lessons
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                activeTab === 'export'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Export Reel (MP4)
            </button>
          </div>

          {/* Quick Grading & Subtitle Settings Ribbon */}
          <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Color Grade Preset */}
            <div>
              <label className="block text-stone-400 font-medium mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Color Grading LUT</span>
              </label>
              <select
                value={colorGrade}
                onChange={(e) => setColorGrade(e.target.value as ColorGradePreset)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-200 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
              >
                <option value="warm_35mm">Warm 35mm Tungsten (Cinematic)</option>
                <option value="portra_400">Kodak Portra 400 (Natural Skin)</option>
                <option value="golden_hour">Golden Hour Sunset Glow</option>
                <option value="scandinavian_noir">Scandinavian Noir (Muted)</option>
                <option value="natural_doc">Documentary Film (Crisp)</option>
              </select>
            </div>

            {/* Subtitles Style */}
            <div>
              <label className="block text-stone-400 font-medium mb-1.5 flex items-center justify-between">
                <span>Subtitles & Typography</span>
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  {showSubtitles ? 'Hide' : 'Show'}
                </button>
              </label>
              <select
                disabled={!showSubtitles}
                value={subtitleStyle}
                onChange={(e) => setSubtitleStyle(e.target.value as 'bold_yellow' | 'clean_white' | 'gold_serif')}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-200 text-xs focus:ring-1 focus:ring-amber-400 outline-none disabled:opacity-50"
              >
                <option value="bold_yellow">Viral Reel Bold Yellow</option>
                <option value="clean_white">Classic Minimalist White</option>
                <option value="gold_serif">Editorial Gold Serif</option>
              </select>
            </div>

            {/* Texture Effects */}
            <div>
              <label className="block text-stone-400 font-medium mb-1.5">
                Atmospheric Texture
              </label>
              <div className="flex items-center gap-2 h-8">
                <button
                  onClick={() => setFilmGrainEnabled(!filmGrainEnabled)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    filmGrainEnabled
                      ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  35mm Film Grain: {filmGrainEnabled ? 'Active' : 'Off'}
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: Timeline & Audio Inspector */}
          {activeTab === 'timeline' && (
            <div className="h-[520px]">
              <TimelineInspector
                currentTime={currentTime}
                isPlaying={isPlaying}
                onSeek={handleSeek}
                onTogglePlay={handleTogglePlay}
                hasCustomAudio={hasCustomAudio}
                onAudioUploaded={handleAudioUploaded}
                onAudioRemoved={handleAudioRemoved}
                bgmVolume={bgmVolume}
                onBgmVolumeChange={handleBgmVolumeChange}
              />
            </div>
          )}

          {/* TAB 2: 5 Camera Angles & Character Showcase */}
          {activeTab === 'shots' && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 text-stone-200 space-y-4">
              <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                    5 Consistent Photorealistic Camera Setups
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Strict character consistency maintained across all documentary angles in the study.
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-mono">9:16 Vertical</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Angle 1 */}
                <div 
                  onClick={() => handleSeek(0)}
                  className="group bg-stone-950 border border-stone-800 rounded-lg overflow-hidden cursor-pointer hover:border-amber-400/60 transition-all"
                >
                  <div className="aspect-[9/16] relative overflow-hidden bg-stone-900 max-h-48">
                    <img
                      src={SHOT_IMAGES.mentor_closeup}
                      alt="The 70yo Mentor Close-Up"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[10px] font-mono text-amber-300">
                      00:00 - 00:15
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Mentor Intense Close-Up
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                      70yo experienced mentor, natural skin wrinkles, silver gray hair, piercing gaze and wisdom.
                    </p>
                  </div>
                </div>

                {/* Angle 2 */}
                <div 
                  onClick={() => handleSeek(23)}
                  className="group bg-stone-950 border border-stone-800 rounded-lg overflow-hidden cursor-pointer hover:border-amber-400/60 transition-all"
                >
                  <div className="aspect-[9/16] relative overflow-hidden bg-stone-900 max-h-48">
                    <img
                      src={SHOT_IMAGES.young_man_reaction}
                      alt="Young Man Reaction"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[10px] font-mono text-emerald-300">
                      00:23 - 00:27
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Young Man Listening
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                      Early 20s, thoughtful, respectful posture, contemplative eye contact, taking in the advice.
                    </p>
                  </div>
                </div>

                {/* Angle 3 */}
                <div 
                  onClick={() => handleSeek(7.5)}
                  className="group bg-stone-950 border border-stone-800 rounded-lg overflow-hidden cursor-pointer hover:border-amber-400/60 transition-all"
                >
                  <div className="aspect-[9/16] relative overflow-hidden bg-stone-900 max-h-48">
                    <img
                      src={SHOT_IMAGES.over_shoulder}
                      alt="Over The Shoulder"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[10px] font-mono text-sky-300">
                      00:07 - 00:11
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      Over-The-Shoulder Depth
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                      Framed behind young man's shoulder, warm afternoon light streaming through study window.
                    </p>
                  </div>
                </div>

                {/* Angle 4 */}
                <div 
                  onClick={() => handleSeek(11.5)}
                  className="group bg-stone-950 border border-stone-800 rounded-lg overflow-hidden cursor-pointer hover:border-amber-400/60 transition-all"
                >
                  <div className="aspect-[9/16] relative overflow-hidden bg-stone-900 max-h-48">
                    <img
                      src={SHOT_IMAGES.two_shot}
                      alt="Medium Two-Shot"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[10px] font-mono text-indigo-300">
                      00:11 - 00:16
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Medium Two-Shot Desk
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                      Intimate private study, wooden table, ceramic tea mug, books on background shelves.
                    </p>
                  </div>
                </div>

                {/* Angle 5 */}
                <div 
                  onClick={() => handleSeek(63)}
                  className="group bg-stone-950 border border-stone-800 rounded-lg overflow-hidden cursor-pointer hover:border-amber-400/60 transition-all"
                >
                  <div className="aspect-[9/16] relative overflow-hidden bg-stone-900 max-h-48">
                    <img
                      src={SHOT_IMAGES.mentor_hands}
                      alt="Mentor Weathered Hands"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[10px] font-mono text-rose-300">
                      01:03 - 01:09
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                      Weathered Hands Gesture
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                      Gentle, calm hand gesture beside the tea mug, emphasizing patience and 'not yet'.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Full Dialogue & Wealth Lessons */}
          {activeTab === 'script' && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 text-stone-200 space-y-4 max-h-[560px] overflow-y-auto">
              <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                    The 7 Principles of Real Wealth
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Grounded life & financial advice transcribed word-for-word from the original voice recording.
                  </p>
                </div>
                <span className="text-xs text-amber-400">Word-for-Word Match</span>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                {/* Principle 1 */}
                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>1. The Core Definition of Getting Rich (00:00 - 00:15)</span>
                    <button onClick={() => handleSeek(0)} className="underline hover:text-white">Jump</button>
                  </div>
                  <p className="text-stone-300">
                    "Getting rich is not about how much money you make. It's about what you do with the money that comes into your hands. I thought success meant having a big salary, an expensive car, and a house people would admire. I was wrong."
                  </p>
                </div>

                {/* Principle 2 */}
                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>2. The 3 Jobs of Money & False Status (00:19 - 00:37)</span>
                    <button onClick={() => handleSeek(19)} className="underline hover:text-white">Jump</button>
                  </div>
                  <p className="text-stone-300">
                    "Money has only three jobs: spend it, save it, or make it work for you. Don't spend your money just to look successful. A new phone can impress people for a week, a nice car for a month, but having money invested and growing quietly can change your entire life."
                  </p>
                </div>

                {/* Principle 3 */}
                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>3. The 1,000 Shillings Rule (00:37 - 00:51)</span>
                    <button onClick={() => handleSeek(37)} className="underline hover:text-white">Jump</button>
                  </div>
                  <p className="text-stone-300">
                    "Don't wait until you have a lot of money before you start investing. If you can't manage 1,000 shillings wisely, having 100,000 won't magically make you disciplined."
                  </p>
                </div>

                {/* Principle 4 */}
                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>4. The Five Fundamentals & Saying "Not Yet" (00:51 - 01:08)</span>
                    <button onClick={() => handleSeek(51)} className="underline hover:text-white">Jump</button>
                  </div>
                  <p className="text-stone-300">
                    "Learn to save. Learn to invest. Learn how businesses make money. Learn how stocks work. Learn how to increase your income. And most importantly, learn to delay pleasure. Sometimes the smartest financial decision is saying, 'not yet'."
                  </p>
                </div>

                {/* Principle 5 */}
                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>5. Life Balance & Protecting Family (01:08 - 01:31)</span>
                    <button onClick={() => handleSeek(68)} className="underline hover:text-white">Jump</button>
                  </div>
                  <p className="text-stone-300">
                    "Don't become obsessed with saving so much that you forget to live. Money is a tool, not the purpose of your life. Take care of yourself, help your family when you can, and enjoy the things that genuinely matter."
                  </p>
                </div>

                {/* Principle 6 */}
                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>6. Multiple Income Layers & Avoiding Scams (01:31 - 02:08)</span>
                    <button onClick={() => handleSeek(93)} className="underline hover:text-white">Jump</button>
                  </div>
                  <p className="text-stone-300">
                    "Never depend on only one source of income: job pays bills, business increases income, investments build wealth, skills give opportunities nobody can take away. Real wealth is usually boring. It grows through patience, discipline, knowledge, consistency, and time."
                  </p>
                </div>

                {/* Principle 7 */}
                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>7. The Youth Advantage: Time (02:08 - 03:30)</span>
                    <button onClick={() => handleSeek(154)} className="underline hover:text-white">Jump</button>
                  </div>
                  <p className="text-stone-300">
                    "The greatest financial advantage you can have when you're young isn't a huge bank account. It is time. Time to learn, time to make mistakes, time to recover, and time to invest. The money wasn't built in one day; the person who knew how to build it was."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Video Exporter */}
          {activeTab === 'export' && (
            <VideoExporter
              canvasRef={canvasRef}
            />
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-800/80 bg-stone-950 py-4 px-6 text-center text-xs text-stone-500">
        <p>
          Photorealistic 9:16 Cinematic Instagram Reel Studio · Original Voice Synchronization · 1080×1920 MP4 Video Exporter
        </p>
      </footer>
    </div>
  );
}
