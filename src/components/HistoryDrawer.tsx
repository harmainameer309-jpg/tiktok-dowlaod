import React from 'react';
import { HistoryItem, DownloadTask } from '../types';
import { History, Download, Trash2, Clock, Check, Film, Music, ArrowRight } from 'lucide-react';

interface HistoryDrawerProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  onDownloadAgain: (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality']
  ) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onClearHistory,
  onRemoveItem,
  onDownloadAgain
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Download History</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Locally stored records of your recent TikTok downloads.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No downloads yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Downloaded videos and audio files will appear here so you can easily re-download or check past files.
          </p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl divide-y divide-slate-800/80 shadow-2xl overflow-hidden">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-850/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-12 h-16 bg-black rounded-lg overflow-hidden shrink-0 border border-slate-800">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1 left-1 p-0.5 bg-black/60 rounded text-[9px] font-mono text-cyan-300 uppercase">
                    {item.quality}
                  </div>
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate max-w-md">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                    <span className="text-cyan-400">@{item.authorHandle}</span>
                    <span>·</span>
                    <span>{item.sizeFormatted}</span>
                    <span>·</span>
                    <span className="text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    onDownloadAgain(
                      item.downloadUrl,
                      `${item.title}_${item.quality}.mp4`,
                      item.title,
                      item.quality.toLowerCase().includes('hd') ? 'hd' : 'sd'
                    )
                  }
                  className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 hover:text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Download file again"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save</span>
                </button>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
