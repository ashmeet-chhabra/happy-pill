import { CameraOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { SmileState } from '@/types';

interface WebcamPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isConnected: boolean;
  smileState: SmileState;
  isAnalyzing?: boolean;
}

export default function WebcamPreview({ videoRef, isConnected, smileState, isAnalyzing }: WebcamPreviewProps) {
  return (
    <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col items-center gap-6 aspect-square justify-center relative overflow-hidden border border-white/5">
      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            <div className={`w-44 h-44 rounded-full border-4 transition-colors duration-500 overflow-hidden relative neon-glow ${smileState === 'smiling' ? 'border-green-500/50' : 'border-red-500/50'}`}>
              <video 
                ref={videoRef} 
                autoPlay 
                muted
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-400 absolute animate-scan" />
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${smileState === 'smiling' ? 'text-green-400' : 'text-red-400'}`}>
                {smileState === 'smiling' ? 'Smile Detected' : 'Smile Missing'}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      smileState === 'smiling' ? 'bg-green-500' : 'bg-zinc-800'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <CameraOff className="text-zinc-700" size={40} />
            </div>
            <h4 className="font-display font-bold mb-2">Challenge Inactive</h4>
            <p className="text-zinc-500 text-xs px-4">Connect your camera to prove you're happy enough for this music.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
