import { motion } from 'motion/react';
import type {
  AnalysisState,
  AppErrorCode,
  AppStatus,
  GracePeriodState,
  PlayerState,
  SmileState,
} from '@/types';

interface StatusPanelProps {
  appStatus: AppStatus;
  analysisState: AnalysisState;
  playerState: PlayerState;
  gracePeriodState: GracePeriodState;
  smileState: SmileState;
  errorCode: AppErrorCode;
  cameraConnected: boolean;
  manualMode: boolean;
  error: string | null;
}

function getJourneyMessage({
  cameraConnected,
  errorCode,
  gracePeriodState,
  smileState,
}: {
  cameraConnected: boolean;
  analysisState: AnalysisState;
  gracePeriodState: GracePeriodState;
  smileState: SmileState;
  playerState: PlayerState;
  errorCode: AppErrorCode;
  manualMode: boolean;
}): string {
  if (!cameraConnected) {
    return 'Waiting for your beautiful smile...';
  }

  if (errorCode === 'camera-permission-denied') {
    return 'Camera access is required for this challenge.';
  }

  if (errorCode === 'camera-unavailable') {
    return 'Camera unavailable. Check your device.';
  }

  if (errorCode === 'player-failed') {
    return 'Player failed. Reconnect to retry.';
  }

  if (errorCode === 'analysis-failed') {
    return 'Analysis error. Please try again.';
  }

  if (gracePeriodState === 'active') {
    return 'GRACE PERIOD ACTIVE: Enjoy the music while it lasts...';
  }

  if (smileState === 'smiling') {
    return 'SMILE DETECTED: TRUE. Your joy fuels the music.';
  }

  if (smileState === 'not-smiling') {
    return 'SMILE DETECTED: FALSE. Music paused. Keep grinning! :)';
  }

  return 'Waiting for your beautiful smile...';
}

export default function StatusPanel({
  cameraConnected,
  analysisState,
  gracePeriodState,
  smileState,
  errorCode,
  error,
}: StatusPanelProps) {
  const journeyMessage = getJourneyMessage({
    cameraConnected,
    analysisState,
    gracePeriodState,
    smileState,
    playerState: 'idle',
    errorCode,
    manualMode: false,
  });

  return (
    <div className="glass-panel rounded-[2.5rem] p-8 flex-1 flex flex-col gap-5 border border-white/5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">Joy Monitor</h3>
        <div className="px-2 py-1 bg-red-500/10 rounded text-[10px] font-bold text-red-400 uppercase tracking-tighter border border-red-500/20">
          Live Feed
        </div>
      </div>
      <div className="flex-1 bg-zinc-950/80 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
        <p className="text-zinc-400 text-sm font-mono leading-relaxed relative z-10">
          {journeyMessage}
        </p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900">
          <motion.div 
            className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            animate={{ width: analysisState === 'running' ? '100%' : '0%' }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
        <span>System: Stable</span>
        <span>v1.0.4-HAPPY</span>
      </div>
      {error ? <p className="text-red-400 text-sm border border-red-500/30 bg-red-500/10 rounded p-3">{error}</p> : null}
    </div>
  );
}
