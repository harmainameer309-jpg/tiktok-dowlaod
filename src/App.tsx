import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SingleDownloader } from './components/SingleDownloader';
import { BatchStudio } from './components/BatchStudio';
import { CreatorExplorer } from './components/CreatorExplorer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HowItWorks } from './components/HowItWorks';
import { CreatorProfile } from './components/CreatorProfile';
import { ProgressBar } from './components/ProgressBar';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { TikTokVideo, BatchItem, DownloadTask, HistoryItem } from './types';
import { downloadMediaStream, formatBytes, sanitizeFilename } from './utils/downloadManager';

const LOCAL_STORAGE_HISTORY_KEY = 'tokhd_download_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'creator' | 'history' | 'guide' | 'developer'>('single');
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active live download task for large file streaming progress bar
  const [activeTask, setActiveTask] = useState<DownloadTask | null>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);

  // Video Preview Modal
  const [previewVideo, setPreviewVideo] = useState<TikTokVideo | null>(null);

  // Sync history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Failed saving history:', e);
    }
  }, [history]);

  // Handle single media download with live stream progress
  const handleStartDownload = async (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    videoMeta?: TikTokVideo
  ) => {
    // If already downloading, cancel previous or notify
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;
    const taskId = `dl_${Date.now()}`;

    setActiveTask({
      id: taskId,
      title,
      quality,
      status: 'downloading',
      percentage: 0,
      receivedBytes: 0,
      totalBytes: 0,
      speedFormatted: 'Starting...',
      etaFormatted: '--'
    });

    await downloadMediaStream(
      mediaUrl,
      filename,
      taskId,
      title,
      quality,
      {
        onProgress: (updated) => {
          setActiveTask((prev) => (prev ? { ...prev, ...updated } : null));
        },
        onSuccess: (savedFilename, blob) => {
          // Add to history
          if (videoMeta) {
            const historyEntry: HistoryItem = {
              id: `hist_${Date.now()}`,
              title: videoMeta.title || title,
              authorName: videoMeta.author?.nickname || 'TikTok Creator',
              authorHandle: videoMeta.author?.unique_id || 'tiktok',
              thumbnail: videoMeta.cover,
              quality: quality.toUpperCase(),
              sizeFormatted: formatBytes(blob.size),
              timestamp: Date.now(),
              downloadUrl: mediaUrl,
              originalUrl: videoMeta.id ? `https://www.tiktok.com/@${videoMeta.author?.unique_id}/video/${videoMeta.id}` : undefined
            };
            setHistory((prev) => [historyEntry, ...prev]);
          }
        },
        onError: (err) => {
          console.error('Download stream error:', err);
        }
      },
      abortController
    );
  };

  const handleCancelDownload = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    setActiveTask((prev) =>
      prev
        ? {
            ...prev,
            status: 'cancelled',
            speedFormatted: 'Cancelled',
            etaFormatted: '--'
          }
        : null
    );
  };

  const handleDismissTask = () => {
    setActiveTask(null);
  };

  // Add video to batch
  const handleAddToBatch = (video: TikTokVideo) => {
    const videoUrl = video.id
      ? `https://www.tiktok.com/@${video.author?.unique_id || 'user'}/video/${video.id}`
      : video.play;

    const newItem: BatchItem = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: videoUrl,
      selected: true,
      quality: 'hd',
      status: 'ready',
      video
    };

    setBatchItems((prev) => {
      // Avoid duplicate video ids
      if (prev.some((item) => item.video?.id === video.id)) {
        return prev;
      }
      return [newItem, ...prev];
    });
  };

  const handleAddMultipleToBatch = (videos: TikTokVideo[]) => {
    const newItems: BatchItem[] = videos.map((video) => ({
      id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: video.id
        ? `https://www.tiktok.com/@${video.author?.unique_id || 'user'}/video/${video.id}`
        : video.play,
      selected: true,
      quality: 'hd',
      status: 'ready',
      video
    }));

    setBatchItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.video?.id).filter(Boolean));
      const filtered = newItems.filter((i) => !existingIds.has(i.video?.id));
      return [...filtered, ...prev];
    });

    setActiveTab('batch');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        batchCount={batchItems.length}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Persistent Active Download Progress Bar (when downloading large files) */}
      {activeTask && (
        <div className="sticky top-16 z-30 w-full bg-[#090d16]/95 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <ProgressBar
              task={activeTask}
              onCancel={handleCancelDownload}
              onDismiss={handleDismissTask}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* PWA Install Banner for Mobile & Desktop Users */}
        {activeTab === 'single' && (
          <div className="max-w-4xl mx-auto">
            <PWAInstallButton variant="banner" />
          </div>
        )}

        {activeTab === 'single' && (
          <SingleDownloader
            onDownload={handleStartDownload}
            onPreview={(v) => setPreviewVideo(v)}
            onAddToBatch={handleAddToBatch}
          />
        )}

        {activeTab === 'batch' && (
          <BatchStudio
            batchItems={batchItems}
            onSetBatchItems={setBatchItems}
            onDownloadSingle={handleStartDownload}
            onPreview={(v) => setPreviewVideo(v)}
          />
        )}

        {activeTab === 'creator' && (
          <CreatorExplorer
            onDownloadSingle={handleStartDownload}
            onPreview={(v) => setPreviewVideo(v)}
            onAddMultipleToBatch={handleAddMultipleToBatch}
          />
        )}

        {activeTab === 'history' && (
          <HistoryDrawer
            history={history}
            onClearHistory={() => setHistory([])}
            onRemoveItem={(id) => setHistory((prev) => prev.filter((i) => i.id !== id))}
            onDownloadAgain={(url, fn, title, q) => handleStartDownload(url, fn, title, q)}
          />
        )}

        {activeTab === 'guide' && <HowItWorks />}

        {activeTab === 'developer' && <CreatorProfile />}
      </main>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        video={previewVideo}
        isOpen={Boolean(previewVideo)}
        onClose={() => setPreviewVideo(null)}
        onDownload={(video, quality) => {
          let mediaUrl = video.hdplay || video.play;
          let ext = 'mp4';
          if (quality === 'hd') mediaUrl = video.hdplay || video.play;
          else if (quality === 'sd') mediaUrl = video.play;
          else if (quality === 'music') {
            mediaUrl = video.music || video.play;
            ext = 'mp3';
          }
          const fname = `${sanitizeFilename(video.title || 'tiktok')}_${quality.toUpperCase()}.${ext}`;
          handleStartDownload(mediaUrl, fname, video.title || 'TikTok Video', quality, video);
        }}
      />

      {/* Clean Footer (Anti-Slop compliant: clean links, copyright, developer attribution) */}
      <footer className="border-t border-slate-800/80 bg-[#070a12] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
            <span className="font-extrabold text-white text-sm">TokHD</span>
            <span className="hidden sm:inline">·</span>
            <span>Developed by <strong className="text-slate-300">Harmain Ameer</strong> (<a href="mailto:harmainameer309@gmail.com" className="text-cyan-400 hover:underline">harmainameer309@gmail.com</a>)</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setActiveTab('single')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Downloader
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Batch Studio
            </button>
            <button
              onClick={() => setActiveTab('developer')}
              className="hover:text-slate-300 text-cyan-400/90 font-medium transition-colors cursor-pointer"
            >
              About Harmain
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Instructions
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

