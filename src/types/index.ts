export type SmileState = 'unknown' | 'smiling' | 'not-smiling';

export type AppStatus = 'idle' | 'cameraReady' | 'analyzing' | 'paused';

export type AnalysisState = 'idle' | 'running' | 'paused' | 'error';

export type PlayerState = 'idle' | 'ready' | 'playing' | 'paused' | 'blocked';

export type GracePeriodState = 'inactive' | 'active' | 'expired';

export type AppErrorCode =
  | 'none'
  | 'camera-permission-denied'
  | 'camera-unavailable'
  | 'analysis-failed'
  | 'player-failed'
  | 'unknown';

export interface CameraState {
  isConnected: boolean;
  error: string | null;
}

export interface RuntimeState {
  appStatus: AppStatus;
  analysisState: AnalysisState;
  playerState: PlayerState;
  gracePeriodState: GracePeriodState;
  smileState: SmileState;
  errorCode: AppErrorCode;
}
