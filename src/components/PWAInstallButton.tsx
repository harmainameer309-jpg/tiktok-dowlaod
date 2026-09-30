import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as standalone installed PWA
  if (isInstalled) {
    if (variant === 'banner') return null;
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-[11px] font-mono text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="bg-gradient-to-r from-cyan-950/70 via-blue-950/60 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Install TokHD App</h4>
              <p className="text-xs text-slate-300">
                Install on your phone or desktop for one-tap access and fastest offline performance.
              </p>
            </div>
          </div>
          <button
            onClick={install}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Install TokHD</span>
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold text-white">Install TokHD on iPhone / iPad</h3>
              <p className="mt-1 text-xs text-slate-400">
                Install as a full-screen app on your home screen without the App Store:
              </p>

              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[11px] text-cyan-400 shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    Tap the <strong className="text-white">Share</strong> button{' '}
                    <Share className="w-3 h-3 inline text-cyan-400 mb-0.5" /> in the Safari bottom bar.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[11px] text-cyan-400 shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[11px] text-cyan-400 shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    Tap <strong className="text-white">Add</strong> in the top right corner. Done!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / browser install CTA
  return (
    <button
      onClick={() => {
        alert(
          'To install TokHD as an app on your device:\n\n• On Chrome/Edge: Click the Install icon in the browser address bar.\n• On Mobile: Tap browser menu (⋮ or Share) and select "Add to Home screen".'
        );
      }}
      className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-300 hover:text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
      title="How to install"
    >
      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
      <span className="hidden sm:inline">Install App</span>
      <span className="sm:hidden">App</span>
    </button>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 border border-amber-400 px-3.5 py-2 text-xs font-medium text-slate-950 shadow-xl backdrop-blur-md animate-in fade-in">
      <span className="h-2 w-2 rounded-full bg-slate-950 animate-ping" />
      <span>Offline Mode — Cached resources active.</span>
    </div>
  );
};
