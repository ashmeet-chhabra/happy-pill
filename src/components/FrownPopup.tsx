import { Coffee } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface FrownPopupProps {
  open: boolean;
  onDrink: () => void;
}

export default function FrownPopup({ open, onDrink }: FrownPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md px-4"
        >
          <motion.div
            initial={{ scale: 0.92, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-amber-200/20 bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200 text-zinc-900 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.8),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(180,83,9,0.16),_transparent_42%)]" />
            <div className="relative p-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-amber-300/60 bg-white/70 text-amber-700 shadow-inner shadow-white/60">
                <Coffee className="h-10 w-10" />
              </div>

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.45em] text-amber-900/70">
                HTCPCP advisory
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950">
                Seems like you could use some coffee right now.
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-700">
                The grin inspector has detected three consecutive frowns. A proper beverage intervention is now recommended.
              </p>

              <button
                type="button"
                onClick={onDrink}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-amber-50 shadow-lg shadow-amber-300/40 transition-transform duration-200 hover:scale-[1.03] hover:bg-zinc-800"
              >
                <Coffee className="h-4 w-4" />
                Drink
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
