import { useEffect, useRef, useState } from 'react';
import { analyzeSmileFromBase64Jpeg } from '@/services/geminiService';
import type { RefObject } from 'react';
import type { SmileState } from '@/types';

interface UseSmileAnalysisOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  intervalMs?: number;
  initialDelayMs?: number;
  onSmileState: (smileState: SmileState) => void;
  onError: (errorMessage: string | null) => void;
}

interface UseSmileAnalysisResult {
  isAnalyzing: boolean;
  lastAnalyzedAt: number | null;
}

const DEFAULT_INTERVAL_MS = 3000;
const DEFAULT_INITIAL_DELAY_MS = 500;

export function useSmileAnalysis({
  videoRef,
  enabled,
  intervalMs = DEFAULT_INTERVAL_MS,
  initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
  onSmileState,
  onError,
}: UseSmileAnalysisOptions): UseSmileAnalysisResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const onSmileStateRef = useRef(onSmileState);
  const onErrorRef = useRef(onError);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<number | null>(null);

  onSmileStateRef.current = onSmileState;
  onErrorRef.current = onError;

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const captureBase64Jpeg = (): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      return null;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const scale = 0.4;
    canvas.width = Math.max(1, Math.floor(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.floor(video.videoHeight * scale));

    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);

    const [, base64Data] = dataUrl.split(',');
    return base64Data ?? null;
  };

  const analyzeCurrentFrame = async () => {
    if (!enabled || inFlightRef.current) {
      return;
    }

    const base64Image = captureBase64Jpeg();
    if (!base64Image) {
      return;
    }

    inFlightRef.current = true;
    setIsAnalyzing(true);

    try {
      const result = await analyzeSmileFromBase64Jpeg(base64Image);
      onSmileStateRef.current(result.isSmiling ? 'smiling' : 'not-smiling');
      onErrorRef.current(null);
      setLastAnalyzedAt(Date.now());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Smile analysis failed.';
      onSmileStateRef.current('unknown');
      onErrorRef.current(message);
    } finally {
      inFlightRef.current = false;
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    clearTimers();

    if (!enabled) {
      inFlightRef.current = false;
      setIsAnalyzing(false);
      onErrorRef.current(null);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      void analyzeCurrentFrame();
    }, initialDelayMs);

    intervalRef.current = setInterval(() => {
      void analyzeCurrentFrame();
    }, intervalMs);

    return () => {
      clearTimers();
      inFlightRef.current = false;
      setIsAnalyzing(false);
    };
  }, [enabled, intervalMs, initialDelayMs]);

  return {
    isAnalyzing,
    lastAnalyzedAt,
  };
}
