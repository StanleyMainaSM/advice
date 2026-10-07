/**
 * Visual Timeline Engine (Strictly Silent - No Audio)
 * Drives the video storyboard timing accurately from 0 to 210 seconds.
 * 
 * Per user instructions:
 * - NO audio synthesis (SpeechSynthesis is disabled)
 * - NO background music / oscillators
 * - NO sound effects
 * - The exported video will contain VISUALS ONLY (zero audio tracks)
 */

import { TOTAL_DURATION } from '../data/dialogueTimeline';

export class VisualTimelineEngine {
  private isPlaying = false;
  private currentTime = 0;
  private maxDuration = TOTAL_DURATION;
  private lastRafTime = 0;
  private rafId: number | null = null;
  private listeners: Set<(time: number) => void> = new Set();
  private playStateListeners: Set<(isPlaying: boolean) => void> = new Set();

  public init() {
    // Silent timing engine requires no audio context initialization
  }

  public setMaxDuration(duration: number) {
    this.maxDuration = duration;
    if (this.currentTime > duration) {
      this.currentTime = duration;
      this.notifyTime();
    }
  }

  public getMaxDuration(): number {
    return this.maxDuration;
  }

  // Visuals-only mode: audio operations are silent / no-op
  public setScoreVolume(_vol: number) {
    // Strictly silent: no background audio
  }

  public removeCustomAudio() {
    // Strictly silent: no audio track attached
  }

  public async loadCustomAudio(_file: File): Promise<void> {
    // Strictly silent: acknowledges file if provided, but exported media remains visuals-only
    return Promise.resolve();
  }

  public getAudioAmplitude(): number {
    return 0;
  }

  public play() {
    this.isPlaying = true;
    this.lastRafTime = performance.now();
    this.notifyPlayState();
    this.loop();
  }

  public pause() {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.notifyPlayState();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    const clamped = Math.max(0, Math.min(seconds, this.maxDuration));
    this.currentTime = clamped;
    this.notifyTime();
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public onTimeUpdate(cb: (time: number) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public onPlayStateChange(cb: (isPlaying: boolean) => void): () => void {
    this.playStateListeners.add(cb);
    return () => this.playStateListeners.delete(cb);
  }

  private notifyTime() {
    this.listeners.forEach(cb => cb(this.currentTime));
  }

  private notifyPlayState() {
    this.playStateListeners.forEach(cb => cb(this.isPlaying));
  }

  private loop = () => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const dt = (now - this.lastRafTime) / 1000;
    this.lastRafTime = now;

    this.currentTime += dt;

    if (this.currentTime >= this.maxDuration) {
      this.currentTime = this.maxDuration;
      this.pause();
      this.notifyTime();
      return;
    }

    this.notifyTime();
    this.rafId = requestAnimationFrame(this.loop);
  };

  public destroy() {
    this.pause();
  }
}

export const globalAudioEngine = new VisualTimelineEngine();
