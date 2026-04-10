import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '@/components/Header';
import WebcamPreview from '@/components/WebcamPreview';
import StatusPanel from '@/components/StatusPanel';
import ControlsBar from '@/components/ControlsBar';
import YouTubePlayerPanel from '@/components/YouTubePlayerPanel';
import { useCameraStream } from '@/hooks/useCameraStream';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useSmileAnalysis } from '@/hooks/useSmileAnalysis';
import type {
  AnalysisState,
  AppErrorCode,
  AppStatus,
  GracePeriodState,
  PlayerState,
  SmileState,
} from '@/types';

const validTransitions: Record<AppStatus, AppStatus[]> = {
  idle: ['cameraReady'],
  cameraReady: ['analyzing', 'idle'],
  analyzing: ['paused', 'idle'],
  paused: ['analyzing', 'idle'],
};

const GRACE_PERIOD_DURATION_MS = 5000;
const MANUAL_SMILE_MODE = !import.meta.env.VITE_GEMINI_API_KEY;

export default function App() {
  const { videoRef, isConnected, error, connectCamera, disconnectCamera } = useCameraStream();
  const {
    containerRef,
    isReady: isPlayerReady,
    isPlaying: isPlayerPlaying,
    error: playerError,
    play,
    pause,
    seekToStart,
  } = useYouTubePlayer('y6Sxv-sUYtM');
  const [smileState, setSmileState] = useState<SmileState>('unknown');
  const [appStatus, setAppStatus] = useState<AppStatus>('idle');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [gracePeriodState, setGracePeriodState] = useState<GracePeriodState>('inactive');
  const [errorCode, setErrorCode] = useState<AppErrorCode>('none');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const analysisStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAnalyzing } = useSmileAnalysis({
    videoRef,
    enabled: !MANUAL_SMILE_MODE && isConnected && analysisState === 'running',
    intervalMs: 5000,
    initialDelayMs: 500,
    onSmileState: (nextSmileState) => {
      setSmileState(nextSmileState);
      setAnalysisState('running');
      setErrorCode((currentCode) => (currentCode === 'analysis-failed' ? 'none' : currentCode));
    },
    onError: (message) => {
      setAnalysisError(message);

      if (message) {
        setErrorCode('analysis-failed');
        // Keep analysisState as 'running' to maintain overlay; don't transition to 'error'
      }
    },
  });

  // Grace period timer: auto-expire after GRACE_PERIOD_DURATION_MS
  useEffect(() => {
    if (gracePeriodState !== 'active') {
      return;
    }

    const timer = setTimeout(() => {
      setGracePeriodState('expired');
    }, GRACE_PERIOD_DURATION_MS);

    return () => clearTimeout(timer);
  }, [gracePeriodState]);

  useEffect(() => {
    return () => {
      if (analysisStartTimeoutRef.current) {
        clearTimeout(analysisStartTimeoutRef.current);
        analysisStartTimeoutRef.current = null;
      }
    };
  }, []);

  // Single source of truth for player status based on hook state + error
  useEffect(() => {
    if (playerError) {
      setPlayerState('blocked');
      setErrorCode('player-failed');
      return;
    }

    if (!isPlayerReady) {
      setPlayerState('idle');
      return;
    }

    // Player is ready; derive state from playback state
    if (isPlayerPlaying) {
      setPlayerState('playing');
    } else {
      setPlayerState('ready');
    }
  }, [isPlayerPlaying, isPlayerReady, playerError]);

  // Apply playback rule: after grace expires, smile state controls playback
  useEffect(() => {
    // Only apply rule during analysis
    if (analysisState !== 'running') {
      return;
    }

    // Only apply rule after grace period expires
    if (gracePeriodState === 'active') {
      return;
    }

    // Apply rule: not-smiling = pause, smiling = play
    if (smileState === 'not-smiling' || smileState === 'unknown') {
      pause();
    } else if (smileState === 'smiling') {
      play();
    }
  }, [gracePeriodState, smileState, analysisState, play, pause]);

  // During grace period, keep trying to start playback once the player becomes ready.
  useEffect(() => {
    if (analysisState !== 'running') {
      return;
    }

    if (gracePeriodState !== 'active') {
      return;
    }

    if (!isPlayerReady) {
      return;
    }

    play();
  }, [analysisState, gracePeriodState, isPlayerReady, play]);

  const transitionTo = (nextStatus: AppStatus) => {
    setAppStatus((currentStatus) => {
      if (validTransitions[currentStatus].includes(nextStatus)) {
        return nextStatus;
      }

      return currentStatus;
    });
  };



  const handleStartChallenge = async () => {
    if (analysisStartTimeoutRef.current) {
      clearTimeout(analysisStartTimeoutRef.current);
      analysisStartTimeoutRef.current = null;
    }

    const cameraResult = await connectCamera();

    if (!cameraResult.connected) {
      setAnalysisState('idle');
      setGracePeriodState('inactive');
      setSmileState('unknown');

      if (cameraResult.reason === 'permission-denied') {
        setErrorCode('camera-permission-denied');
      } else {
        setErrorCode('camera-unavailable');
      }
      return;
    }

    setErrorCode('none');
    setAnalysisError(null);
    transitionTo('cameraReady');
    setAnalysisState('idle');
    setPlayerState(isPlayerReady ? 'ready' : 'idle');
    if (isPlayerReady) {
      seekToStart();
    }
    setGracePeriodState('inactive');
    setSmileState('smiling');
    
    // Automatically start analysis after camera connects
    analysisStartTimeoutRef.current = setTimeout(() => {
      transitionTo('analyzing');
      setAnalysisState('running');
      setGracePeriodState('active');
      play();
      analysisStartTimeoutRef.current = null;
    }, 100);
  };

  const handleStopChallenge = () => {
    if (analysisStartTimeoutRef.current) {
      clearTimeout(analysisStartTimeoutRef.current);
      analysisStartTimeoutRef.current = null;
    }

    disconnectCamera();
    pause();
    seekToStart();
    // Reset all state to initial values
    setSmileState('unknown');
    setAppStatus('idle');
    setAnalysisState('idle');
    setGracePeriodState('inactive');
    setErrorCode('none');
    setAnalysisError(null);
    // Player state will be derived by effect based on hook state
  };

  const handleToggleSmile = () => {
    if (!MANUAL_SMILE_MODE || analysisState !== 'running') {
      return;
    }

    setSmileState((prev) => {
      const nextSmileState = prev === 'smiling' ? 'not-smiling' : 'smiling';

      // Only allow smile state to control playback if grace period has expired
      if (gracePeriodState !== 'active') {
        if (nextSmileState === 'smiling') {
          play();
        } else {
          pause();
        }
      }

      return nextSmileState;
    });
  };

  const handleTogglePlay = () => {
    // Don't allow play if camera not connected or not smiling (outside grace period)
    if (!isConnected || (smileState === 'not-smiling' && gracePeriodState !== 'active')) {
      return;
    }

    if (isPlayerPlaying) {
      pause();
    } else {
      play();
    }
  };

  const showScanOverlay = isConnected && analysisState === 'running' && (isAnalyzing || MANUAL_SMILE_MODE);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-zinc-950 text-zinc-100">
      <Header
        isConnected={isConnected}
        onStart={handleStartChallenge}
        onStop={handleStopChallenge}
      />

      <main className="flex-1 flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto w-full">
        {/* Player Section */}
        <div className="flex-1 flex flex-col gap-6">
          <YouTubePlayerPanel
            containerRef={containerRef}
            isReady={isPlayerReady}
            isPlaying={isPlayerPlaying}
            error={playerError}
            smileState={smileState}
            isConnected={isConnected}
            gracePeriodState={gracePeriodState}
          />

          <ControlsBar
            cameraConnected={isConnected}
            smileState={smileState}
            gracePeriodState={gracePeriodState}
            isPlaying={isPlayerPlaying}
            onTogglePlay={handleTogglePlay}
            onToggleSmile={handleToggleSmile}
            manualMode={MANUAL_SMILE_MODE}
            analysisState={analysisState}
          />
        </div>

        {/* Sidebar / Status Section */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <WebcamPreview
            videoRef={videoRef}
            isConnected={isConnected}
            smileState={smileState}
            isAnalyzing={showScanOverlay}
          />
          <StatusPanel
            appStatus={appStatus}
            analysisState={analysisState}
            playerState={playerState}
            gracePeriodState={gracePeriodState}
            smileState={smileState}
            errorCode={errorCode}
            cameraConnected={isConnected}
            manualMode={MANUAL_SMILE_MODE}
            error={analysisError ?? error}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-zinc-700 text-[10px] uppercase tracking-[0.4em] font-bold">
          Keep grinning.
        </p>
      </footer>
    </div>
  );
}
