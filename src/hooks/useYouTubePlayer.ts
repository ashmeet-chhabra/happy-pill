import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createYouTubePlayer,
  pausePlayerAtStart,
  seekPlayerToStart,
} from '@/services/youtubeService';
import type { RefObject } from 'react';

interface YouTubePlayerLike {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  destroy: () => void;
}

interface UseYouTubePlayerResult {
  containerRef: RefObject<HTMLDivElement | null>;
  isReady: boolean;
  isPlaying: boolean;
  error: string | null;
  play: () => boolean;
  pause: () => boolean;
  seekToStart: () => boolean;
}

export function useYouTubePlayer(videoId: string): UseYouTubePlayerResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayerLike | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initPlayer = async () => {
      if (!containerRef.current) {
        return;
      }

      try {
        const { player, playerState } = await createYouTubePlayer({
          element: containerRef.current,
          videoId,
          onReady: () => {
            if (!isMounted) {
              return;
            }
            setIsReady(true);
            setError(null);
          },
          onStateChange: (state) => {
            if (!isMounted) {
              return;
            }

            if (state === playerState.PLAYING) {
              setIsPlaying(true);
              seekPlayerToStart(player);
              return;
            }

            if (state === playerState.ENDED) {
              pausePlayerAtStart(player);
              setIsPlaying(false);
              return;
            }

            if (state === playerState.PAUSED || state === playerState.UNSTARTED) {
              setIsPlaying(false);
            }
          },
        });

        if (!isMounted) {
          player.destroy();
          return;
        }

        playerRef.current = player;
      } catch {
        if (!isMounted) {
          return;
        }
        setError('YouTube player failed to initialize.');
        setIsReady(false);
      }
    };

    initPlayer();

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = null;
      setIsReady(false);
      setIsPlaying(false);
    };
  }, []);

  const play = useCallback(() => {
    if (!playerRef.current || !isReady) {
      return false;
    }

    seekPlayerToStart(playerRef.current);
    playerRef.current.playVideo();
    return true;
  }, [isReady]);

  const pause = useCallback(() => {
    if (!playerRef.current || !isReady) {
      return false;
    }

    playerRef.current.pauseVideo();
    return true;
  }, [isReady]);

  const seekToStart = useCallback(() => {
    if (!playerRef.current || !isReady) {
      return false;
    }

    pausePlayerAtStart(playerRef.current);
    return true;
  }, [isReady]);

  return {
    containerRef,
    isReady,
    isPlaying,
    error,
    play,
    pause,
    seekToStart,
  };
}
