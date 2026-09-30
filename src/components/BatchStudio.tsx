import React, { useState } from 'react';
import { TikTokVideo, BatchItem, DownloadTask } from '../types';
import {
  Layers,
  FolderArchive,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Play,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Music,
  ExternalLink
} from 'lucide-react';
import {
  formatBytes,
  formatDuration,
  sanitizeFilename,
  downloadBatchAsZip
} from '../utils/downloadManager';

interface BatchStudioProps {
  batchItems: BatchItem[];
  onSetBatchItems: React.Dispatch<React.SetStateAction<BatchItem[]>>;
  onDownloadSingle: (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    videoMeta?: TikTokVideo
  ) => void;
  onPreview: (video: TikTokVideo) => void;
}

const SAMPLE_BATCH_LINKS = [
  'https://www.tiktok.com/@tiktoktips/video/7675767536016706847',
  'https://www.tiktok.com/@tiktokcreators/video/7310050334196367403'
];

export const BatchStudio: React.FC<BatchStudioProps> = ({
  batchItems,
  onSetBatchItems,
  onDownloadSingle,
  onPreview
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Batch Zip State
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');

  // Sequential Batch State
  const [isSequentialDownloading, setIsSequentialDownloading] = useState(false);
  const [sequentialIndex, setSequentialIndex] = useState(0);

  // Count URLs in textarea
  const extractedUrls = urlInput
    .split(/[\n,\s]+/)
    .map((u) => u.trim())
    .filter((u) => u.includes('tiktok.com/'));

  const handleProcessInputUrls = async () => {
    if (extractedUrls.length === 0) {
      setInputError('Please enter at least one valid TikTok video URL (separated by line or space)');
      return;
    }

    setIsProcessingInput(true);
    setInputError(null);

    try {
      // Create initial pending items in batch
      const newBatchItems: BatchItem[] = extractedUrls.map((url) => ({
        id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url,
        selected: true,
        quality: 'hd',
        status: 'fetching'
      }));

      onSetBatchItems((prev) => [...prev, ...newBatchItems]);
      setUrlInput('');

      // Send to batch info API
      const response = await fetch('/api/batch-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: extractedUrls })
      });

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch batch video information');
      }

      // Update items with returned video metadata
      const resultsMap = new Map<string, any>();
      (json.results || []).forEach((r: any) => {
        resultsMap.set(r.url, r);
      });

      onSetBatchItems((prev) =>
        prev.map((item) => {
          const res = resultsMap.get(item.url);
          if (res) {
            if (res.success && res.data) {
              return {
                ...item,
                status: 'ready',
                video: res.data
              };
            } else {
              return {
                ...item,
                status: 'error',
                error: res.error || 'Failed to parse video'
              };
            }
          }
          return item;
        })
      );
    } catch (err: any) {
      console.error('Batch process error:', err);
      setInputError(err.message || 'Error processing batch URLs');
    } finally {
      setIsProcessingInput(false);
    }
  };

  const handleLoadSamples = () => {
    setUrlInput(SAMPLE_BATCH_LINKS.join('\n'));
    setInputError(null);
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    onSetBatchItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSelectAll = (select: boolean) => {
    onSetBatchItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const handleSetGlobalQuality = (quality: BatchItem['quality']) => {
    onSetBatchItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, quality } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    onSetBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    onSetBatchItems([]);
  };

  // Calculate totals
  const selectedItems = batchItems.filter((item) => item.selected && item.video);
  const totalSelectedBytes = selectedItems.reduce((acc, item) => {
    const size =
      item.quality === 'hd'
        ? item.video?.hd_size || item.video?.size || 0
        : item.video?.size || 0;
    return acc + size;
  }, 0);

  // Download All as ZIP Archive
  const handleDownloadBatchZip = async () => {
    if (selectedItems.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);
    setZipStatusText('Preparing batch ZIP package...');

    try {
      const itemsToZip = selectedItems.map((item) => ({
        video: item.video!,
        quality: item.quality
      }));

      const dateStr = new Date().toISOString().slice(0, 10);
      await downloadBatchAsZip(
        itemsToZip,
        `TikTok_Batch_HD_NoWatermark_${dateStr}.zip`,
        (percent, statusText) => {
          setZipProgress(percent);
          setZipStatusText(statusText);
        }
      );

      // Mark selected items as done
      onSetBatchItems((prev) =>
        prev.map((item) => (item.selected ? { ...item, status: 'done' } : item))
      );
    } catch (err: any) {
      console.error('Batch zip error:', err);
      alert('Error creating batch ZIP archive: ' + err.message);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
      setZipStatusText('');
    }
  };

  // Download Sequentially
  const handleDownloadSequentially = async () => {
    if (selectedItems.length === 0) return;

    setIsSequentialDownloading(true);
    for (let i = 0; i < selectedItems.length; i++) {
      setSequentialIndex(i + 1);
      const item = selectedItems[i];
      const video = item.video!;

      let mediaUrl = video.hdplay || video.play;
      let ext = 'mp4';
      if (item.quality === 'hd') {
        mediaUrl = video.hdplay || video.play;
      } else if (item.quality === 'sd') {
        mediaUrl = video.play;
      } else if (item.quality === 'wm') {
        mediaUrl = video.wmplay || video.play;
      } else if (item.quality === 'music') {
        mediaUrl = video.music || video.play;
        ext = 'mp3';
      }

      const filename = `${sanitizeFilename(video.title || `tiktok_${video.id}`)}-${item.quality.toUpperCase()}.${ext}`;
      
      onDownloadSingle(mediaUrl, filename, video.title || 'TikTok Video', item.quality, video);

      // Small delay between triggers to let browser handle dialogs smoothly
      await new Promise((r) => setTimeout(r, 1500));
    }
    setIsSequentialDownloading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="text-center space-y-2.5 pt-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <Layers className="w-7 h-7 sm:w-8 h-8 text-cyan-400" />
          <span>Batch Video Processing Studio</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Paste multiple TikTok links to analyze, configure qualities, and download in bulk as a single ZIP archive or individual high-definition files.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Paste Multiple TikTok URLs</span>
            <span className="text-xs text-slate-500 font-mono">
              ({extractedUrls.length} valid links detected)
            </span>
          </label>
          <button
            type="button"
            onClick={handleLoadSamples}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Load Sample Batch
          </button>
        </div>

        <textarea
          rows={3}
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            if (inputError) setInputError(null);
          }}
          placeholder="Paste TikTok video links here (one URL per line, or separated by spaces)...&#10;https://www.tiktok.com/@user/video/123456789&#10;https://www.tiktok.com/@user/video/987654321"
          className="w-full p-3.5 bg-[#0b0f19] border border-slate-700/80 rounded-xl text-slate-200 text-xs sm:text-sm font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-y"
        />

        {inputError && (
          <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{inputError}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500 hidden sm:block">
            Supports standard tiktok.com, vt.tiktok.com, and vm.tiktok.com links.
          </p>

          <button
            onClick={handleProcessInputUrls}
            disabled={isProcessingInput || extractedUrls.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer ml-auto"
          >
            {isProcessingInput ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Batch ({extractedUrls.length})...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add {extractedUrls.length > 0 ? `${extractedUrls.length} Videos` : 'to Batch'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Batch Active Zip Progress Banner */}
      {isZipping && (
        <div className="bg-[#131b2e] border border-cyan-500/40 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span className="font-semibold text-white">{zipStatusText}</span>
            </div>
            <span className="text-cyan-400 font-bold tabular-nums">{zipProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${zipProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Batch Queue Section */}
      {batchItems.length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
          {/* Master Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  handleSelectAll(selectedItems.length !== batchItems.length)
                }
                className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {selectedItems.length === batchItems.length ? (
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>
                  {selectedItems.length === batchItems.length
                    ? 'Deselect All'
                    : `Select All (${batchItems.length})`}
                </span>
              </button>

              <span className="text-slate-600">|</span>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-slate-500 font-medium">Batch quality:</span>
                <button
                  onClick={() => handleSetGlobalQuality('hd')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-mono transition-colors"
                >
                  All HD
                </button>
                <button
                  onClick={() => handleSetGlobalQuality('sd')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors"
                >
                  All SD
                </button>
                <button
                  onClick={() => handleSetGlobalQuality('music')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors"
                >
                  All MP3
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                {selectedItems.length} selected {totalSelectedBytes > 0 && `(~${formatBytes(totalSelectedBytes)})`}
              </span>
              <button
                onClick={handleClearAll}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                title="Clear all batch items"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Batch Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadBatchZip}
              disabled={isZipping || selectedItems.length === 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Download Selected as ZIP ({selectedItems.length})</span>
            </button>

            <button
              onClick={handleDownloadSequentially}
              disabled={isSequentialDownloading || selectedItems.length === 0}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 text-slate-200 hover:text-white font-medium text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isSequentialDownloading
                  ? `Downloading ${sequentialIndex}/${selectedItems.length}...`
                  : 'Download Sequentially'}
              </span>
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-3 pt-2">
            {batchItems.map((item, index) => {
              const video = item.video;
              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.selected
                      ? 'bg-[#131b2e]/60 border-cyan-800/40'
                      : 'bg-[#0d1322]/40 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      className="p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600" />
                      )}
                    </button>

                    {/* Thumbnail / Loading Box */}
                    <div className="relative w-14 h-18 bg-black rounded-lg overflow-hidden shrink-0 border border-slate-800">
                      {video ? (
                        <>
                          <img
                            src={video.cover}
                            alt={video.title || 'Video'}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => onPreview(video)}
                            className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center text-white transition-colors"
                            title="Preview video"
                          >
                            <Play className="w-4 h-4 fill-white" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          {item.status === 'fetching' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="min-w-0 flex-1">
                      {video ? (
                        <>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                            {video.title || 'Untitled TikTok Video'}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                            {video.author && (
                              <>
                                <span className="text-cyan-400">@{video.author.unique_id}</span>
                                <span>·</span>
                              </>
                            )}
                            <span>{formatDuration(video.duration)}</span>
                            {video.hd_size && (
                              <>
                                <span>·</span>
                                <span className="text-slate-300">{formatBytes(video.hd_size)}</span>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <div>
                          <p className="text-xs font-mono text-slate-400 truncate max-w-sm">
                            {item.url}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.status === 'fetching' ? 'Analyzing TikTok link...' : item.error || 'Parsing error'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Controls */}
                  {video && (
                    <div className="flex items-center justify-end gap-2.5 shrink-0 pl-8 sm:pl-0">
                      {/* Quality Select */}
                      <select
                        value={item.quality}
                        onChange={(e) => {
                          const val = e.target.value as BatchItem['quality'];
                          onSetBatchItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, quality: val } : i))
                          );
                        }}
                        className="h-8 px-2 bg-slate-800 border border-slate-700 text-xs font-mono rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="hd">HD (No-WM)</option>
                        <option value="sd">SD (No-WM)</option>
                        {video.music && <option value="music">MP3 Audio</option>}
                        {video.wmplay && <option value="wm">With Watermark</option>}
                      </select>

                      {/* Download Single Item */}
                      <button
                        onClick={() => {
                          let mediaUrl = video.hdplay || video.play;
                          let ext = 'mp4';
                          if (item.quality === 'hd') mediaUrl = video.hdplay || video.play;
                          else if (item.quality === 'sd') mediaUrl = video.play;
                          else if (item.quality === 'wm') mediaUrl = video.wmplay || video.play;
                          else if (item.quality === 'music') {
                            mediaUrl = video.music || video.play;
                            ext = 'mp3';
                          }
                          const fname = `${sanitizeFilename(video.title || `tiktok_${video.id}`)}-${item.quality.toUpperCase()}.${ext}`;
                          onDownloadSingle(mediaUrl, fname, video.title || 'TikTok Video', item.quality, video);
                        }}
                        className="p-2 text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-800/40 border border-cyan-800/50 rounded-lg transition-colors cursor-pointer"
                        title="Download this video"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Remove from batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State Help */}
      {batchItems.length === 0 && (
        <div className="border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 text-slate-400 mx-auto flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-300">Your Batch Queue is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Paste multiple video links above, or click "Load Sample Batch" to try multi-video packaging instantly. You can also explore creators in the Creator Explorer tab and send videos here with one click.
          </p>
        </div>
      )}
    </div>
  );
};
