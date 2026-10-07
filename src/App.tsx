/**
 * Main Application: 9:16 Instagram Reel Generator & Cinematic Player
 * "The Mentor's Wealth Advice" - 46 Synchronized Storyboard Cuts
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  Download, 
  Layers, 
  Camera, 
  Flame,
  Smartphone,
  Tv,
  CheckCircle2,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { ReelCanvasPlayer, ColorGradePreset } from './components/ReelCanvasPlayer';
import { ReelInstagramOverlay } from './components/ReelInstagramOverlay';
import { TimelineInspector } from './components/TimelineInspector';
import { VideoExporter, ExportFormat } from './components/VideoExporter';
import { AvelixaGenerator } from './components/AvelixaGenerator';
import { globalAudioEngine } from './utils/audioEngine';
import { 
  DIALOGUE_TIMELINE, 
  SHORT_TIMELINE, 
  SHOT_IMAGES, 
  TOTAL_DURATION, 
  SHORT_DURATION, 
  StoryboardImageKey 
} from './data/dialogueTimeline';

export type VideoProjectMode = 'mentor_advice' | 'avelixa_social';

export default function App() {
  const [projectMode, setProjectMode] = useState<VideoProjectMode>('mentor_advice');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('reels_tiktok');
  const [colorGrade, setColorGrade] = useState<ColorGradePreset>('warm_35mm');
  const [showInstagramUi, setShowInstagramUi] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [filmGrainEnabled, setFilmGrainEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'export' | 'shots' | 'script'>('export');

  const isShort = activeFormat === 'youtube_short';
  const isLandscape = activeFormat === 'youtube_horizontal';
  const activeDuration = isShort ? SHORT_DURATION : TOTAL_DURATION;
  const activeTimeline = isShort ? SHORT_TIMELINE : DIALOGUE_TIMELINE;

  // Sync with audio engine
  useEffect(() => {
    globalAudioEngine.setMaxDuration(activeDuration);
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
  }, [activeDuration]);

  const handleSelectFormat = (fmt: ExportFormat) => {
    setActiveFormat(fmt);
    const newDuration = fmt === 'youtube_short' ? SHORT_DURATION : TOTAL_DURATION;
    globalAudioEngine.setMaxDuration(newDuration);
    if (currentTime > newDuration) {
      globalAudioEngine.seek(0);
      setCurrentTime(0);
    }
  };

  const handleSeek = (time: number) => {
    globalAudioEngine.seek(time);
    setCurrentTime(time);
  };

  const handleTogglePlay = () => {
    globalAudioEngine.togglePlay();
  };

  const currentLine = activeTimeline.find(
    l => currentTime >= l.start && currentTime < l.end
  ) || activeTimeline[0];

  const storyboardCards: { key: StoryboardImageKey; title: string; desc: string; firstTime: number }[] = [
    { key: 'mentor_closeup', title: 'Mentor Close-Up', desc: '70yo wise mentor, weathered features, sincere direct eye contact', firstTime: 0 },
    { key: 'over_shoulder', title: 'Over The Shoulder', desc: 'Over young man’s shoulder toward mentor speaking across study desk', firstTime: 2 },
    { key: 'young_man_reaction', title: 'Young Man Listening', desc: 'Attentive early-20s young man absorbing guidance with deep reflection', firstTime: 42 },
    { key: 'two_shot', title: 'Two-Shot Study Desk', desc: 'Both men seated opposite each other in quiet domestic study', firstTime: 11.5 },
    { key: 'mentor_hands', title: 'Weathered Hands Detail', desc: 'Calm hands gesturing beside ceramic tea mug and notebook: "not yet"', firstTime: 7.5 },
    { key: 'coins_savings', title: 'Coins & Shillings Ledger', desc: 'Paper shillings and coin stacks beside leather savings journal', firstTime: 19 },
    { key: 'young_man_notes', title: 'Writing Notes in Journal', desc: 'Young man intently penning financial principles into his journal', firstTime: 23 },
    { key: 'patience_plant', title: 'Quiet Growth Sapling', desc: 'Green plant growing on sunlit windowsill: compounding patience', firstTime: 32 },
    { key: 'stocks_chart', title: 'Stocks & Candlestick Charts', desc: 'Handwritten stock market charts, graphs, and fountain pen on desk', firstTime: 53.5 },
    { key: 'business_plans', title: 'Business Workshop Plans', desc: 'Business blueprints, measuring calipers, and enterprise drafts', firstTime: 55.5 },
    { key: 'multiple_income', title: 'Multiple Income Streams', desc: 'Work desk with multiple project ledgers, tools, and income logs', firstTime: 60 },
    { key: 'mentor_smile', title: 'Mentor Warm Smile', desc: 'Kind grandfatherly smile, encouraging yearly progress and life balance', firstTime: 75 },
    { key: 'family_bookshelf', title: 'Family & Grounded Living', desc: 'Warm framed family portrait on oak bookshelf beside vintage books', firstTime: 85 },
    { key: 'avoid_scams', title: 'Contract Scrutiny', desc: 'Magnifying glass examining small print on contracts: skepticism', firstTime: 124 },
    { key: 'hourglass_time', title: 'Hourglass & Value of Time', desc: 'Antique brass hourglass with golden sand trickling: time is wealth', firstTime: 161 },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-6 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-amber-400 font-bold text-base sm:text-lg">AI Video Studio</span>
            <span className="text-stone-600 font-mono text-xs">/</span>
          </div>

          {/* Project Workflow Selector (Mentor vs Avelixa) */}
          <div className="flex items-center bg-stone-900 border border-stone-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setProjectMode('mentor_advice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                projectMode === 'mentor_advice'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>The Mentor (3 Versions)</span>
            </button>
            <button
              onClick={() => setProjectMode('avelixa_social')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                projectMode === 'avelixa_social'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-300" />
              <span className="flex items-center gap-1">
                <span>Avelixa Video</span>
                <span className="px-1.5 py-0.2 bg-blue-500/30 text-[9px] uppercase tracking-wider rounded font-black">
                  New
                </span>
              </span>
            </button>
          </div>

          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider hidden xl:inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Visuals Only · Zero Audio
          </span>
        </div>

        {/* Navigation Tabs (For Mentor Mode) */}
        {projectMode === 'mentor_advice' ? (
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-stone-400">
            <button 
              onClick={() => setActiveTab('export')} 
              className={`transition-colors hover:text-white pb-0.5 flex items-center gap-1.5 ${activeTab === 'export' ? 'text-amber-400 border-b border-amber-400 font-bold' : ''}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate 3 Versions</span>
            </button>
            <button 
              onClick={() => setActiveTab('timeline')} 
              className={`transition-colors hover:text-white pb-0.5 ${activeTab === 'timeline' ? 'text-amber-400 border-b border-amber-400' : ''}`}
            >
              Visual Cuts ({activeTimeline.length})
            </button>
            <button 
              onClick={() => setActiveTab('shots')} 
              className={`transition-colors hover:text-white pb-0.5 ${activeTab === 'shots' ? 'text-amber-400 border-b border-amber-400' : ''}`}
            >
              15 Image Assets
            </button>
            <button 
              onClick={() => setActiveTab('script')} 
              className={`transition-colors hover:text-white pb-0.5 ${activeTab === 'script' ? 'text-amber-400 border-b border-amber-400' : ''}`}
            >
              Dialogue Script
            </button>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400">
            <span className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300">
              Company: <strong className="text-white">Avelixa</strong>
            </span>
            <span className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300">
              Topic: <strong className="text-blue-400">3 Mistakes Small Businesses Make Online</strong>
            </span>
          </div>
        )}

        {/* Right CTA Button */}
        <div className="flex items-center gap-2">
          {projectMode === 'mentor_advice' ? (
            <button
              onClick={() => setActiveTab('export')}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold transition-all shadow hover:shadow-amber-400/20 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Videos</span>
            </button>
          ) : (
            <button
              onClick={() => setProjectMode('mentor_advice')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <span>← Mentor Studio</span>
            </button>
          )}
        </div>
      </header>

      {/* Conditionally Render Active Generator */}
      {projectMode === 'avelixa_social' ? (
        <AvelixaGenerator onBackToMentorStudio={() => setProjectMode('mentor_advice')} />
      ) : (
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Player & Preview Frame */}
        <div className={`flex flex-col items-center transition-all ${isLandscape ? 'lg:col-span-6' : 'lg:col-span-5'}`}>
          
          {/* Format Quick Selector Banner */}
          <div className="w-full max-w-[440px] mb-3 bg-stone-900 border border-stone-800 rounded-xl p-1 flex items-center justify-between text-xs">
            <button
              onClick={() => handleSelectFormat('youtube_short')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center font-semibold transition-all flex items-center justify-center gap-1 text-[11px] ${
                activeFormat === 'youtube_short'
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>V1 Short (40s)</span>
            </button>
            <button
              onClick={() => handleSelectFormat('reels_tiktok')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center font-semibold transition-all flex items-center justify-center gap-1 text-[11px] ${
                activeFormat === 'reels_tiktok'
                  ? 'bg-amber-400 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>V2 Reels (3:30)</span>
            </button>
            <button
              onClick={() => handleSelectFormat('youtube_horizontal')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center font-semibold transition-all flex items-center justify-center gap-1 text-[11px] ${
                activeFormat === 'youtube_horizontal'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>V3 16:9 (3:30)</span>
            </button>
          </div>

          {/* Canvas Screen Container: 9:16 Phone or 16:9 Cinema Monitor */}
          {isLandscape ? (
            /* 16:9 Horizontal Monitor Frame */
            <div className="relative w-full max-w-[560px] aspect-[16/9] bg-stone-900 rounded-2xl p-2 shadow-2xl ring-1 ring-stone-800 shadow-stone-950 flex flex-col overflow-hidden">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <ReelCanvasPlayer
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  colorGrade={colorGrade}
                  aspectRatio="16:9"
                  timelineMode="full"
                  showSafeZones={showSafeZones}
                  filmGrainEnabled={filmGrainEnabled}
                />

                {/* 16:9 Widescreen Framing Badge */}
                <div className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[10px] font-mono text-sky-300 border border-sky-400/30">
                  1920×1080 Landscape · Full 16:9
                </div>

                {/* Play/Pause Quick Tap */}
                <button
                  onClick={handleTogglePlay}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors group cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {!isPlaying && (
                    <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110">
                      <Play className="w-7 h-7 fill-current ml-0.5 text-amber-400" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* 9:16 Canvas Phone Frame */
            <div className="relative w-full max-w-[380px] aspect-[9/16] bg-black rounded-3xl p-3 shadow-2xl ring-1 ring-stone-800 shadow-stone-950 flex flex-col overflow-hidden">
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
                  aspectRatio="9:16"
                  timelineMode={isShort ? 'short' : 'full'}
                  showSafeZones={showSafeZones}
                  filmGrainEnabled={filmGrainEnabled}
                />

                {/* Instagram Reel Preview Overlay (simulated UI, not on canvas) */}
                {showInstagramUi && !isShort && (
                  <ReelInstagramOverlay
                    currentAdviceTopic={currentLine.topicTag}
                    hasCustomAudio={false}
                  />
                )}

                {/* YouTube Short Badge */}
                {isShort && (
                  <div className="absolute top-8 left-3 z-20 px-2 py-0.5 bg-rose-500/80 backdrop-blur-xs rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    YouTube Short (40s)
                  </div>
                )}

                {/* Play/Pause Quick Tap */}
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
          )}

          {/* Player controls ribbon */}
          <div className="w-full max-w-[440px] mt-3 flex items-center justify-between px-2 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              {!isLandscape && !isShort && (
                <button
                  onClick={() => setShowInstagramUi(!showInstagramUi)}
                  className={`px-2 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                    showInstagramUi 
                      ? 'bg-amber-400/10 border-amber-400/40 text-amber-300' 
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  UI Preview {showInstagramUi ? 'On' : 'Off'}
                </button>
              )}
              <button
                onClick={() => setShowSafeZones(!showSafeZones)}
                className={`px-2 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                  showSafeZones 
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' 
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                Safe Zones {showSafeZones ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-amber-400 font-bold">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
              </span>
              <span className="text-stone-600">/</span>
              <span className="text-stone-400">
                {Math.floor(activeDuration / 60)}:{(Math.floor(activeDuration % 60)).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Control Studio & Inspector */}
        <div className={`flex flex-col space-y-4 ${isLandscape ? 'lg:col-span-6' : 'lg:col-span-7'}`}>
          
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-900/90 border border-stone-800 rounded-xl">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                activeTab === 'export'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Download Videos (3 Versions)
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                activeTab === 'timeline'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Storyboard Cuts ({activeTimeline.length})
            </button>
            <button
              onClick={() => setActiveTab('shots')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                activeTab === 'shots'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              15 Storyboard Photos
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center ${
                activeTab === 'script'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Dialogue & Topics
            </button>
          </div>

          {/* Color Grade & Atmosphere Ribbon */}
          <div className="p-3.5 bg-stone-900/60 border border-stone-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-stone-400 font-medium mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cinematic Grading Preset</span>
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

            <div>
              <label className="block text-stone-400 font-medium mb-1.5">
                35mm Film Grain Overlay
              </label>
              <button
                onClick={() => setFilmGrainEnabled(!filmGrainEnabled)}
                className={`w-full py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors text-center ${
                  filmGrainEnabled
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                    : 'bg-stone-800 border-stone-700 text-stone-400'
                }`}
              >
                Film Grain: {filmGrainEnabled ? 'Active (Subtle 35mm)' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* TAB 1: 3 Dedicated Video Versions Exporter */}
          {activeTab === 'export' && (
            <VideoExporter 
              activePreviewFormat={activeFormat}
              onSelectPreviewFormat={handleSelectFormat}
            />
          )}

          {/* TAB 2: Storyboard Timeline & Shot Inspector */}
          {activeTab === 'timeline' && (
            <div className="h-[540px]">
              <TimelineInspector
                currentTime={currentTime}
                isPlaying={isPlaying}
                onSeek={handleSeek}
                onTogglePlay={handleTogglePlay}
                activeFormat={activeFormat}
                onSelectFormat={handleSelectFormat}
              />
            </div>
          )}

          {/* TAB 3: 15 Photorealistic Assets Showcase */}
          {activeTab === 'shots' && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 text-stone-200 space-y-4 max-h-[560px] overflow-y-auto">
              <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                    15 Synchronized Photorealistic Storyboard Assets
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Click any image to jump directly to its appearance on the timeline.
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-mono">1080×1920 & 1920×1080</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {storyboardCards.map((card) => (
                  <div 
                    key={card.key}
                    onClick={() => handleSeek(card.firstTime)}
                    className="group bg-stone-950 border border-stone-800 rounded-lg overflow-hidden cursor-pointer hover:border-amber-400/60 transition-all"
                  >
                    <div className="aspect-[9/16] relative overflow-hidden bg-stone-900 max-h-44">
                      <img
                        src={SHOT_IMAGES[card.key]}
                        alt={card.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/75 backdrop-blur-xs rounded text-[10px] font-mono text-amber-300">
                        {Math.floor(card.firstTime / 60)}:{(Math.floor(card.firstTime % 60)).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {card.title}
                      </h4>
                      <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Full Dialogue & Wealth Lessons */}
          {activeTab === 'script' && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 text-stone-200 space-y-4 max-h-[560px] overflow-y-auto">
              <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                    The 7 Principles of Grounded Wealth
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Original voice recording transcribed sentence-for-sentence across the complete 210-second timeline.
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-mono">03:30 Full Master</span>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed">
                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>1. Wealth Definition (00:00 – 00:19)</span>
                    <button onClick={() => handleSeek(0)} className="underline hover:text-white">Jump to 00:00</button>
                  </div>
                  <p className="text-stone-300">
                    "Getting rich is not about how much money you make. It's about what you do with the money that comes into your hands. When I was your age, I thought success meant having a big salary, an expensive car, and a house people would admire. I was wrong."
                  </p>
                </div>

                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>2. The Three Jobs of Money (00:19 – 00:37)</span>
                    <button onClick={() => handleSeek(19)} className="underline hover:text-white">Jump to 00:19</button>
                  </div>
                  <p className="text-stone-300">
                    "Money has only three jobs: spend it, save it, or make it work for you. Don't spend your money just to look successful. A new phone can impress people for a week, a nice car for a month, but having money invested and growing quietly can change your entire life."
                  </p>
                </div>

                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>3. The 1,000 Shillings Rule (00:37 – 00:51)</span>
                    <button onClick={() => handleSeek(37)} className="underline hover:text-white">Jump to 00:37</button>
                  </div>
                  <p className="text-stone-300">
                    "Don't wait until you have a lot of money before you start investing. Start learning while the amount is still small. If you cannot manage 1,000 shillings wisely, having 100,000 won't magically make you disciplined."
                  </p>
                </div>

                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>4. The Five Fundamentals & Saying "Not Yet" (00:51 – 01:15)</span>
                    <button onClick={() => handleSeek(51)} className="underline hover:text-white">Jump to 00:51</button>
                  </div>
                  <p className="text-stone-300">
                    "Learn to save. Learn to invest. Learn how businesses make money. Learn how stocks work. Learn how to increase your income. And most importantly, learn to delay pleasure. Sometimes the smartest financial decision is saying, 'not yet'."
                  </p>
                </div>

                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>5. Life Balance & Protecting Family (01:15 – 01:33)</span>
                    <button onClick={() => handleSeek(75)} className="underline hover:text-white">Jump to 01:15</button>
                  </div>
                  <p className="text-stone-300">
                    "Don't become obsessed with saving so much that you forget to live. Money is a tool, not the purpose of your life. Take care of yourself. Help your family when you can. Enjoy the things that genuinely matter."
                  </p>
                </div>

                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>6. Multiple Income Layers & Scrutiny (01:33 – 02:08)</span>
                    <button onClick={() => handleSeek(93)} className="underline hover:text-white">Jump to 01:33</button>
                  </div>
                  <p className="text-stone-300">
                    "Never depend on only one source of income if you can build another. Job pays bills, business increases income, investments build wealth, skills give opportunities nobody can take away. Stay away from shortcuts that promise easy money with zero risk."
                  </p>
                </div>

                <div className="p-3 bg-stone-950/60 border border-stone-800 rounded-lg">
                  <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
                    <span>7. The Greatest Advantage: Time (02:08 – 03:30)</span>
                    <button onClick={() => handleSeek(154)} className="underline hover:text-white">Jump to 02:08</button>
                  </div>
                  <p className="text-stone-300">
                    "The greatest financial advantage you can have when you're young isn't a huge bank account. It is time. Time to learn, time to make mistakes, time to recover, and time to invest. The money wasn't built in one day; the person who knew how to build it was."
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-800/80 bg-stone-950 py-4 px-6 text-center text-xs text-stone-500">
        <p>
          {projectMode === 'avelixa_social' 
            ? 'Avelixa Social Video Generator · 9:16 Vertical (1080×1920) & 16:9 Landscape (1920×1080) · 40s · Visuals Only' 
            : 'The Mentor Studio · Version 1: Short (40s) · Version 2: Reels/TikTok (3m 30s) · Version 3: YouTube (3m 30s) · Visuals Only'}
        </p>
      </footer>
    </div>
  );
}

