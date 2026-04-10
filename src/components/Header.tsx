interface HeaderProps {
  isConnected: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function Header({ isConnected, onStart, onStop }: HeaderProps) {
  return (
    <header className="p-6 flex justify-between items-center z-10">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center neon-glow border border-red-500/30 overflow-hidden">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
            <rect width="100" height="100" fill="black"/>
            <path d="M15 65 C 25 85, 75 85, 85 65" stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M25 72 L30 82 L35 75 L40 85 L45 78 L50 88 L55 78 L60 85 L65 75 L70 82 L75 72" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 30 L40 50 M40 30 L20 50" stroke="#ef4444" strokeWidth="8" strokeLinecap="round"/>
            <path d="M60 40 Q75 30 90 40" stroke="#ef4444" strokeWidth="8" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight text-red-500">Happy Pill</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={isConnected ? onStop : onStart}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg neon-glow ${
            isConnected 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
              : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          {isConnected ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-semibold">Stop Watching Me</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold">Start Challenge</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
