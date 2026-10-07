/**
 * ReelCanvasPlayer: High-performance Canvas Renderer for 9:16 & 16:9 Visual Previews.
 * Renders a continuous still-image storyboard:
 * - One static picture for each dialogue section
 * - Supports 9:16 Vertical (Reels / TikTok / Shorts) and 16:9 Horizontal (YouTube Landscape)
 * - Hard cuts between pictures (no camera movement, no zoom, pan, lip-sync or blinking)
 * - Cinematic color grading presets and fixed film-grain overlay
 * - Strictly VISUALS ONLY: No subtitles, captions, or text on the canvas
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  DIALOGUE_TIMELINE, 
  SHORT_TIMELINE, 
  SHOT_IMAGES_9_16, 
  SHOT_IMAGES_16_9, 
  DialogueLine, 
  StoryboardImageKey 
} from '../data/dialogueTimeline';
import { globalAudioEngine } from '../utils/audioEngine';

export type ColorGradePreset = 'warm_35mm' | 'portra_400' | 'scandinavian_noir' | 'golden_hour' | 'natural_doc';

export interface ReelCanvasPlayerProps {
  currentTime: number;
  isPlaying: boolean;
  colorGrade: ColorGradePreset;
  aspectRatio?: '9:16' | '16:9';
  timelineMode?: 'full' | 'short';
  showSafeZones?: boolean;
  filmGrainEnabled?: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const ReelCanvasPlayer: React.FC<ReelCanvasPlayerProps> = ({
  currentTime,
  isPlaying,
  colorGrade,
  aspectRatio = '9:16',
  timelineMode = 'full',
  showSafeZones = false,
  filmGrainEnabled = true,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImages916Ref = useRef<Map<string, HTMLImageElement>>(new Map());
  const loadedImages169Ref = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload all 9:16 and 16:9 storyboard images
  useEffect(() => {
    let cancelled = false;

    const loadSet = async (map: Record<string, string>, targetRef: React.MutableRefObject<Map<string, HTMLImageElement>>) => {
      const cache = new Map<string, HTMLImageElement>();
      const entries = Object.entries(map);

      await Promise.all(
        entries.map(([key, src]) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              cache.set(key, img);
              resolve();
            };
            img.onerror = () => {
              console.error('Failed to load image:', key, src);
              resolve();
            };
            img.src = src;
          });
        })
      );
      targetRef.current = cache;
    };

    Promise.all([
      loadSet(SHOT_IMAGES_9_16, loadedImages916Ref),
      loadSet(SHOT_IMAGES_16_9, loadedImages169Ref),
    ]).then(() => {
      if (!cancelled) {
        setImagesLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeTimeline = timelineMode === 'short' ? SHORT_TIMELINE : DIALOGUE_TIMELINE;

  // Find active line and shot
  const getCurrentDialogueLine = useCallback((t: number): DialogueLine => {
    const section = activeTimeline.find(l => t >= l.start && t < l.end);
    return section || activeTimeline[activeTimeline.length - 1];
  }, [activeTimeline]);

  // Main Canvas Render Loop
  useEffect(() => {
    if (!imagesLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const t = globalAudioEngine.getCurrentTime();
      const current = getCurrentDialogueLine(t);

      const W = canvas.width;
      const H = canvas.height;

      ctx.save();

      // Determine active image dictionary based on 9:16 vs 16:9
      const activeCache = aspectRatio === '16:9' ? loadedImages169Ref.current : loadedImages916Ref.current;
      const fallbackCache = loadedImages916Ref.current;

      const activeImg =
        activeCache.get(current.shot) ||
        fallbackCache.get(current.shot) ||
        activeCache.get('mentor_closeup') ||
        activeCache.values().next().value;

      if (activeImg) {
        const imgAspect = activeImg.width / activeImg.height;
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

        ctx.drawImage(
          activeImg,
          (W - drawW) / 2,
          (H - drawH) / 2,
          drawW,
          drawH
        );
      }

      // Color Grading Post-Processing
      applyColorGrading(ctx, W, H, colorGrade);

      // Fixed film grain overlay
      if (filmGrainEnabled) {
        applyFilmGrain(ctx, W, H);
      }

      // Subtle anamorphic lens vignette & golden afternoon light bloom
      applyCinematicLighting(ctx, W, H);

      // Safe Zones Guide (optional preview toggle)
      if (showSafeZones) {
        renderSafeZones(ctx, W, H, aspectRatio);
      }

      // Ending fade to black
      const maxT = activeTimeline[activeTimeline.length - 1].end;
      const fadeStart = maxT - 3.5;
      if (t >= fadeStart) {
        const fadeAlpha = Math.min(1.0, (t - fadeStart) / 3.0);
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [imagesLoaded, colorGrade, aspectRatio, timelineMode, showSafeZones, filmGrainEnabled, onCanvasReady, getCurrentDialogueLine, activeTimeline]);

  // Color grade filters
  const applyColorGrading = (ctx: CanvasRenderingContext2D, W: number, H: number, preset: ColorGradePreset) => {
    ctx.save();
    if (preset === 'warm_35mm') {
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(230, 160, 80, 0.16)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(255, 235, 200, 0.12)';
      ctx.fillRect(0, 0, W, H);
    } else if (preset === 'portra_400') {
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(240, 215, 185, 0.22)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(245, 240, 235, 0.08)';
      ctx.fillRect(0, 0, W, H);
    } else if (preset === 'scandinavian_noir') {
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(100, 120, 140, 0.22)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(220, 225, 230, 0.15)';
      ctx.fillRect(0, 0, W, H);
    } else if (preset === 'golden_hour') {
      ctx.globalCompositeOperation = 'color-burn';
      ctx.fillStyle = 'rgba(255, 190, 90, 0.14)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(255, 170, 70, 0.18)';
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  };

  // Fixed Film grain (static, zero jitter)
  const applyFilmGrain = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < 600; i++) {
      const rx = (((Math.sin(i * 999) * 10000) % 1 + 1) % 1) * W;
      const ry = (((Math.cos(i * 333) * 10000) % 1 + 1) % 1) * H;
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(rx, ry, size, size);
    }
    ctx.restore();
  };

  // Vignette & soft lighting
  const applyCinematicLighting = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.save();
    const gradient = ctx.createRadialGradient(W / 2, H / 2, W * 0.45, W / 2, H / 2, W * 0.85);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(10, 6, 4, 0.52)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    const sunbeam = ctx.createRadialGradient(W * 0.9, H * 0.1, 20, W * 0.7, H * 0.35, W * 0.7);
    sunbeam.addColorStop(0, 'rgba(255, 220, 160, 0.12)');
    sunbeam.addColorStop(1, 'rgba(255, 200, 130, 0)');
    ctx.fillStyle = sunbeam;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  // Safe zones guide
  const renderSafeZones = (ctx: CanvasRenderingContext2D, W: number, H: number, aspect: '9:16' | '16:9') => {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);

    if (aspect === '9:16') {
      ctx.strokeRect(40, 160, W - 80, H - 420);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = '600 24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('9:16 VERTICAL SAFE ZONE', 50, 150);
      ctx.fillText('AVOID BOTTOM 260px (CAPTION & AUDIO)', 50, H - 240);
    } else {
      ctx.strokeRect(100, 60, W - 200, H - 120);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = '600 24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('16:9 YOUTUBE ACTION SAFE AREA', 110, 50);
    }
    ctx.restore();
  };

  const canvasWidth = aspectRatio === '16:9' ? 1920 : 1080;
  const canvasHeight = aspectRatio === '16:9' ? 1080 : 1920;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={`max-h-full ${aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[9/16]'} object-contain shadow-2xl rounded-sm`}
      />
      {!imagesLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950 text-stone-200">
          <div className="w-10 h-10 border-2 border-stone-600 border-t-amber-400 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium tracking-wide">Preloading Storyboard Photos...</p>
        </div>
      )}
    </div>
  );
};
