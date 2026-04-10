import { Music, Frown, SkipBack, Play, Pause, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import type {
  AnalysisState,
  GracePeriodState,
  SmileState,
} from '@/types';

interface ControlsBarProps {
  cameraConnected: boolean;
  smileState: SmileState;
  gracePeriodState: GracePeriodState;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onToggleSmile: () => void;
  manualMode: boolean;
  analysisState: AnalysisState;
}

export default function ControlsBar({
  cameraConnected,
  smileState,
  gracePeriodState,
  isPlaying,
  onTogglePlay,
  onToggleSmile,
  manualMode,
  analysisState,
}: ControlsBarProps) {
  const canPlay = cameraConnected && (smileState === 'smiling' || gracePeriodState === 'active');
  const canToggleSmile = analysisState === 'running';

  return (
    <div className="glass-panel rounded-3xl p-6 flex items-center justify-between border border-white/5 shadow-2xl">
      {/* Left: Track Info */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 flex items-center justify-center">
          <Music size={24} className={`text-zinc-700 transition-all duration-500 ${!smileState || smileState === 'not-smiling' ? 'blur-sm' : ''}`} />
          {smileState === 'not-smiling' && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Frown size={20} className="text-red-500" /></div>}
        </div>
        <div>
          <p className="font-bold text-sm truncate">Happy</p>
          <p className="text-xs text-zinc-500">Pharrell Williams</p>
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex flex-col items-center gap-3 w-1/3">
        <div className="flex items-center gap-8">
          <button className="text-zinc-600 hover:text-white transition-colors" title="Skip back">
            <SkipBack size={22} />
          </button>
          <button 
            onClick={onTogglePlay}
            disabled={!canPlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              canPlay ? 'bg-white text-black hover:scale-110' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
            title={canPlay ? 'Play/Pause' : 'Connect camera and smile to play'}
          >
            {isPlaying ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} className="ml-1" />}
          </button>
          <button className="text-zinc-600 hover:text-white transition-colors" title="Skip forward">
            <SkipForward size={22} />
          </button>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            className="bg-red-500 h-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            animate={{ width: isPlaying ? '100%' : '0%' }}
            transition={{ duration: isPlaying ? 180 : 0.5, ease: "linear" }}
          />
        </div>
      </div>

      {/* Right: Volume & Extra Controls */}
      <div className="flex items-center justify-end gap-5 w-1/3">
        <div className="flex items-center gap-2">
          <Volume2 className="text-zinc-500" size={18} />
          <div className="w-20 bg-zinc-900 h-1 rounded-full">
            <div className="bg-red-500/50 w-3/4 h-full rounded-full" />
          </div>
        </div>
        <Maximize2 className="text-zinc-500 cursor-pointer hover:text-white" size={18} />
      </div>

      {/* Manual Smile Toggle (if in fallback mode) */}
      {manualMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button 
            onClick={onToggleSmile}
            disabled={!canToggleSmile}
            className="px-3 py-1 rounded text-xs font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={canToggleSmile ? 'Toggle manual smile' : 'Analysis must be running'}
          >
            {smileState === 'smiling' ? '😊 Smile ON' : '😔 Smile OFF'}
          </button>
        </div>
      )}
    </div>
  );
}
