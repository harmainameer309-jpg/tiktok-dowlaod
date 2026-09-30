import React from 'react';
import { Share2, Clipboard, Download, Smartphone, ShieldCheck, Zap } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 pt-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          How to Download TikTok Videos Without Watermarks
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Get original high definition 1080p MP4 videos or MP3 audio tracks in three simple steps.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold font-mono text-base border border-cyan-500/20">
            01
          </div>
          <h3 className="text-base font-bold text-white">Copy TikTok Link</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Open TikTok on your iPhone, Android, or browser. Tap the <strong className="text-slate-200">Share</strong> button on any public video and select <strong className="text-slate-200">Copy Link</strong>.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-mono text-base border border-blue-500/20">
            02
          </div>
          <h3 className="text-base font-bold text-white">Paste URL into TokHD</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Paste the copied link into the TokHD search box, or use the Batch Studio to paste multiple links at once. Click <strong className="text-slate-200">Get Video</strong>.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold font-mono text-base border border-teal-500/20">
            03
          </div>
          <h3 className="text-base font-bold text-white">Download in High Def</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Choose <strong className="text-slate-200">HD No Watermark</strong> or MP3 audio. Watch the live progress bar track your download speed and save cleanly to your device.
          </p>
        </div>
      </div>

      {/* Key Advantages Bento */}
      <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white">Why Use TokHD?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 text-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Ultra-Fast & Mobile Ready</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed specifically for fast mobile and touch usage with real-time download speed meters and ETA calculation.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-950/60 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Zero Watermarks & HD Audio</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts 1080p source streams with all TikTok logo watermarks and bouncing author tags completely removed.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Bulk Batch & ZIP Support</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Queue up to 20 videos at once and package them into a single organized ZIP archive with custom compression.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
