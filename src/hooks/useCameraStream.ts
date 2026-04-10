import { useCallback, useEffect, useRef, useState } from 'react';
import { requestCameraStream, stopCameraStream } from '@/services/cameraService';
import type { RefObject } from 'react';

export interface CameraConnectResult {
  connected: boolean;
  reason?: 'permission-denied' | 'unavailable';
  message?: string;
}

interface UseCameraStreamResult {
  videoRef: RefObject<HTMLVideoElement | null>;
  isConnected: boolean;
  error: string | null;
  connectCamera: () => Promise<CameraConnectResult>;
  disconnectCamera: () => void;
}

export function useCameraStream(): UseCameraStreamResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stream || !videoRef.current) {
      return;
    }

    videoRef.current.srcObject = stream;
  }, [stream]);

  const connectCamera = useCallback(async (): Promise<CameraConnectResult> => {
    try {
      setError(null);
      const stream = await requestCameraStream();
      streamRef.current = stream;
      setStream(stream);

      setIsConnected(true);
      return { connected: true };
    } catch (cameraError) {
      setIsConnected(false);
      let message = 'Could not access camera. Please try again.';
      if (cameraError instanceof Error) {
        message = cameraError.message;
      }

      setError(message);

      const lowered = message.toLowerCase();
      if (lowered.includes('permission') || lowered.includes('denied')) {
        return {
          connected: false,
          reason: 'permission-denied' as const,
          message,
        };
      }

      return {
        connected: false,
        reason: 'unavailable' as const,
        message,
      };
    }
  }, []);

  const disconnectCamera = useCallback(() => {
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    setStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
      setStream(null);
    };
  }, []);

  return {
    videoRef,
    isConnected,
    error,
    connectCamera,
    disconnectCamera,
  };
}
