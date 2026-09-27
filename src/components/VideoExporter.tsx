/**
 * Video Exporter component
 * Uses Canvas captureStream + MediaRecorder with audio destination to export 9:16 MP4 / WebM video files.
 */

import React, { useState, useRef } from 'react';
import { Download, Film, CheckCircle2, AlertCircle, Camera, Loader2 } from 'lucide-react';
import { globalAudioEngine } from '../utils/audioEngine';
import { TOTAL_DURATION } from '../data/dialogueTimeline';

interface VideoExporterProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onExportStart?: () => void;
  onExportEnd?: () => void;
}

export const VideoExporter: React.FC<VideoExporterProps> = ({
  canvasRef,
  onExportStart,
  onExportEnd,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState('');
  const [exportDurationMode, setExportDurationMode] = useState<'full' | 'hook30' | 'lesson60'>('full');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Capture high-res 9:16 still frame
  const handleCaptureStill = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mentor_Cinematic_Still_${Math.floor(globalAudioEngine.getCurrentTime())}s_9x16.jpg`;
    link.click();
  };

  const handleStartExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsExporting(true);
      setExportProgress(0);
      setDownloadUrl(null);
      if (onExportStart) onExportStart();

      let targetDuration = TOTAL_DURATION;
      let startOffset = 0;
      if (exportDurationMode === 'hook30') {
        targetDuration = 30;
      } else if (exportDurationMode === 'lesson60') {
        startOffset = 37;
        targetDuration = 60;
      }

      setExportStatusText(`Preparing 9:16 stream capture (${targetDuration}s)...`);

      // Initialize audio engine destination
      globalAudioEngine.init();
      globalAudioEngine.seek(startOffset);

      // Canvas stream
      const canvasStream = canvas.captureStream(30); // 30fps smooth Instagram Reel
      const audioDestination = globalAudioEngine.getAudioStreamDestination();

      const combinedTracks: MediaStreamTrack[] = [
        ...canvasStream.getVideoTracks(),
      ];

      if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
        combinedTracks.push(...audioDestination.stream.getAudioTracks());
      }

      const combinedStream = new MediaStream(combinedTracks);

      // Determine best supported mimeType
      const mimeTypes = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      let selectedMimeType = 'video/webm';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 8_000_000, // 8 Mbps high-bitrate crisp video
      });

      recorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const isMp4 = selectedMimeType.includes('mp4');
        const ext = isMp4 ? 'mp4' : 'webm';
        const finalBlob = new Blob(recordedChunksRef.current, { type: selectedMimeType });
        const url = URL.createObjectURL(finalBlob);
        const filename = `The_Mentor_Financial_Advice_9x16_Reel.${ext}`;
        
        setDownloadUrl(url);
        setDownloadFilename(filename);
        setIsExporting(false);
        setExportProgress(100);
        setExportStatusText('Reel compiled successfully!');
        if (onExportEnd) onExportEnd();

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      };

      // Start recording & playback
      recorder.start(1000);
      globalAudioEngine.play();

      const startTime = performance.now();
      const interval = window.setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(100, Math.floor((elapsed / targetDuration) * 100));
        setExportProgress(progress);
        setExportStatusText(`Encoding frames... ${Math.floor(elapsed)}s / ${targetDuration}s (${progress}%)`);

        if (elapsed >= targetDuration) {
          clearInterval(interval);
          globalAudioEngine.pause();
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }
      }, 500);

    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
      setExportStatusText('Export failed. Please check browser permissions.');
      if (onExportEnd) onExportEnd();
    }
  };

  const handleCancelExport = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    globalAudioEngine.pause();
    setIsExporting(false);
    setExportProgress(0);
    setExportStatusText('Export cancelled');
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 text-stone-200">
      <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Export 9:16 Instagram Reel
          </h3>
        </div>
        <button
          onClick={handleCaptureStill}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
          title="Save current frame as high-resolution photo"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Capture Frame</span>
        </button>
      </div>

      {/* Length selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-stone-400 mb-2">Export Duration</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setExportDurationMode('full')}
            disabled={isExporting}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors text-center ${
              exportDurationMode === 'full'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            Full Speech
            <span className="block text-[10px] opacity-75 font-normal">3m 30s (Complete)</span>
          </button>
          <button
            onClick={() => setExportDurationMode('hook30')}
            disabled={isExporting}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors text-center ${
              exportDurationMode === 'hook30'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            Viral Hook
            <span className="block text-[10px] opacity-75 font-normal">0–30s (Opening)</span>
          </button>
          <button
            onClick={() => setExportDurationMode('lesson60')}
            disabled={isExporting}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors text-center ${
              exportDurationMode === 'lesson60'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            Core Lesson
            <span className="block text-[10px] opacity-75 font-normal">60s (Discipline)</span>
          </button>
        </div>
      </div>

      {/* Progress display */}
      {isExporting && (
        <div className="mb-4 p-4 bg-stone-950/80 border border-amber-400/30 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-amber-300 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {exportStatusText}
            </span>
            <span className="font-mono text-stone-400">{exportProgress}%</span>
          </div>
          <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleCancelExport}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Cancel Recording
            </button>
          </div>
        </div>
      )}

      {/* Completed status */}
      {downloadUrl && !isExporting && (
        <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready: {downloadFilename}</span>
          </div>
          <a
            href={downloadUrl}
            download={downloadFilename}
            className="flex items-center gap-1 text-xs text-emerald-300 hover:text-white font-medium underline underline-offset-2"
          >
            <Download className="w-3.5 h-3.5" />
            Download Again
          </a>
        </div>
      )}

      {/* Main Export Action Button */}
      <button
        onClick={handleStartExport}
        disabled={isExporting}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
          isExporting
            ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 hover:shadow-amber-500/20'
        }`}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Recording 9:16 Video Reel...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Export Reel as MP4 / Video</span>
          </>
        )}
      </button>

      <p className="mt-3 text-[11px] text-stone-400 leading-relaxed text-center">
        Records the 1080×1920 canvas sequence, camera movement, audio track, and synchronized subtitles ready for Instagram Reel, YouTube Shorts, or TikTok.
      </p>
    </div>
  );
};
