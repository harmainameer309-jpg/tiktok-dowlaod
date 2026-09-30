import React from 'react';
import { DownloadTask } from '../types';
import { Download, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { formatBytes } from '../utils/downloadManager';

interface ProgressBarProps {
  task: DownloadTask | null;
  onCancel?: () => void;
  onDismiss?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ task, onCancel, onDismiss }) => {
  if (!task || task.status === 'idle') return null;

  const isDownloading = task.status === 'downloading' || task.status === 'compressing';
  const isCompleted = task.status === 'completed';
  const isError = task.status === 'error';
  const isCancelled = task.status === 'cancelled';

  return (
    <div className="w-full bg-[#131b2e] border border-cyan-500/30 rounded-xl p-4 shadow-xl shadow-cyan-950/20 transition-all">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
            {isDownloading && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
            {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {isCancelled && <X className="w-4 h-4 text-amber-400" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 truncate">
              {task.title || 'Downloading TikTok Video'}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="font-mono text-cyan-300 font-medium uppercase text-[11px]">
                {task.quality.toUpperCase()} NO-WM
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums text-slate-300">
                {task.totalBytes > 0
                  ? `${formatBytes(task.receivedBytes)} / ${formatBytes(task.totalBytes)}`
                  : formatBytes(task.receivedBytes)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isDownloading && onCancel && (
            <button
              onClick={onCancel}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
          {(isCompleted || isError || isCancelled) && onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 rounded-full ${
            isCompleted
              ? 'bg-emerald-500'
              : isError
              ? 'bg-rose-500'
              : isCancelled
              ? 'bg-amber-500'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500'
          }`}
          style={{ width: `${Math.max(3, Math.min(100, task.percentage))}%` }}
        />
        {isDownloading && (
          <div
            className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none rounded-full"
            style={{ width: `${Math.max(3, Math.min(100, task.percentage))}%` }}
          />
        )}
      </div>

      {/* Speed, Percentage, ETA */}
      <div className="flex items-center justify-between mt-2 text-xs font-mono text-slate-400 tabular-nums">
        <div className="flex items-center gap-2">
          {isDownloading && (
            <>
              <span className="text-cyan-400 font-semibold">{task.percentage}%</span>
              <span>·</span>
              <span className="text-slate-300">{task.speedFormatted}</span>
            </>
          )}
          {isCompleted && <span className="text-emerald-400 font-semibold">100% Download Completed</span>}
          {isError && <span className="text-rose-400 font-medium">{task.error || 'Failed'}</span>}
          {isCancelled && <span className="text-amber-400">Download cancelled</span>}
        </div>

        {isDownloading && task.etaFormatted && (
          <span className="text-slate-400 text-[11px]">{task.etaFormatted}</span>
        )}
      </div>
    </div>
  );
};
