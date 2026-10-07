/**
 * Avelixa Video Generator Component
 * Creates and exports "3 Mistakes Small Businesses Make Online" for Avelixa
 * - Vertical 9:16 (1080x1920) primary format (TikTok, Instagram Reels, YouTube Shorts, WhatsApp Status)
 * - Horizontal 16:9 (1920x1080) for normal YouTube
 * - Duration: 40 seconds
 * - VISUALS ONLY (Zero audio synthesis, ready for external voiceover)
 * - Deterministic MediaRecorder export + interactive canvas preview
 * - Custom brand controls (Company name, website, social handle, logo upload)
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
  Globe, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  AVELIXA_SCENES, 
  AVELIXA_TOTAL_DURATION, 
  DEFAULT_AVELIXA_CONFIG, 
  AvelixaBrandConfig, 
  AvelixaScene 
} from '../data/avelixaTimeline';
import { drawAvelixaFrame } from '../utils/avelixaCanvasDrawer';

export type AvelixaExportFormat = 'vertical_9_16' | 'horizontal_16_9';

interface AvelixaGeneratorProps {
  onBackToMentorStudio?: () => void;
}

export const AvelixaGenerator: React.FC<AvelixaGeneratorProps> = ({ onBackToMentorStudio }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<AvelixaExportFormat>('vertical_9_16');
  const [brandConfig, setBrandConfig] = useState<AvelixaBrandConfig>(DEFAULT_AVELIXA_CONFIG);
  const [customLogoImg, setCustomLogoImg] = useState<HTMLImageElement | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'storyboard' | 'brand'>('export');
  
  // Export status
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [exportError, setExportError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLandscape = activeFormat === 'horizontal_16_9';

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // Render on preview canvas
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
    });
  }, [currentTime, isLandscape, brandConfig, customLogoImg]);

  // Canvas size sync
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
        if (next >= AVELIXA_TOTAL_DURATION) {
          setIsPlaying(false);
          return AVELIXA_TOTAL_DURATION;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, renderCurrentFrame]);

  // Re-render when time or props change
  useEffect(() => {
    renderCurrentFrame();
  }, [currentTime, renderCurrentFrame]);

  // Current Scene
  const currentScene =
    AVELIXA_SCENES.find((s) => currentTime >= s.start && currentTime < s.end) ||
    AVELIXA_SCENES[AVELIXA_SCENES.length - 1];

  // ----------------------------------------------------
  // High-Resolution Deterministic MP4/WebM Video Exporter
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
    const duration = AVELIXA_TOTAL_DURATION; // 40 seconds
    const fps = 30;
    const totalFrames = Math.ceil(duration * fps);
    const filename = isL
      ? 'avelixa-3-mistakes-online-16x9.mp4'
      : 'avelixa-3-mistakes-online-9x16.mp4';
    setDownloadFilename(filename);

    setExportStatusText('Initializing offscreen renderer...');

    try {
      // 1. Create dedicated offscreen canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetW;
      exportCanvas.height = targetH;
      const ctx = exportCanvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Could not create offscreen canvas 2D context');

      // 2. Setup video stream (VISUALS ONLY - zero audio tracks)
      const stream = exportCanvas.captureStream(fps);

      // Verify no audio tracks exist
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((t) => t.stop());
      }

      // Check supported MIME type
      const mimeTypes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=avc1.42E01E',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
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

      // Start recording
      recorder.start(500);

      // Render each frame sequentially
      for (let frameIndex = 0; frameIndex <= totalFrames; frameIndex++) {
        const frameTime = (frameIndex / totalFrames) * duration;

        drawAvelixaFrame(ctx, {
          time: frameTime,
          width: targetW,
          height: targetH,
          aspectRatio: isL ? '16:9' : '9:16',
          brandConfig,
          customLogoImg,
        });

        // Update progress UI every 15 frames
        if (frameIndex % 15 === 0 || frameIndex === totalFrames) {
          const pct = Math.round((frameIndex / totalFrames) * 100);
          setExportProgress(pct);
          setExportStatusText(
            `Rendering frame ${frameIndex} of ${totalFrames} (${pct}%) • ${frameTime.toFixed(1)}s`
          );
        }

        // Allow micro-task breather
        await new Promise((r) => setTimeout(r, 8));
      }

      setExportStatusText('Finalizing video container...');
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

  return (
    <div className="flex-1 flex flex-col bg-stone-950 text-stone-100">
      {/* Subheader banner for Avelixa Project */}
      <div className="border-b border-stone-800 bg-stone-900/60 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Avelixa Social Video Generator</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                New Campaign
              </span>
            </div>
            <div className="text-xs text-stone-400">
              "3 Mistakes Small Businesses Make Online" • 40s • 9:16 Vertical & 16:9 Horizontal
            </div>
          </div>
        </div>

        {/* Back button to original mentor workflow */}
        {onBackToMentorStudio && (
          <button
            onClick={onBackToMentorStudio}
            className="text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded-lg border border-stone-700 hover:border-stone-500 bg-stone-800/80 transition-colors flex items-center gap-1.5"
          >
            <span>Switch to Mentor Advice Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Interactive Video Preview Player */}
        <div className="lg:w-[480px] xl:w-[540px] shrink-0 p-4 sm:p-6 flex flex-col items-center justify-center bg-stone-950 border-r border-stone-800/80">
          {/* Format Switcher Pills */}
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Preview Ratio:
            </span>
            <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-lg border border-stone-800">
              <button
                onClick={() => setActiveFormat('vertical_9_16')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  activeFormat === 'vertical_9_16'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Vertical</span>
              </button>
              <button
                onClick={() => setActiveFormat('horizontal_16_9')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  activeFormat === 'horizontal_16_9'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>16:9 YouTube</span>
              </button>
            </div>
          </div>

          {/* Video Frame Canvas */}
          <div
            className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-stone-800 transition-all duration-300 ${
              isLandscape
                ? 'w-full aspect-[16/9] max-h-[360px]'
                : 'w-[280px] sm:w-[320px] aspect-[9/16] max-h-[580px]'
            }`}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain block bg-stone-950"
            />

            {/* In-Canvas Play/Pause Floating Overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/35 transition-colors group cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <div className="w-14 h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                )}
              </div>
            </button>

            {/* Current Scene Badge on player */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-stone-900/85 backdrop-blur-md border border-stone-700/60 text-[11px] font-semibold text-blue-300">
              Scene {currentScene.sceneNumber}: {currentScene.title}
            </div>

            {/* Timestamp */}
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/75 font-mono text-[11px] text-stone-300">
              {currentTime.toFixed(1)}s / {AVELIXA_TOTAL_DURATION}s
            </div>
          </div>

          {/* Playback Controls & Scrubber */}
          <div className="w-full mt-4 space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0"
                max={AVELIXA_TOTAL_DURATION}
                step="0.1"
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value));
                  if (isPlaying) setIsPlaying(false);
                }}
                className="flex-1 accent-blue-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs text-stone-400 min-w-[50px] text-right">
                {currentTime.toFixed(1)}s
              </span>
            </div>

            {/* Scene Markers Progress Bar */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {AVELIXA_SCENES.map((scene) => {
                const isActive = currentTime >= scene.start && currentTime < scene.end;
                return (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setCurrentTime(scene.start);
                      if (isPlaying) setIsPlaying(false);
                    }}
                    className={`py-1 text-center rounded text-[10px] font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-400'
                    }`}
                  >
                    Scene {scene.sceneNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Controls, Storyboard & Direct MP4 Exporter */}
        <div className="flex-1 flex flex-col min-w-0 bg-stone-900/30 overflow-y-auto">
          {/* Sub Navigation Tabs */}
          <div className="border-b border-stone-800 px-6 py-3 flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('export')}
              className={`pb-1 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'export'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export & Download Videos</span>
            </button>
            <button
              onClick={() => setActiveTab('storyboard')}
              className={`pb-1 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'storyboard'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Storyboard & Timing (5 Scenes)</span>
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`pb-1 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'brand'
                  ? 'border-blue-500 text-blue-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Avelixa Branding & Logo</span>
            </button>
          </div>

          <div className="p-6 max-w-4xl space-y-6">
            {/* ---------------------------------------------------- */}
            {/* TAB 1: EXPORT & DOWNLOAD DIRECTORY                   */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-400" />
                    <span>Download Avelixa Marketing Videos</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Export high-definition MP4 videos with zero audio. The visual cuts, red cross highlights, 
                    mockups, and titles are burned in frame-by-frame ready to sync with your separate voiceover.
                  </p>
                </div>

                {/* Export Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: 9:16 Vertical for Socials */}
                  <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          TikTok · Reels · Shorts · Status
                        </span>
                        <span className="text-xs font-mono text-stone-400">40s</span>
                      </div>
                      <h4 className="text-base font-bold text-white">9:16 Vertical Video</h4>
                      <p className="text-xs text-stone-400 mt-1">
                        1080 × 1920 pixels. Designed specifically for vertical smartphone screens.
                        Features bold centered text, responsive mobile error cards, and Avelixa outro CTA.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-stone-800/80">
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Visuals-only (Zero audio track, sync voice later)</span>
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>All 5 scenes & mistake overlays included</span>
                      </div>
                      <button
                        disabled={isExporting}
                        onClick={() => handleExportVideo('vertical_9_16')}
                        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Generate & Export 9:16 MP4</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: 16:9 Horizontal for YouTube */}
                  <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Tv className="w-3 h-3" />
                          Normal YouTube Video
                        </span>
                        <span className="text-xs font-mono text-stone-400">40s</span>
                      </div>
                      <h4 className="text-base font-bold text-white">16:9 Horizontal Video</h4>
                      <p className="text-xs text-stone-400 mt-1">
                        1920 × 1080 pixels. Dedicated widescreen composition with side-by-side mockups 
                        and problem breakdowns. No black letterbox bars or stretched graphics.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-stone-800/80">
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Native 16:9 side-by-side graphic framing</span>
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Crisp vector typography for desktop displays</span>
                      </div>
                      <button
                        disabled={isExporting}
                        onClick={() => handleExportVideo('horizontal_16_9')}
                        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Generate & Export 16:9 MP4</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress / Status Bar */}
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
                      Rendering 1,200 deterministic frames at 30 FPS. Do not close this tab while the export renders.
                    </p>
                  </div>
                )}

                {/* Success Download Card */}
                {downloadUrl && !isExporting && (
                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{exportStatusText}</span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Your video is packaged as a high-bitrate MP4 file with all scenes and text overlays.
                    </p>
                    <a
                      href={downloadUrl}
                      download={downloadFilename}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span>Click to Download {downloadFilename}</span>
                    </a>
                  </div>
                )}

                {/* Export Error */}
                {exportError && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Export failed: {exportError}</span>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 2: STORYBOARD & SCENE BREAKDOWN                  */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'storyboard' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Visual Storyboard Timeline (40 Seconds Total)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Click any scene to jump the preview player to that timestamp.
                  </p>
                </div>

                <div className="space-y-3">
                  {AVELIXA_SCENES.map((scene) => {
                    const isSelected = currentTime >= scene.start && currentTime < scene.end;
                    return (
                      <div
                        key={scene.id}
                        onClick={() => {
                          setCurrentTime(scene.start);
                          setIsPlaying(false);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-950/30 border-blue-500'
                            : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-blue-400 uppercase tracking-wider">
                            Scene {scene.sceneNumber} • {scene.title}
                          </span>
                          <span className="font-mono text-stone-400">
                            {scene.start.toFixed(1)}s – {scene.end.toFixed(1)}s ({(scene.end - scene.start).toFixed(1)}s)
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-white">
                          Topic: "{scene.topic}"
                        </div>

                        <p className="text-xs text-stone-400 mt-1">
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
            {/* TAB 3: BRANDING & LOGO CUSTOMIZER                    */}
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
                      Upload Custom Avelixa Logo (PNG / SVG)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>{customLogoImg ? 'Replace Custom Logo' : 'Upload Logo Image'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs space-y-2">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Brand Consistency Guard</span>
                  </div>
                  <p className="text-stone-400 leading-relaxed">
                    By default, Avelixa's modern geometric blue shield badge is automatically rendered across all frames 
                    with crisp anti-aliasing. Uploading your own transparent PNG logo will smoothly replace the vector mark 
                    without blurring.
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
