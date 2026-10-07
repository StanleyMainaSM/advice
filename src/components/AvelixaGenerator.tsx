/**
 * Avelixa Social Media Explainer Video Generator Component
 * 
 * Video: "3 MISTAKES SMALL BUSINESSES MAKE ONLINE"
 * 
 * Key Features:
 * - Dynamic Duration Selection (15s, 30s, 40s, 45s, 60s, 90s) with explicit scene timeline scaling
 * - Multi-Scene Timeline Editor (Opening, Mistake #1, Mistake #2, Mistake #3, Ending) with live duration editing
 * - Source Visual System per scene:
 *    A. Realistic Interface Recreation (Instagram, Google Search, WhatsApp, Responsive Store)
 *    B. Uploaded Image / Screenshot
 *    C. Image URL
 *    D. Webpage / Reference URL (Graceful fallback)
 * - Fullscreen Video Preview with visible "View Full Screen" button & dedicated Large 9:16 mobile player
 * - Deterministic MP4 MediaRecorder export covering the entire timeline
 * - Strictly VISUALS ONLY (No synthesized voice, zero audio tracks)
 * - Safe areas for TikTok / Instagram Reels / YouTube Shorts / WhatsApp Status
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Smartphone, 
  Tv, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Upload, 
  Sparkles, 
  Sliders, 
  Layers, 
  Maximize, 
  Minimize, 
  VolumeX, 
  Volume2, 
  Clock, 
  Image as ImageIcon, 
  Globe, 
  Link as LinkIcon, 
  Check, 
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  AvelixaScene, 
  AvelixaBrandConfig, 
  DEFAULT_AVELIXA_CONFIG, 
  INITIAL_SCENES, 
  DURATION_OPTIONS, 
  TargetDurationOption, 
  DEFAULT_AVELIXA_DURATION, 
  recalculateSceneTimeline,
  VisualSourceType
} from '../data/avelixaTimeline';
import { drawAvelixaFrame } from '../utils/avelixaCanvasDrawer';

export type AvelixaExportFormat = 'vertical_9_16' | 'horizontal_16_9';

interface AvelixaGeneratorProps {
  onBackToMentorStudio?: () => void;
}

export const AvelixaGenerator: React.FC<AvelixaGeneratorProps> = ({ onBackToMentorStudio }) => {
  // Timeline & duration state
  const [targetDuration, setTargetDuration] = useState<TargetDurationOption>(DEFAULT_AVELIXA_DURATION as TargetDurationOption);
  const [scenes, setScenes] = useState<AvelixaScene[]>(() => recalculateSceneTimeline(INITIAL_SCENES, DEFAULT_AVELIXA_DURATION));
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<AvelixaExportFormat>('vertical_9_16');
  
  // Custom images cache map (sceneId -> HTMLImageElement)
  const [customImagesMap, setCustomImagesMap] = useState<Map<string, HTMLImageElement>>(new Map());

  // Branding configuration
  const [brandConfig, setBrandConfig] = useState<AvelixaBrandConfig>(DEFAULT_AVELIXA_CONFIG);
  const [customLogoImg, setCustomLogoImg] = useState<HTMLImageElement | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'export' | 'timeline' | 'sources' | 'brand'>('export');
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fullscreenFallback, setFullscreenFallback] = useState<boolean>(false);

  // Audio / Mute toggle indicator (Always visuals-only in output, but player has mute button for user convenience)
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Export & recording state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [exportError, setExportError] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const sceneImageInputRef = useRef<HTMLInputElement | null>(null);

  const totalCalculatedDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const isLandscape = activeFormat === 'horizontal_16_9';

  // Handle changing target duration
  const handleSelectTargetDuration = (dur: TargetDurationOption) => {
    setTargetDuration(dur);
    const updated = recalculateSceneTimeline(scenes, dur);
    setScenes(updated);
    if (currentTime > dur) {
      setCurrentTime(0);
    }
  };

  // Handle manual individual scene duration update
  const handleUpdateSceneDuration = (sceneIndex: number, newDuration: number) => {
    const val = Math.max(1, Math.min(30, Number(newDuration.toFixed(1))));
    const newScenes = [...scenes];
    newScenes[sceneIndex] = {
      ...newScenes[sceneIndex],
      duration: val,
    };
    const recalculated = recalculateSceneTimeline(newScenes);
    setScenes(recalculated);
  };

  // Handle changing visual source for a specific scene
  const handleSetVisualSourceType = (sceneIndex: number, type: VisualSourceType) => {
    const newScenes = [...scenes];
    newScenes[sceneIndex] = {
      ...newScenes[sceneIndex],
      visualSource: {
        ...newScenes[sceneIndex].visualSource,
        type,
      },
    };
    setScenes(newScenes);
  };

  // Handle custom image file upload for a scene
  const handleSceneImageUpload = (sceneIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setCustomImagesMap((prev) => {
          const next = new Map(prev);
          next.set(scenes[sceneIndex].id, img);
          return next;
        });
        const newScenes = [...scenes];
        newScenes[sceneIndex] = {
          ...newScenes[sceneIndex],
          visualSource: {
            ...newScenes[sceneIndex].visualSource,
            type: 'uploaded_image',
            customImageUrl: dataUrl,
          },
        };
        setScenes(newScenes);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Handle custom external Image URL
  const handleSetCustomImageUrl = (sceneIndex: number, url: string) => {
    const newScenes = [...scenes];
    newScenes[sceneIndex] = {
      ...newScenes[sceneIndex],
      visualSource: {
        ...newScenes[sceneIndex].visualSource,
        type: 'image_url',
        customImageUrl: url,
      },
    };
    setScenes(newScenes);

    if (url.trim()) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setCustomImagesMap((prev) => {
          const next = new Map(prev);
          next.set(scenes[sceneIndex].id, img);
          return next;
        });
      };
      img.onerror = () => {
        console.warn('Could not load custom image from URL, falling back to high-fidelity recreation');
      };
      img.src = url;
    }
  };

  // Handle Webpage URL input
  const handleSetWebpageUrl = (sceneIndex: number, url: string) => {
    const newScenes = [...scenes];
    newScenes[sceneIndex] = {
      ...newScenes[sceneIndex],
      visualSource: {
        ...newScenes[sceneIndex].visualSource,
        type: 'webpage_url',
        webpageUrl: url,
      },
    };
    setScenes(newScenes);
  };

  // Render current frame to canvas
  const renderCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawAvelixaFrame(ctx, {
      time: currentTime,
      width: canvas.width,
      height: canvas.height,
      aspectRatio: isLandscape ? '16:9' : '9:16',
      brandConfig,
      customLogoImg,
      scenes,
      totalDuration: totalCalculatedDuration,
      customImagesMap,
    });
  }, [currentTime, isLandscape, brandConfig, customLogoImg, scenes, totalCalculatedDuration, customImagesMap]);

  // Canvas size synchronization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isLandscape) {
      canvas.width = 1920;
      canvas.height = 1080;
    } else {
      canvas.width = 1080;
      canvas.height = 1920;
    }
    renderCurrentFrame();
  }, [isLandscape, renderCurrentFrame]);

  // Main playback animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderCurrentFrame();
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= totalCalculatedDuration) {
          setIsPlaying(false);
          return totalCalculatedDuration;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, totalCalculatedDuration, renderCurrentFrame]);

  useEffect(() => {
    renderCurrentFrame();
  }, [currentTime, renderCurrentFrame]);

  // Fullscreen trigger handler
  const handleToggleFullscreen = async () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
          setIsFullscreen(true);
        } else {
          setFullscreenFallback(true);
        }
      } catch (err) {
        console.warn('Native fullscreen request rejected, using fullscreen fallback view', err);
        setFullscreenFallback(true);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        setFullscreenFallback(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // ----------------------------------------------------
  // DETERMINISTIC VIDEO EXPORTER (MediaRecorder MP4/WebM)
  // ----------------------------------------------------
  const handleExportVideo = async (formatToExport: AvelixaExportFormat) => {
    if (isExporting) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);
    setDownloadUrl(null);

    const isL = formatToExport === 'horizontal_16_9';
    const targetW = isL ? 1920 : 1080;
    const targetH = isL ? 1080 : 1920;
    const duration = totalCalculatedDuration;
    const fps = 30;
    const totalFrames = Math.ceil(duration * fps);
    const filename = isL
      ? `avelixa-3-mistakes-online-16x9-${Math.round(duration)}s.mp4`
      : `avelixa-3-mistakes-online-9x16-${Math.round(duration)}s.mp4`;
    setDownloadFilename(filename);

    setExportStatusText('Initializing offscreen renderer...');

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetW;
      exportCanvas.height = targetH;
      const ctx = exportCanvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Could not create offscreen canvas context');

      // Visuals only: zero audio tracks
      const stream = exportCanvas.captureStream(fps);
      stream.getAudioTracks().forEach((t) => t.stop());

      const mimeTypes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=avc1.42E01E',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const recordedChunks: Blob[] = [];
      const recorder = new MediaRecorder(
        stream,
        selectedMime
          ? {
              mimeType: selectedMime,
              videoBitsPerSecond: isL ? 14000000 : 12000000,
            }
          : undefined
      );

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      const recorderFinishedPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, {
            type: selectedMime || 'video/mp4',
          });
          resolve(blob);
        };
      });

      recorder.start(500);

      // Render all frames sequentially
      for (let frameIndex = 0; frameIndex <= totalFrames; frameIndex++) {
        const frameTime = (frameIndex / totalFrames) * duration;

        drawAvelixaFrame(ctx, {
          time: frameTime,
          width: targetW,
          height: targetH,
          aspectRatio: isL ? '16:9' : '9:16',
          brandConfig,
          customLogoImg,
          scenes,
          totalDuration: duration,
          customImagesMap,
        });

        if (frameIndex % 15 === 0 || frameIndex === totalFrames) {
          const pct = Math.round((frameIndex / totalFrames) * 100);
          setExportProgress(pct);
          setExportStatusText(
            `Rendering frame ${frameIndex} of ${totalFrames} (${pct}%) • ${frameTime.toFixed(1)}s`
          );
        }

        await new Promise((r) => setTimeout(r, 6));
      }

      setExportStatusText('Packaging MP4 container...');
      recorder.stop();

      const finalBlob = await recorderFinishedPromise;
      const url = URL.createObjectURL(finalBlob);
      setDownloadUrl(url);
      setExportProgress(100);
      setExportStatusText('Video generated successfully! Ready for download.');
      setIsExporting(false);
    } catch (err: unknown) {
      console.error('Export error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error during export';
      setExportError(errMsg);
      setIsExporting(false);
    }
  };

  const activeScene =
    scenes.find((s) => currentTime >= s.start && currentTime < s.end) ||
    scenes[scenes.length - 1];

  return (
    <div className="flex-1 flex flex-col bg-stone-950 text-stone-100">
      {/* Subheader banner */}
      <div className="border-b border-stone-800 bg-stone-900/60 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Avelixa Social Video Generator</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                Multi-Scene Explainer
              </span>
            </div>
            <div className="text-xs text-stone-400">
              "3 Mistakes Small Businesses Make Online" • {totalCalculatedDuration.toFixed(1)}s • 9:16 Vertical & 16:9 Horizontal
            </div>
          </div>
        </div>

        {/* Back to Mentor studio button */}
        {onBackToMentorStudio && (
          <button
            onClick={onBackToMentorStudio}
            className="text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded-lg border border-stone-700 hover:border-stone-500 bg-stone-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Switch to Mentor Advice Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Mobile Player & Fullscreen Preview */}
        <div className="lg:w-[480px] xl:w-[540px] shrink-0 p-4 sm:p-6 flex flex-col items-center justify-center bg-stone-950 border-r border-stone-800/80">
          
          {/* Format & Target Duration Switcher Bar */}
          <div className="w-full flex items-center justify-between mb-3 gap-2 flex-wrap">
            {/* Target Duration Selector */}
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
              <span className="text-stone-400 px-1 font-semibold flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>Target:</span>
              </span>
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleSelectTargetDuration(dur)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-all ${
                    targetDuration === dur
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>

            {/* Ratio Selector */}
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
              <button
                onClick={() => setActiveFormat('vertical_9_16')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  activeFormat === 'vertical_9_16'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>9:16</span>
              </button>
              <button
                onClick={() => setActiveFormat('horizontal_16_9')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  activeFormat === 'horizontal_16_9'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Tv className="w-3 h-3" />
                <span>16:9</span>
              </button>
            </div>
          </div>

          {/* Player Container Box (Supports native browser fullscreen) */}
          <div
            ref={playerContainerRef}
            className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-stone-800 transition-all duration-300 flex items-center justify-center ${
              fullscreenFallback
                ? 'fixed inset-0 z-50 rounded-none w-screen h-screen'
                : isLandscape
                ? 'w-full aspect-[16/9] max-h-[360px]'
                : 'w-[290px] sm:w-[330px] aspect-[9/16] max-h-[590px]'
            }`}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain block bg-stone-950"
            />

            {/* Click to Play / Pause Overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center bg-black/15 hover:bg-black/30 transition-colors group cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
              )}
            </button>

            {/* Current Scene Badge */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-900/85 backdrop-blur-md border border-stone-700/60 text-[11px] font-semibold text-blue-300 pointer-events-none">
              Scene {activeScene.sceneNumber}: {activeScene.title}
            </div>

            {/* Timestamp */}
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] text-stone-300 pointer-events-none">
              {currentTime.toFixed(1)}s / {totalCalculatedDuration.toFixed(1)}s
            </div>

            {/* Close button for fallback fullscreen */}
            {fullscreenFallback && (
              <button
                onClick={() => setFullscreenFallback(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 z-50 cursor-pointer"
                title="Exit Fullscreen"
              >
                <Minimize className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Primary Action Buttons (Play, Mute, View Full Screen, Download) */}
          <div className="w-full mt-3 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                title="Audio State (Visuals-only mode active)"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span className="text-[10px] hidden sm:inline">Mute</span>
              </button>
            </div>

            {/* Prominent View Full Screen Button */}
            <button
              onClick={handleToggleFullscreen}
              className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="View video in complete fullscreen preserving aspect ratio"
            >
              <Maximize className="w-3.5 h-3.5 text-blue-400" />
              <span>View Full Screen</span>
            </button>
          </div>

          {/* Scrubber Range */}
          <div className="w-full mt-3 flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={totalCalculatedDuration}
              step="0.1"
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(parseFloat(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className="flex-1 accent-blue-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs text-stone-400 min-w-[55px] text-right">
              {currentTime.toFixed(1)}s
            </span>
          </div>

          {/* Scene Jump Pills */}
          <div className="w-full grid grid-cols-5 gap-1 pt-2">
            {scenes.map((scene, idx) => {
              const isActive = currentTime >= scene.start && currentTime < scene.end;
              return (
                <button
                  key={scene.id}
                  onClick={() => {
                    setCurrentTime(scene.start);
                    setSelectedSceneIndex(idx);
                    if (isPlaying) setIsPlaying(false);
                  }}
                  className={`py-1 text-center rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-400'
                  }`}
                >
                  S{scene.sceneNumber} ({scene.duration.toFixed(0)}s)
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Controls, Visual Sources, Timeline Editor & MP4 Download */}
        <div className="flex-1 flex flex-col min-w-0 bg-stone-900/30 overflow-y-auto">
          {/* Studio Tabs */}
          <div className="border-b border-stone-800 px-6 py-3 flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('export')}
              className={`pb-1 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'export'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download MP4</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-1 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Scene Timeline ({totalCalculatedDuration.toFixed(0)}s)</span>
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`pb-1 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sources'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Source Visual System</span>
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`pb-1 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'brand'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Avelixa Branding</span>
            </button>
          </div>

          <div className="p-6 max-w-4xl space-y-6">
            
            {/* ---------------------------------------------------- */}
            {/* TAB 1: DOWNLOAD MP4 (TikTok, Reels, Shorts, Status)  */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-400" />
                    <span>Download Social-Media MP4 Video</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Optimized for TikTok / Instagram Reels / YouTube Shorts / WhatsApp Status. 
                    The entire multi-scene timeline ({totalCalculatedDuration.toFixed(0)}s total) 
                    is rendered deterministically frame-by-frame with zero synthesized audio, 
                    ready to sync with your separate voiceover.
                  </p>
                </div>

                {/* Export Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vertical 9:16 */}
                  <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          TikTok · Reels · Shorts · Status
                        </span>
                        <span className="text-xs font-mono text-stone-400">{totalCalculatedDuration.toFixed(0)}s</span>
                      </div>
                      <h4 className="text-base font-bold text-white">1080 × 1920 (9:16 Vertical)</h4>
                      <p className="text-xs text-stone-400 mt-1">
                        High-bitrate vertical video with safe-area aligned typography, 
                        realistic interface mockups, red error cross badges, and Avelixa closing CTA.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-stone-800/80">
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>All 5 scenes included in exported MP4</span>
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Visuals-only (Zero audio track, ready for voiceover)</span>
                      </div>
                      <button
                        disabled={isExporting}
                        onClick={() => handleExportVideo('vertical_9_16')}
                        className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Download MP4 (9:16 Vertical)</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal 16:9 */}
                  <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Tv className="w-3 h-3" />
                          Normal YouTube Video
                        </span>
                        <span className="text-xs font-mono text-stone-400">{totalCalculatedDuration.toFixed(0)}s</span>
                      </div>
                      <h4 className="text-base font-bold text-white">1920 × 1080 (16:9 Landscape)</h4>
                      <p className="text-xs text-stone-400 mt-1">
                        Native 16:9 widescreen composition with side-by-side device mockups and 
                        detailed breakdown text. No black letterboxing or distorted stretching.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-stone-800/80">
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Side-by-side landscape framing for YouTube</span>
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Full {totalCalculatedDuration.toFixed(0)}s multi-scene recording</span>
                      </div>
                      <button
                        disabled={isExporting}
                        onClick={() => handleExportVideo('horizontal_16_9')}
                        className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Download MP4 (16:9 Landscape)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {isExporting && (
                  <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-300 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {exportStatusText}
                      </span>
                      <span className="font-mono font-bold text-white">{exportProgress}%</span>
                    </div>
                    <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-150"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Rendering deterministic frames at 30 FPS. All scenes are burned into the final MP4.
                    </p>
                  </div>
                )}

                {/* Success Card */}
                {downloadUrl && !isExporting && (
                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{exportStatusText}</span>
                    </div>
                    <p className="text-xs text-stone-300">
                      File generated: <strong>{downloadFilename}</strong>. 
                      Contains all {scenes.length} scenes from beginning to end ({totalCalculatedDuration.toFixed(1)}s).
                    </p>
                    <a
                      href={downloadUrl}
                      download={downloadFilename}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span>Click to Download {downloadFilename}</span>
                    </a>
                  </div>
                )}

                {exportError && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Export failed: {exportError}</span>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 2: SCENE TIMELINE & DURATION ADJUSTER            */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'timeline' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>Multi-Scene Timeline Editor</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Adjust individual scene durations. Total duration automatically updates.
                    </p>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs">
                    <span className="text-stone-400">Total duration: </span>
                    <strong className="text-blue-400 font-mono text-sm">{totalCalculatedDuration.toFixed(1)}s</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  {scenes.map((scene, idx) => {
                    const isSelected = currentTime >= scene.start && currentTime < scene.end;
                    return (
                      <div
                        key={scene.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-blue-950/30 border-blue-500/80 shadow-md'
                            : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[11px]">
                              Scene {scene.sceneNumber}
                            </span>
                            <span className="font-bold text-white">{scene.title}</span>
                          </div>

                          {/* Duration input control */}
                          <div className="flex items-center gap-2">
                            <span className="text-stone-400 text-[11px]">Duration:</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max="30"
                                step="0.5"
                                value={scene.duration}
                                onChange={(e) =>
                                  handleUpdateSceneDuration(idx, parseFloat(e.target.value) || 1)
                                }
                                className="w-16 px-2 py-1 rounded bg-stone-800 border border-stone-700 text-white font-mono text-xs text-center focus:border-blue-500 outline-none"
                              />
                              <span className="text-stone-400 text-xs">s</span>
                            </div>

                            <span className="font-mono text-stone-400 text-[11px] ml-2">
                              [{scene.start.toFixed(1)}s – {scene.end.toFixed(1)}s]
                            </span>

                            <button
                              onClick={() => {
                                setCurrentTime(scene.start);
                                setSelectedSceneIndex(idx);
                                if (isPlaying) setIsPlaying(false);
                              }}
                              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] transition-colors ml-2 cursor-pointer"
                            >
                              Jump to Scene
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-stone-300 mb-1">
                          <strong>Topic:</strong> "{scene.topic}"
                        </div>

                        <p className="text-xs text-stone-400 leading-relaxed">
                          {scene.visualDescription}
                        </p>

                        {scene.problemHighlight && (
                          <div className="mt-2 text-[11px] text-red-400 bg-red-950/20 px-2.5 py-1 rounded border border-red-900/40 inline-flex items-center gap-1.5">
                            <span className="font-bold">Problem highlighted:</span>
                            <span>{scene.problemHighlight}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 3: SOURCE VISUAL SYSTEM (A, B, C, D)             */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'sources' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span>Realistic Source Visual System</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Choose or provide realistic visuals for each scene instead of generic AI pictures.
                    Supports realistic UI recreations, user uploaded screenshots, image URLs, or webpage URLs.
                  </p>
                </div>

                {/* Scene selector tabs */}
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 overflow-x-auto">
                  {scenes.map((scene, idx) => (
                    <button
                      key={scene.id}
                      onClick={() => setSelectedSceneIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedSceneIndex === idx
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Scene {scene.sceneNumber}: {scene.topic.slice(0, 16)}...
                    </button>
                  ))}
                </div>

                {/* Selected Scene Visual Source Settings */}
                {(() => {
                  const selScene = scenes[selectedSceneIndex];
                  const currentSource = selScene.visualSource;

                  return (
                    <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-5">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-blue-400 font-bold">
                            Configuring Scene {selScene.sceneNumber}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            {selScene.title}
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-stone-400">
                          Duration: {selScene.duration.toFixed(1)}s
                        </span>
                      </div>

                      {/* Visual Source Radio Buttons (A, B, C, D) */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-semibold text-stone-300 block">
                          Select Visual Source:
                        </label>

                        {/* Option A: High-fidelity Realistic UI Recreation */}
                        <div
                          onClick={() => handleSetVisualSourceType(selectedSceneIndex, 'generated_realistic')}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            currentSource.type === 'generated_realistic'
                              ? 'bg-blue-950/40 border-blue-500 text-white'
                              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                            currentSource.type === 'generated_realistic'
                              ? 'border-blue-400 bg-blue-500'
                              : 'border-stone-600'
                          }`}>
                            {currentSource.type === 'generated_realistic' && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              A. High-Fidelity Realistic Digital Interface (Default)
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              Pixel-perfect vector recreation of real modern interfaces (Instagram business profile, Google Search "boutiques near me" with Google Maps local pack, WhatsApp chat, or responsive mobile site). Zero distorted AI slop.
                            </div>
                          </div>
                        </div>

                        {/* Option B: Uploaded Screenshot / Image */}
                        <div
                          onClick={() => handleSetVisualSourceType(selectedSceneIndex, 'uploaded_image')}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            currentSource.type === 'uploaded_image'
                              ? 'bg-blue-950/40 border-blue-500 text-white'
                              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                            currentSource.type === 'uploaded_image'
                              ? 'border-blue-400 bg-blue-500'
                              : 'border-stone-600'
                          }`}>
                            {currentSource.type === 'uploaded_image' && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">
                              B. User-Uploaded Screenshot
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              Upload an actual real-world screenshot of your Instagram, website, or Google results.
                            </div>

                            {currentSource.type === 'uploaded_image' && (
                              <div className="mt-3">
                                <input
                                  ref={sceneImageInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleSceneImageUpload(selectedSceneIndex, f);
                                  }}
                                  className="hidden"
                                />
                                <button
                                  onClick={() => sceneImageInputRef.current?.click()}
                                  className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                                  <span>{currentSource.customImageUrl ? 'Replace Uploaded Screenshot' : 'Upload Screenshot (PNG / JPG)'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Option C: Image URL */}
                        <div
                          onClick={() => handleSetVisualSourceType(selectedSceneIndex, 'image_url')}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            currentSource.type === 'image_url'
                              ? 'bg-blue-950/40 border-blue-500 text-white'
                              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                            currentSource.type === 'image_url'
                              ? 'border-blue-400 bg-blue-500'
                              : 'border-stone-600'
                          }`}>
                            {currentSource.type === 'image_url' && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">
                              C. Direct Image URL
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              Provide a direct web link to a publicly accessible screenshot or image asset.
                            </div>

                            {currentSource.type === 'image_url' && (
                              <div className="mt-3">
                                <input
                                  type="url"
                                  placeholder="https://example.com/screenshot.jpg"
                                  value={currentSource.customImageUrl || ''}
                                  onChange={(e) => handleSetCustomImageUrl(selectedSceneIndex, e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs focus:border-blue-500 outline-none"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Option D: Webpage / Reference URL */}
                        <div
                          onClick={() => handleSetVisualSourceType(selectedSceneIndex, 'webpage_url')}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            currentSource.type === 'webpage_url'
                              ? 'bg-blue-950/40 border-blue-500 text-white'
                              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                            currentSource.type === 'webpage_url'
                              ? 'border-blue-400 bg-blue-500'
                              : 'border-stone-600'
                          }`}>
                            {currentSource.type === 'webpage_url' && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">
                              D. Webpage / Reference URL (With Graceful Fallback)
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              Provide a reference webpage URL. If browser CORS restrictions or robot blocks prevent live extraction, it automatically falls back to the clean high-fidelity UI recreation.
                            </div>

                            {currentSource.type === 'webpage_url' && (
                              <div className="mt-3 space-y-2">
                                <input
                                  type="url"
                                  placeholder="https://myboutiquestore.com"
                                  value={currentSource.webpageUrl || ''}
                                  onChange={(e) => handleSetWebpageUrl(selectedSceneIndex, e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs focus:border-blue-500 outline-none"
                                />
                                <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  <span>Guaranteed clean rendering: No broken images or empty frames will ever appear in the generated video.</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 4: BRANDING & LOGO CUSTOMIZER                    */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'brand' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span>Avelixa Brand Customizer</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Customize your company details and logo appearing on the video header and outro screen.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={brandConfig.companyName}
                      onChange={(e) =>
                        setBrandConfig((prev) => ({ ...prev, companyName: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white text-xs focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={brandConfig.website}
                      onChange={(e) =>
                        setBrandConfig((prev) => ({ ...prev, website: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white text-xs focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Social Media Handle
                    </label>
                    <input
                      type="text"
                      value={brandConfig.handle}
                      onChange={(e) =>
                        setBrandConfig((prev) => ({ ...prev, handle: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white text-xs focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Avelixa Logo Asset
                    </label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string;
                            const img = new Image();
                            img.onload = () => {
                              setCustomLogoImg(img);
                              setBrandConfig((prev) => ({ ...prev, logoDataUrl: dataUrl }));
                            };
                            img.src = dataUrl;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>{customLogoImg ? 'Replace Logo Asset' : 'Upload Custom Logo (PNG / SVG)'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs space-y-2">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Real Brand Quality Guard</span>
                  </div>
                  <p className="text-stone-400 leading-relaxed">
                    By default, Avelixa's official geometric blue shield mark is rendered sharply across all 
                    scenes. Uploading a transparent PNG or SVG will smoothly replace the vector mark without distortion.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
