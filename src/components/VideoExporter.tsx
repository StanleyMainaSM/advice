/**
 * Video Exporter Component
 * Generates THREE independent visual-only video versions:
 * 
 * 1. VERSION 1: YouTube Short (1080×1920, 9:16 vertical, 40s) -> "wealth-mentor-youtube-short.mp4"
 * 2. VERSION 2: Reels / TikTok (1080×1920, 9:16 vertical, 210s) -> "wealth-mentor-reels-tiktok.mp4"
 * 3. VERSION 3: Normal YouTube Video (1920×1080, 16:9 horizontal, 210s) -> "wealth-mentor-youtube.mp4"
 * 
 * Strict specifications:
 * - VISUALS ONLY: Strictly NO audio, no speech, no music, no sound effects (MediaStream has zero audio tracks)
 * - NO text, no subtitles, no captions, no watermarks, no logos
 * - Dedicated offscreen export canvas for each format (1080x1920 or 1920x1080)
 * - All images preloaded prior to recording
 * - Deterministic 30 FPS frame drawing with pixel refresh to eliminate the first-frame-freeze bug permanently
 */

import React, { useState, useRef } from 'react';
import { 
  Download, 
  Smartphone, 
  Tv, 
  Flame, 
  Loader2, 
  CheckCircle2, 
  Camera, 
  Play, 
  Clock, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import { 
  TOTAL_DURATION, 
  SHORT_DURATION, 
  DIALOGUE_TIMELINE, 
  SHORT_TIMELINE, 
  SHOT_IMAGES_9_16, 
  SHOT_IMAGES_16_9, 
  DialogueLine 
} from '../data/dialogueTimeline';
import { globalAudioEngine } from '../utils/audioEngine';

export type ExportFormat = 'youtube_short' | 'reels_tiktok' | 'youtube_horizontal';

interface ExportJobConfig {
  format: ExportFormat;
  title: string;
  filename: string;
  width: number;
  height: number;
  duration: number;
  aspectRatio: '9:16' | '16:9';
  timeline: DialogueLine[];
  imageMap: Record<string, string>;
  description: string;
}

export const EXPORT_CONFIGS: Record<ExportFormat, ExportJobConfig> = {
  youtube_short: {
    format: 'youtube_short',
    title: 'YouTube Short',
    filename: 'wealth-mentor-youtube-short.mp4',
    width: 1080,
    height: 1920,
    duration: SHORT_DURATION, // 40 seconds
    aspectRatio: '9:16',
    timeline: SHORT_TIMELINE,
    imageMap: SHOT_IMAGES_9_16,
    description: '1080×1920 Vertical · 40s Condensed Hook · 11 Visual Cuts · Visuals Only',
  },
  reels_tiktok: {
    format: 'reels_tiktok',
    title: 'Reels / TikTok',
    filename: 'wealth-mentor-reels-tiktok.mp4',
    width: 1080,
    height: 1920,
    duration: TOTAL_DURATION, // 210 seconds (03:30)
    aspectRatio: '9:16',
    timeline: DIALOGUE_TIMELINE,
    imageMap: SHOT_IMAGES_9_16,
    description: '1080×1920 Vertical · 3m 30s Full Story · 46 Visual Cuts · Visuals Only',
  },
  youtube_horizontal: {
    format: 'youtube_horizontal',
    title: 'YouTube Video',
    filename: 'wealth-mentor-youtube.mp4',
    width: 1920,
    height: 1080,
    duration: TOTAL_DURATION, // 210 seconds (03:30)
    aspectRatio: '16:9',
    timeline: DIALOGUE_TIMELINE,
    imageMap: SHOT_IMAGES_16_9,
    description: '1920×1080 Horizontal Landscape · 3m 30s Full Story · 46 Visual Cuts · Visuals Only',
  },
};

interface VideoExporterProps {
  onExportStart?: () => void;
  onExportEnd?: () => void;
  activePreviewFormat?: ExportFormat;
  onSelectPreviewFormat?: (format: ExportFormat) => void;
}

export const VideoExporter: React.FC<VideoExporterProps> = ({
  onExportStart,
  onExportEnd,
  activePreviewFormat = 'reels_tiktok',
  onSelectPreviewFormat,
}) => {
  const [activeJob, setActiveJob] = useState<ExportFormat | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState('');
  const [currentSectionName, setCurrentSectionName] = useState('');
  const [completedDownloads, setCompletedDownloads] = useState<Partial<Record<ExportFormat, string>>>({});
  
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const cancelRequestedRef = useRef(false);

  // Capture high-res frame snapshot of current time
  const handleCaptureSnapshot = async (format: ExportFormat) => {
    const config = EXPORT_CONFIGS[format];
    const t = globalAudioEngine.getCurrentTime();
    const section = config.timeline.find(item => t >= item.start && t < item.end) || config.timeline[0];
    const imageSrc = config.imageMap[section.shot];

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = config.width;
    tempCanvas.height = config.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const W = config.width;
      const H = config.height;
      const imgAspect = img.width / img.height;
      const canvasAspect = W / H;
      let drawW = W;
      let drawH = H;
      if (imgAspect > canvasAspect) {
        drawH = H;
        drawW = H * imgAspect;
      } else {
        drawW = W;
        drawH = W / imgAspect;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, (W - drawW) / 2, (H - drawH) / 2, drawW, drawH);

      const url = tempCanvas.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snapshot_${format}_${Math.floor(t)}s.jpg`;
      a.click();
    };
    img.src = imageSrc;
  };

  // Main Export Engine
  const startExport = async (format: ExportFormat) => {
    if (activeJob) return;

    const config = EXPORT_CONFIGS[format];
    setActiveJob(format);
    setExportProgress(0);
    cancelRequestedRef.current = false;
    if (onExportStart) onExportStart();

    let frameTimer: number | null = null;
    let monitorTimer: number | null = null;

    try {
      setExportStatusText(`Preloading ${Object.keys(config.imageMap).length} images for ${config.title}...`);

      // 1. Dedicated Offscreen Export Canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = config.width;
      exportCanvas.height = config.height;
      const exportCtx = exportCanvas.getContext('2d', { alpha: false });
      if (!exportCtx) throw new Error('Could not create dedicated 2D canvas context');

      // 2. Preload ALL required images into an Image Map before recording begins
      const imageCache = new Map<string, HTMLImageElement>();
      const entries = Object.entries(config.imageMap);

      await Promise.all(
        entries.map(([key, src]) => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              imageCache.set(key, img);
              resolve();
            };
            img.onerror = () => {
              reject(new Error(`Failed to load storyboard image for key "${key}" from ${src}`));
            };
            img.src = src;
          });
        })
      );

      setExportStatusText('All storyboard images loaded. Initializing frame stream...');

      // 3. Helper to lookup active section for any time `t`
      const getActiveSection = (time: number): DialogueLine => {
        return (
          config.timeline.find(item => time >= item.start && time < item.end) ||
          config.timeline[config.timeline.length - 1]
        );
      };

      // 4. Deterministic Frame Drawer with active pixel refresh
      let frameCount = 0;
      const drawExportFrame = (time: number) => {
        const section = getActiveSection(time);
        const img =
          imageCache.get(section.shot) ||
          imageCache.values().next().value;

        if (!img) return;

        const W = exportCanvas.width;
        const H = exportCanvas.height;

        // Calculate aspect fill cover
        const imgAspect = img.width / img.height;
        const canvasAspect = W / H;
        let drawW = W;
        let drawH = H;

        if (imgAspect > canvasAspect) {
          drawH = H;
          drawW = H * imgAspect;
        } else {
          drawW = W;
          drawH = W / imgAspect;
        }

        exportCtx.save();
        // Clear background
        exportCtx.fillStyle = '#000000';
        exportCtx.fillRect(0, 0, W, H);

        // Draw image centered without distortion
        exportCtx.drawImage(
          img,
          (W - drawW) / 2,
          (H - drawH) / 2,
          drawW,
          drawH
        );

        // 35mm warm cinematic color grade
        exportCtx.globalCompositeOperation = 'overlay';
        exportCtx.fillStyle = 'rgba(230, 160, 80, 0.16)';
        exportCtx.fillRect(0, 0, W, H);

        exportCtx.globalCompositeOperation = 'soft-light';
        exportCtx.fillStyle = 'rgba(255, 235, 200, 0.12)';
        exportCtx.fillRect(0, 0, W, H);

        // Subtle vignette
        const gradient = exportCtx.createRadialGradient(W / 2, H / 2, W * 0.45, W / 2, H / 2, W * 0.85);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(10, 6, 4, 0.52)');
        exportCtx.fillStyle = gradient;
        exportCtx.fillRect(0, 0, W, H);

        // Micro pixel pulse in corner to guarantee continuous video encoding
        // and eliminate static-frame freezing in Chromium MediaRecorder
        frameCount++;
        exportCtx.globalCompositeOperation = 'source-over';
        exportCtx.fillStyle = `rgba(0, 0, 0, ${(frameCount % 2 === 0 ? 0.01 : 0.02)})`;
        exportCtx.fillRect(0, 0, 1, 1);

        // Ending fade to black (last 3 seconds of the target duration)
        const fadeStart = config.duration - 3.5;
        if (time >= fadeStart) {
          const fadeAlpha = Math.min(1.0, (time - fadeStart) / 3.0);
          exportCtx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
          exportCtx.fillRect(0, 0, W, H);
        }

        exportCtx.restore();
      };

      // Draw initial frame
      drawExportFrame(0);

      // 5. Create video stream from the dedicated export canvas
      let canvasStream: MediaStream;
      try {
        canvasStream = exportCanvas.captureStream(30);
      } catch (e) {
        canvasStream = (exportCanvas as any).captureStream();
      }

      const videoTrack = canvasStream.getVideoTracks()[0];
      if (!videoTrack) throw new Error('Could not get video track from canvas stream');

      // STRICTLY VISUAL ONLY: No audio tracks are added
      const stream = new MediaStream([videoTrack]);

      // 6. Select optimal video mimeType
      const mimeTypes = [
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ];
      let selectedMimeType = 'video/webm';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: config.width >= 1920 ? 12_000_000 : 8_000_000,
      });

      recorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (frameTimer !== null) clearInterval(frameTimer);
        if (monitorTimer !== null) clearInterval(monitorTimer);

        if (cancelRequestedRef.current) {
          setActiveJob(null);
          setExportProgress(0);
          setExportStatusText('Export cancelled.');
          if (onExportEnd) onExportEnd();
          return;
        }

        const isMp4 = selectedMimeType.includes('mp4');
        const ext = isMp4 ? 'mp4' : 'webm';
        const blob = new Blob(recordedChunksRef.current, { type: selectedMimeType });
        const url = URL.createObjectURL(blob);
        const outputFilename = config.filename.replace(/\.mp4$/, `.${ext}`);

        setCompletedDownloads(prev => ({ ...prev, [format]: url }));
        setActiveJob(null);
        setExportProgress(100);
        setExportStatusText(`${config.title} generated successfully!`);
        if (onExportEnd) onExportEnd();

        // Trigger file download
        const a = document.createElement('a');
        a.href = url;
        a.download = outputFilename;
        a.click();
      };

      // 7. Start recording in 250ms chunk slices
      recorder.start(250);
      const startTime = performance.now();

      // 8. 30 FPS deterministic render timer
      const fpsInterval = 1000 / 30; // ~33.3ms
      frameTimer = window.setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const currentT = Math.min(elapsed, config.duration);

        drawExportFrame(currentT);

        if (videoTrack && (videoTrack as any).requestFrame) {
          (videoTrack as any).requestFrame();
        }
      }, fpsInterval);

      // 9. Progress monitor & completion
      monitorTimer = window.setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(100, Math.floor((elapsed / config.duration) * 100));
        const currentT = Math.min(elapsed, config.duration);
        const section = getActiveSection(currentT);

        setExportProgress(progress);
        setCurrentSectionName(`${section.topicTag} (${section.shot})`);
        setExportStatusText(`Encoding ${config.title}: ${Math.floor(elapsed)}s / ${config.duration}s (${progress}%)`);

        if (elapsed >= config.duration) {
          if (frameTimer !== null) clearInterval(frameTimer);
          if (monitorTimer !== null) clearInterval(monitorTimer);

          drawExportFrame(config.duration);
          if (videoTrack && (videoTrack as any).requestFrame) {
            (videoTrack as any).requestFrame();
          }

          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }
      }, 250);

    } catch (err) {
      console.error('Export error:', err);
      if (frameTimer !== null) clearInterval(frameTimer);
      if (monitorTimer !== null) clearInterval(monitorTimer);
      setActiveJob(null);
      setExportProgress(0);
      setExportStatusText(`Export failed for ${config.title}. Please check browser permissions.`);
      if (onExportEnd) onExportEnd();
    }
  };

  const handleCancel = () => {
    cancelRequestedRef.current = true;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setActiveJob(null);
    setExportProgress(0);
    setExportStatusText('Export cancelled.');
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 text-stone-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-2">
        <div>
          <h3 className="text-sm font-bold tracking-wide text-white uppercase flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <span>Generate 3 Visual-Only Video Versions</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Strictly visuals only (zero audio tracks). Exported files are ready to pair with your external voiceover.
          </p>
        </div>

        <button
          onClick={() => handleCaptureSnapshot(activePreviewFormat)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700"
          title="Save 1-frame high-resolution still image"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>Save Current Frame</span>
        </button>
      </div>

      {/* Progress banner when exporting */}
      {activeJob && (
        <div className="p-4 bg-stone-950/90 border border-amber-400/40 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-amber-300 font-semibold flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              {exportStatusText}
            </span>
            <span className="font-mono text-amber-400 font-bold text-sm">{exportProgress}%</span>
          </div>

          {currentSectionName && (
            <p className="text-[11px] text-stone-400 mb-2 truncate">
              Active Visual Cut: <strong className="text-stone-200">{currentSectionName}</strong>
            </p>
          )}

          <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300 rounded-full"
              style={{ width: `${exportProgress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[11px] text-stone-500">
              Deterministic 30 FPS · Dedicated Offscreen Canvas · Zero Audio
            </span>
            <button
              onClick={handleCancel}
              className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/50 hover:bg-rose-950 rounded border border-rose-800/60 transition-colors"
            >
              Cancel Render
            </button>
          </div>
        </div>
      )}

      {/* 3 SEPARATE DOWNLOAD BUTTON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARD 1: YouTube Short (1080×1920, 40s) */}
        <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
          activePreviewFormat === 'youtube_short'
            ? 'bg-amber-400/5 border-amber-400/50 ring-1 ring-amber-400/30'
            : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Version 1 · Short
              </span>
              <span className="text-[11px] font-mono text-stone-400">40s (9:16)</span>
            </div>

            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>YouTube Short</span>
            </h4>
            <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
              Condensed 40-second viral hook. 11 dynamic visual cuts across the opening advice. Pure visuals, no audio.
            </p>

            <div className="text-[10px] font-mono text-stone-500 bg-stone-900 px-2 py-1 rounded border border-stone-800 mb-3 truncate">
              wealth-mentor-youtube-short.mp4
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {onSelectPreviewFormat && (
              <button
                type="button"
                onClick={() => onSelectPreviewFormat('youtube_short')}
                className="w-full py-1 text-[11px] text-stone-400 hover:text-white underline underline-offset-2"
              >
                Preview Short in Player (0–40s)
              </button>
            )}

            <button
              onClick={() => startExport('youtube_short')}
              disabled={activeJob !== null}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                activeJob === 'youtube_short'
                  ? 'bg-amber-400/50 text-stone-950 cursor-wait'
                  : activeJob !== null
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-400 text-white hover:shadow-rose-500/20'
              }`}
            >
              {activeJob === 'youtube_short' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Short ({exportProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download YouTube Short</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CARD 2: Reels / TikTok (1080×1920, 210s) */}
        <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
          activePreviewFormat === 'reels_tiktok'
            ? 'bg-amber-400/5 border-amber-400/50 ring-1 ring-amber-400/30'
            : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Version 2 · Full Vertical
              </span>
              <span className="text-[11px] font-mono text-stone-400">3m 30s (9:16)</span>
            </div>

            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Reels / TikTok</span>
            </h4>
            <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
              Full 210-second vertical story. 46 synchronized visual cuts across all 7 wealth lessons. Pure visuals, no audio.
            </p>

            <div className="text-[10px] font-mono text-stone-500 bg-stone-900 px-2 py-1 rounded border border-stone-800 mb-3 truncate">
              wealth-mentor-reels-tiktok.mp4
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {onSelectPreviewFormat && (
              <button
                type="button"
                onClick={() => onSelectPreviewFormat('reels_tiktok')}
                className="w-full py-1 text-[11px] text-stone-400 hover:text-white underline underline-offset-2"
              >
                Preview Full Vertical (0–210s)
              </button>
            )}

            <button
              onClick={() => startExport('reels_tiktok')}
              disabled={activeJob !== null}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                activeJob === 'reels_tiktok'
                  ? 'bg-amber-400/50 text-stone-950 cursor-wait'
                  : activeJob !== null
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950 hover:shadow-amber-400/20'
              }`}
            >
              {activeJob === 'reels_tiktok' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Reels ({exportProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Reels / TikTok</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CARD 3: Normal YouTube Video (1920×1080, 210s Horizontal Landscape) */}
        <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
          activePreviewFormat === 'youtube_horizontal'
            ? 'bg-amber-400/5 border-amber-400/50 ring-1 ring-amber-400/30'
            : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Version 3 · 16:9 Landscape
              </span>
              <span className="text-[11px] font-mono text-stone-400">3m 30s (16:9)</span>
            </div>

            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-sky-400" />
              <span>YouTube Video (16:9)</span>
            </h4>
            <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
              True 1920×1080 widescreen landscape composition. No side black bars, no distortion. 46 visual cuts. Pure visuals, no audio.
            </p>

            <div className="text-[10px] font-mono text-stone-500 bg-stone-900 px-2 py-1 rounded border border-stone-800 mb-3 truncate">
              wealth-mentor-youtube.mp4
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {onSelectPreviewFormat && (
              <button
                type="button"
                onClick={() => onSelectPreviewFormat('youtube_horizontal')}
                className="w-full py-1 text-[11px] text-stone-400 hover:text-white underline underline-offset-2"
              >
                Preview 16:9 Landscape (0–210s)
              </button>
            )}

            <button
              onClick={() => startExport('youtube_horizontal')}
              disabled={activeJob !== null}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow ${
                activeJob === 'youtube_horizontal'
                  ? 'bg-amber-400/50 text-stone-950 cursor-wait'
                  : activeJob !== null
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-400 text-white hover:shadow-sky-500/20'
              }`}
            >
              {activeJob === 'youtube_horizontal' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating YouTube 16:9 ({exportProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download YouTube Video</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Verification checklist notice */}
      <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-2 text-xs text-stone-400">
        <div className="text-stone-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Export Specifications & Verification:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="bg-stone-900/60 p-2 rounded border border-stone-800">
            <strong className="text-stone-300 block mb-0.5">Visuals Only:</strong>
            Zero audio tracks attached. Pure silent video stream ready for your external voiceover.
          </div>
          <div className="bg-stone-900/60 p-2 rounded border border-stone-800">
            <strong className="text-stone-300 block mb-0.5">Clean Composition:</strong>
            No text, no subtitles, no captions, no watermarks. Still images with clean cut transitions.
          </div>
          <div className="bg-stone-900/60 p-2 rounded border border-stone-800">
            <strong className="text-stone-300 block mb-0.5">Dedicated Offscreen Canvas:</strong>
            Independent 30 FPS rendering engine guarantees every image cut appears in the exported file.
          </div>
        </div>
      </div>
    </div>
  );
};
