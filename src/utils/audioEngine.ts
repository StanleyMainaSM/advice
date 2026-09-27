/**
 * Cinematic Audio Engine
 * Supports:
 * 1. User uploaded custom audio file (mp3/wav/m4a/webm)
 * 2. High-fidelity Web Speech API synthesis timed line-by-line to match dialogueTimeline
 * 3. Subtle ambient cinematic background score (gentle warm piano/cello ambient pad)
 * 4. AnalyserNode for real-time lip sync & amplitude detection
 */

import { DIALOGUE_TIMELINE, TOTAL_DURATION } from '../data/dialogueTimeline';

export class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private scoreGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  
  // Custom audio element if user uploads file
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private hasCustomAudio = false;

  // Background music state
  private isBgmPlaying = false;
  private bgmInterval: number | null = null;
  private bgmOscillators: OscillatorNode[] = [];

  // Synthesized speech state
  private speechUtterance: SpeechSynthesisUtterance | null = null;
  private activeLineIndex = -1;
  private isSyntheticVoiceEnabled = true;

  // Timing
  private isPlaying = false;
  private currentTime = 0;
  private lastRafTime = 0;
  private rafId: number | null = null;
  private listeners: Set<(time: number) => void> = new Set();
  private playStateListeners: Set<(isPlaying: boolean) => void> = new Set();

  constructor() {
    // Lazy initialize on first interaction
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;

    this.voiceGain = this.ctx.createGain();
    this.voiceGain.gain.value = 1.0;

    this.scoreGain = this.ctx.createGain();
    this.scoreGain.gain.value = 0.12; // -18dB subtle background music

    this.voiceGain.connect(this.analyser);
    this.scoreGain.connect(this.masterGain);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  /**
   * Load custom audio file provided by user
   */
  public loadCustomAudio(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      this.init();
      if (!this.ctx) {
        reject(new Error('AudioContext not ready'));
        return;
      }

      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = '';
      }

      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.crossOrigin = 'anonymous';

      audio.onloadedmetadata = () => {
        this.audioElement = audio;
        this.hasCustomAudio = true;
        this.isSyntheticVoiceEnabled = false;

        // Disconnect old source node if exists
        try {
          if (!this.audioSourceNode && this.ctx) {
            this.audioSourceNode = this.ctx.createMediaElementSource(audio);
            this.audioSourceNode.connect(this.voiceGain!);
          }
        } catch (e) {
          console.warn('Source node connect warning:', e);
        }

        resolve(audio.duration || TOTAL_DURATION);
      };

      audio.onerror = (e) => {
        reject(e);
      };
    });
  }

  public removeCustomAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    this.hasCustomAudio = false;
    this.isSyntheticVoiceEnabled = true;
  }

  public getHasCustomAudio(): boolean {
    return this.hasCustomAudio;
  }

  public play() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.lastRafTime = performance.now();

    if (this.hasCustomAudio && this.audioElement) {
      this.audioElement.currentTime = this.currentTime;
      this.audioElement.play().catch(console.error);
    }

    this.startBgmLoop();
    this.notifyPlayState();
    this.loop();
  }

  public pause() {
    this.isPlaying = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.hasCustomAudio && this.audioElement) {
      this.audioElement.pause();
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.stopBgmLoop();
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
    const clamped = Math.max(0, Math.min(seconds, TOTAL_DURATION));
    this.currentTime = clamped;

    if (this.hasCustomAudio && this.audioElement) {
      this.audioElement.currentTime = clamped;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeLineIndex = -1;
    }

    this.notifyTime();
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setScoreVolume(vol: number) {
    if (this.scoreGain && this.ctx) {
      this.scoreGain.gain.setValueAtTime(Math.max(0, Math.min(vol, 1)), this.ctx.currentTime);
    }
  }

  public setVoiceVolume(vol: number) {
    if (this.voiceGain && this.ctx) {
      this.voiceGain.gain.setValueAtTime(Math.max(0, Math.min(vol, 1)), this.ctx.currentTime);
    }
  }

  /**
   * Get real-time audio amplitude (0.0 to 1.0) for lip-sync & visuals
   */
  public getAudioAmplitude(): number {
    if (!this.analyser) {
      // Fallback synthetic wave based on speech timeline
      if (this.isPlaying) {
        const line = DIALOGUE_TIMELINE.find(
          l => this.currentTime >= l.start && this.currentTime <= l.end
        );
        if (line && line.text) {
          return 0.35 + 0.35 * Math.sin(this.currentTime * 14) * Math.cos(this.currentTime * 7);
        }
      }
      return 0;
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    const len = dataArray.length;
    for (let i = 0; i < len; i++) {
      sum += dataArray[i];
    }
    const avg = sum / len / 255; // 0 to 1

    // If custom audio isn't active but speech synthesis is playing, simulate natural syllable mouth pulse
    if (avg < 0.05 && this.isPlaying) {
      const line = DIALOGUE_TIMELINE.find(
        l => this.currentTime >= l.start && this.currentTime <= l.end
      );
      if (line && line.text) {
        return Math.max(0.1, 0.45 * Math.abs(Math.sin(this.currentTime * 12)));
      }
    }

    return avg;
  }

  public getAudioStreamDestination(): MediaStreamAudioDestinationNode | null {
    if (!this.ctx || !this.masterGain) return null;
    const dest = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(dest);
    return dest;
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

  /**
   * Main animation loop tracking time and triggering speech synthesis
   */
  private loop = () => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const dt = (now - this.lastRafTime) / 1000;
    this.lastRafTime = now;

    if (this.hasCustomAudio && this.audioElement) {
      this.currentTime = this.audioElement.currentTime;
    } else {
      this.currentTime += dt;
      this.handleSyntheticSpeechTick();
    }

    if (this.currentTime >= TOTAL_DURATION) {
      this.currentTime = TOTAL_DURATION;
      this.pause();
      this.notifyTime();
      return;
    }

    this.notifyTime();
    this.rafId = requestAnimationFrame(this.loop);
  };

  /**
   * Trigger speech synthesis line by line synchronized with timeline
   */
  private handleSyntheticSpeechTick() {
    if (!this.isSyntheticVoiceEnabled || !('speechSynthesis' in window)) return;

    const currentLineIdx = DIALOGUE_TIMELINE.findIndex(
      line => this.currentTime >= line.start && this.currentTime < line.end
    );

    if (currentLineIdx !== -1 && currentLineIdx !== this.activeLineIndex) {
      this.activeLineIndex = currentLineIdx;
      const line = DIALOGUE_TIMELINE[currentLineIdx];
      if (line.text.trim()) {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(line.text);
        
        // Find best mature English voice
        const voices = window.speechSynthesis.getVoices();
        const mentorVoice = voices.find(v => 
          (v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('George') || v.name.includes('Arthur'))) ||
          (v.lang.startsWith('en') && !v.name.includes('Female') && !v.name.includes('Zira'))
        ) || voices.find(v => v.lang.startsWith('en')) || null;

        if (mentorVoice) ut.voice = mentorVoice;
        ut.pitch = 0.82; // dignified deep elderly mentor pitch
        ut.rate = 0.88;  // thoughtful, deliberate pace with gravity
        ut.volume = 1.0;

        window.speechSynthesis.speak(ut);
        this.speechUtterance = ut;
      }
    }
  }

  /**
   * Subtle ambient cinematic background score using warm resonant pads
   */
  private startBgmLoop() {
    if (this.isBgmPlaying || !this.ctx || !this.scoreGain) return;
    this.isBgmPlaying = true;

    // Chords: C minor (C3, Eb3, G3), Ab maj (Ab2, C3, Eb3), Bb (Bb2, D3, F3), G minor (G2, Bb2, D3)
    const chordProgressions = [
      [130.81, 155.56, 196.00], // C3, Eb3, G3
      [103.83, 130.81, 155.56], // Ab2, C3, Eb3
      [116.54, 146.83, 174.61], // Bb2, D3, F3
      [98.00, 116.54, 146.83],  // G2, Bb2, D3
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.isPlaying || !this.ctx || !this.scoreGain) return;
      const now = this.ctx.currentTime;
      const chord = chordProgressions[chordIdx % chordProgressions.length];
      chordIdx++;

      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const gain = this.ctx!.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Low pass filter for warm cinematic tone
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380 + Math.sin(now * 0.2) * 80, now);

        // Slow cinematic swell attack and decay
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.25, now + 3.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 7.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.scoreGain!);

        osc.start(now);
        osc.stop(now + 8.0);
      });
    };

    playNextChord();
    this.bgmInterval = window.setInterval(playNextChord, 8000);
  }

  private stopBgmLoop() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public destroy() {
    this.pause();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const globalAudioEngine = new CinematicAudioEngine();
