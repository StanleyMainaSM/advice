/**
 * ReelCanvasPlayer: High-performance 9:16 Canvas Renderer for Instagram Reel.
 * Renders a continuous still-image storyboard with:
 * - One static picture for each dialogue section
 * - Hard cuts between pictures (no zoom, pan, sway, lip-sync, blinking, or cross-dissolve)
 * - Cinematic color grading presets
 * - Fixed, non-animated film-grain / lighting overlays
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  DIALOGUE_TIMELINE, 
  SHOT_IMAGES, 
  DialogueLine, 
  CameraShotType 
} from '../data/dialogueTimeline';
import { globalAudioEngine } from '../utils/audioEngine';

export type ColorGradePreset = 'warm_35mm' | 'portra_400' | 'scandinavian_noir' | 'golden_hour' | 'natural_doc';

export interface ReelCanvasPlayerProps {
  currentTime: number;
  isPlaying: boolean;
  colorGrade: ColorGradePreset;
  showSafeZones: boolean;
  filmGrainEnabled: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const ReelCanvasPlayer: React.FC<ReelCanvasPlayerProps> = ({
  currentTime,
  isPlaying,
  colorGrade,
  showSafeZones,
  filmGrainEnabled,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload all storyboard images
  useEffect(() => {
    let settledCount = 0;
    const entries = Object.entries(SHOT_IMAGES);
    const total = entries.length;
    const cache: Record<string, HTMLImageElement> = {};

    const finishLoad = () => {
      settledCount++;
      if (settledCount >= total) {
        loadedImagesRef.current = cache;
        setImagesLoaded(true);
      }
    };

    entries.forEach(([shotKey, src]) => {
      if (!src) {
        console.error('Missing image source for shot:', shotKey);
        finishLoad();
        return;
      }

      const img = new Image();
      img.onload = () => {
        cache[shotKey] = img;
        finishLoad();
      };
      img.onerror = () => {
        console.error('Failed to load image:', src);
        finishLoad();
      };
      img.src = src;
    });
  }, []);

  // Find active line and shot
  const getCurrentDialogueLine = useCallback((t: number): { current: DialogueLine; next?: DialogueLine; progress: number } => {
    const idx = DIALOGUE_TIMELINE.findIndex(l => t >= l.start && t < l.end);
    if (idx === -1) {
      const last = DIALOGUE_TIMELINE[DIALOGUE_TIMELINE.length - 1];
      return { current: last, progress: 1.0 };
    }
    const current = DIALOGUE_TIMELINE[idx];
    const next = DIALOGUE_TIMELINE[idx + 1];
    const duration = Math.max(0.1, current.end - current.start);
    const progress = (t - current.start) / duration;
    return { current, next, progress };
  }, []);

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
      const { current } = getCurrentDialogueLine(t);

      const W = canvas.width;  // 1080
      const H = canvas.height; // 1920

      ctx.save();

      // 1. Draw ONE completely static picture for the active dialogue section.
      // It remains perfectly still until the next dialogue section begins.
      const activeImg =
        loadedImagesRef.current[current.shot] ||
        loadedImagesRef.current.mentorFallback ||
        Object.values(loadedImagesRef.current)[0];

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

        ctx.drawImage(
          activeImg,
          (W - drawW) / 2,
          (H - drawH) / 2,
          drawW,
          drawH
        );
      }

      // 4. Color Grading Post-Processing
      applyColorGrading(ctx, W, H, colorGrade);

      // 5. Fixed film grain overlay
      if (filmGrainEnabled) {
        applyFilmGrain(ctx, W, H);
      }

      // 6. Subtle anamorphic lens vignette & golden afternoon light bloom
      applyCinematicLighting(ctx, W, H);

      // 7. No subtitles/captions: voice + visuals only.

      // 8. Instagram Reel Safe Zones Guide
      if (showSafeZones) {
        renderSafeZones(ctx, W, H);
      }

      // 9. Ending fade to black
      if (t >= 204) {
        const fadeAlpha = Math.min(1.0, (t - 204) / 5.5);
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [imagesLoaded, colorGrade, showSafeZones, filmGrainEnabled, onCanvasReady, getCurrentDialogueLine]);

  // Color grade filters
  const applyColorGrading = (ctx: CanvasRenderingContext2D, W: number, H: number, preset: ColorGradePreset) => {
    ctx.save();
    if (preset === 'warm_35mm') {
      // Warm amber highlights, rich teak shadows
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(230, 160, 80, 0.16)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(255, 235, 200, 0.12)';
      ctx.fillRect(0, 0, W, H);
    } else if (preset === 'portra_400') {
      // Creamy skin tones, soft pastel contrast
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(240, 215, 185, 0.22)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(245, 240, 235, 0.08)';
      ctx.fillRect(0, 0, W, H);
    } else if (preset === 'scandinavian_noir') {
      // Desaturated, deep cold contrast
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(100, 120, 140, 0.22)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(220, 225, 230, 0.15)';
      ctx.fillRect(0, 0, W, H);
    } else if (preset === 'golden_hour') {
      // Dramatic sunset window warmth
      ctx.globalCompositeOperation = 'color-burn';
      ctx.fillStyle = 'rgba(255, 190, 90, 0.14)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(255, 170, 70, 0.18)';
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  };

  // Film grain
  const applyFilmGrain = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = '#ffffff';

    // Fixed grain pattern so the image itself never appears to move.
    for (let i = 0; i < 600; i++) {
      const rx = ((Math.sin(i * 999) * 10000) % 1 + 1) % 1 * W;
      const ry = ((Math.cos(i * 333) * 10000) % 1 + 1) % 1 * H;
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(rx, ry, size, size);
    }
    ctx.restore();
  };

  // Vignette & window bloom
  const applyCinematicLighting = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.save();
    // Vignette
    const gradient = ctx.createRadialGradient(W / 2, H / 2, W * 0.45, W / 2, H / 2, W * 0.85);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(10, 6, 4, 0.52)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Warm sunbeam leak in top-right
    const sunbeam = ctx.createRadialGradient(W * 0.9, H * 0.1, 20, W * 0.7, H * 0.35, W * 0.7);
    const pulse = 0.08;
    sunbeam.addColorStop(0, `rgba(255, 220, 160, ${pulse * 1.5})`);
    sunbeam.addColorStop(1, 'rgba(255, 200, 130, 0)');
    ctx.fillStyle = sunbeam;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  // Subtitle renderer
  const renderSubtitles = (
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    line: DialogueLine,
    t: number,
    style: 'bold_yellow' | 'clean_white' | 'gold_serif'
  ) => {
    ctx.save();

    const subY = H * 0.76; // Sits above Instagram Reel bottom action items
    const words = line.words;
    if (!words || words.length === 0) {
      ctx.restore();
      return;
    }

    // Measure text formatting
    let fontFace = "'Plus Jakarta Sans', sans-serif";
    if (style === 'gold_serif') fontFace = "'Newsreader', serif";

    const fontSize = 48;
    ctx.font = `700 ${fontSize}px ${fontFace}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Break words into chunks of ~5-7 words for mobile readability
    const maxWordsPerLine = 6;
    const activeWordIdx = words.findIndex(w => t >= w.start && t < w.end);
    const chunkIdx = activeWordIdx !== -1 ? Math.floor(activeWordIdx / maxWordsPerLine) : 0;
    const currentChunk = words.slice(chunkIdx * maxWordsPerLine, (chunkIdx + 1) * maxWordsPerLine);

    // Subtle dark backdrop pill behind subtitles for 100% legibility
    const fullText = currentChunk.map(w => w.word).join(' ');
    const textMetrics = ctx.measureText(fullText);
    const padX = 36;
    const padY = 20;
    const boxW = Math.min(W * 0.92, textMetrics.width + padX * 2);
    const boxH = fontSize * 1.4 + padY * 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect((W - boxW) / 2, subY - boxH / 2, boxW, boxH, 16);
    ctx.fill();

    // Render individual words with active highlight
    let currentX = (W - textMetrics.width) / 2;
    currentChunk.forEach((w) => {
      const isWordActive = t >= w.start && t < w.end;
      const wordText = w.word + ' ';
      const wordWidth = ctx.measureText(wordText).width;

      ctx.save();
      // Drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;

      if (isWordActive) {
        if (style === 'bold_yellow') {
          ctx.fillStyle = '#FFE600'; // Signature Instagram Reel viral yellow
        } else if (style === 'gold_serif') {
          ctx.fillStyle = '#F5D061';
        } else {
          ctx.fillStyle = '#60A5FA';
        }
        ctx.font = `800 ${fontSize + 4}px ${fontFace}`;
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 ${fontSize}px ${fontFace}`;
      }

      ctx.textAlign = 'left';
      ctx.fillText(wordText, currentX, subY);
      ctx.restore();

      currentX += wordWidth;
    });

    ctx.restore();
  };

  // Safe zones guide
  const renderSafeZones = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);

    // Top safe zone (header, account info)
    ctx.strokeRect(40, 160, W - 80, H - 420);

    // Label
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.font = '600 24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('9:16 INSTAGRAM REEL SAFE ZONE', 50, 150);
    ctx.fillText('AVOID BOTTOM 260px (CAPTION & AUDIO)', 50, H - 240);
    ctx.restore();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={1080}
        height={1920}
        className="max-h-full aspect-[9/16] object-contain shadow-2xl rounded-sm"
      />
      {!imagesLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950 text-stone-200">
          <div className="w-10 h-10 border-2 border-stone-600 border-t-amber-400 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium tracking-wide">Loading your original photos...</p>
        </div>
      )}
    </div>
  );
};
