import React, { useState } from 'react';
import { Mail, Check, Copy, Send, Code, ShieldCheck, Sparkles, Smartphone, Heart, ExternalLink } from 'lucide-react';

export const CreatorProfile: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const email = 'harmainameer309@gmail.com';
  const name = 'Harmain Ameer';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      feedbackSubject || 'TokHD Downloader Feedback / Inquiry'
    )}&body=${encodeURIComponent(feedbackMessage || 'Hello Harmain,\n\nI am contacting you regarding TokHD...')}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pt-4">
      {/* Hero Creator Card */}
      <div className="relative bg-gradient-to-br from-[#111827] via-[#0d1424] to-[#090d16] border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar Initials with Animated Glow Ring */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-cyan-950/50">
              <div className="w-full h-full bg-[#090d16] rounded-2xl flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 font-mono">
                  HA
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-500 border-2 border-[#090d16] flex items-center justify-center text-white" title="Verified Creator">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {name}
                </h1>
                <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                  Lead Developer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Creator & Developer of TokHD — High Definition TikTok Video Downloader Without Watermarks
              </p>
            </div>

            {/* Email Contact Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="flex items-center gap-2 bg-[#0b0f19] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 shadow-sm">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="select-all">{email}</span>
                <button
                  onClick={handleCopyEmail}
                  className="ml-2 p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Copy email address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <a
                href={`mailto:${email}`}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-950/30 flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Contact Harmain</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: App Architecture Info + Direct Message Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: App & Developer Specifications */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Code className="w-5 h-5 text-cyan-400" />
            <h3>Application Information</h3>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Application</span>
              <span className="text-slate-200 font-medium">TokHD PWA Studio</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Lead Creator</span>
              <span className="text-cyan-300 font-semibold">{name}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Official Contact</span>
              <span className="text-slate-200 font-mono">{email}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Engine API</span>
              <span className="text-slate-200 font-mono">tiktok-video-no-watermark2</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Capabilities</span>
              <span className="text-slate-200">1080p HD, No Watermark, Batch ZIP, Live Speed ETA</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">PWA Support</span>
              <span className="text-emerald-400 font-mono">Installable Standalone</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Version</span>
              <span className="text-slate-400 font-mono">v1.2.0</span>
            </div>
          </div>
        </div>

        {/* Right: Direct Inquiries Form */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Mail className="w-5 h-5 text-blue-400" />
            <h3>Send Message to Harmain</h3>
          </div>
          <p className="text-xs text-slate-400">
            Have a question, feature request, or suggestion for TokHD? Send an email directly to Harmain Ameer.
          </p>

          <form onSubmit={handleSendFeedback} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Subject
              </label>
              <input
                type="text"
                value={feedbackSubject}
                onChange={(e) => setFeedbackSubject(e.target.value)}
                placeholder="e.g., Feature suggestion for TokHD..."
                className="w-full h-10 px-3.5 bg-[#0b0f19] border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Message
              </label>
              <textarea
                rows={4}
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full p-3 bg-[#0b0f19] border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-950/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via {email}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
