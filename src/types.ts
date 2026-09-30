export interface TikTokAuthor {
  id: string;
  unique_id: string;
  nickname: string;
  avatar: string;
}

export interface TikTokMusicInfo {
  id?: string;
  title?: string;
  author?: string;
  album?: string;
  play_url?: string;
  cover?: string;
  duration?: number;
}

export interface TikTokVideo {
  id: string;
  video_id?: string;
  aweme_id?: string;
  title: string;
  cover: string;
  ai_dynamic_cover?: string;
  origin_cover?: string;
  duration: number;
  play: string; // standard definition no watermark
  wmplay?: string; // with watermark
  hdplay?: string; // HD 1080p no watermark
  size?: number; // size in bytes
  wm_size?: number;
  hd_size?: number;
  music?: string;
  music_info?: TikTokMusicInfo;
  play_count?: number;
  digg_count?: number;
  comment_count?: number;
  share_count?: number;
  download_count?: number;
  collect_count?: number;
  create_time?: number;
  author?: TikTokAuthor;
}

export interface DownloadTask {
  id: string;
  title: string;
  quality: 'hd' | 'sd' | 'wm' | 'music' | 'cover';
  status: 'idle' | 'downloading' | 'compressing' | 'completed' | 'cancelled' | 'error';
  receivedBytes: number;
  totalBytes: number;
  percentage: number;
  speedFormatted: string;
  etaFormatted: string;
  error?: string;
  abortController?: AbortController;
}

export interface BatchItem {
  id: string;
  url: string;
  selected: boolean;
  quality: 'hd' | 'sd' | 'wm' | 'music';
  status: 'pending' | 'fetching' | 'ready' | 'downloading' | 'done' | 'error';
  video?: TikTokVideo;
  error?: string;
  progress?: number;
  abortController?: AbortController;
}

export interface HistoryItem {
  id: string;
  title: string;
  authorName: string;
  authorHandle: string;
  thumbnail: string;
  quality: string;
  sizeFormatted: string;
  timestamp: number;
  downloadUrl: string;
  originalUrl?: string;
}

export interface TikTokCreator {
  user: {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarMedium?: string;
    avatarThumb?: string;
    signature?: string;
    verified?: boolean;
    secUid?: string;
  };
  stats: {
    followingCount: number;
    followerCount: number;
    heartCount: number;
    videoCount: number;
    diggCount: number;
  };
}
