import { AlertCircle, Frown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { RefObject } from 'react';
import type { SmileState } from '@/types';

interface YouTubePlayerPanelProps {
  containerRef: RefObject<HTMLDivElement | null>;
  isReady: boolean;
  isPlaying: boolean;
  error: string | null;
  smileState: SmileState;
  isConnected: boolean;
  gracePeriodState: 'active' | 'inactive' | 'expired';
}

export default function YouTubePlayerPanel({
  containerRef,
  isPlaying,
  error,
  smileState,
  isConnected,
  gracePeriodState,
}: YouTubePlayerPanelProps) {
  const showSmileOverlay = !isConnected || (smileState === 'not-smiling' && gracePeriodState !== 'active');

  return (
    <div className="aspect-video glass-panel rounded-[2rem] overflow-hidden relative group border-2 border-white/5">
      <div ref={containerRef} className="w-full h-full pointer-events-none opacity-80" />
      
      {/* Smile Overlay */}
      <AnimatePresence>
        {showSmileOverlay && isConnected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Frown className="w-20 h-20 text-red-500 mb-6" />
            </motion.div>
            <h2 className="text-3xl font-display font-bold mb-2">Wipe That Frown Off!</h2>
            <p className="text-zinc-400 max-w-md">Our AI has detected a lack of joy. Sad music is a privilege reserved for those who can maintain a smile. It's for your own good.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-xl"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
