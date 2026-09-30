import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (Number(process.env.PORT) || 3000) : 3000;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '129a4e1033mshf00414cde12896bp19ebecjsna454f882d8b1';
const RAPIDAPI_HOST = 'tiktok-video-no-watermark2.p.rapidapi.com';

app.use(express.json());

// RapidAPI Request Helper
async function callRapidApi(endpoint: string, params: Record<string, string | number>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    query.append(key, String(value));
  }
  const url = `https://${RAPIDAPI_HOST}${endpoint}${query.toString() ? '?' + query.toString() : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`RapidAPI Error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

// 1. Single Video Info
app.get('/api/video-info', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'Video URL is required' });
    }

    const cleanUrl = url.trim();
    const data = await callRapidApi('/', { url: cleanUrl, hd: 1 });

    if (data.code !== 0 && data.code !== 200) {
      return res.status(400).json({
        success: false,
        error: data.msg || 'Failed to fetch video information. Please ensure the link is a valid public TikTok video.'
      });
    }

    res.json({ success: true, data: data.data });
  } catch (err: any) {
    console.error('Error fetching video info:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error fetching video' });
  }
});

// 2. Batch Video Info
app.post('/api/batch-info', async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, error: 'Array of URLs is required' });
    }

    // Limit to max 25 per request to prevent API exhaustion
    const targetUrls = urls.slice(0, 25).map(u => String(u).trim()).filter(Boolean);

    // Process concurrently with a pool of 4
    const results: any[] = [];
    const chunkSize = 4;
    for (let i = 0; i < targetUrls.length; i += chunkSize) {
      const chunk = targetUrls.slice(i, i + chunkSize);
      const chunkPromises = chunk.map(async (videoUrl) => {
        try {
          const data = await callRapidApi('/', { url: videoUrl, hd: 1 });
          if (data.code === 0 || data.code === 200) {
            return { url: videoUrl, success: true, data: data.data };
          } else {
            return { url: videoUrl, success: false, error: data.msg || 'URL parsing failed' };
          }
        } catch (error: any) {
          return { url: videoUrl, success: false, error: error.message || 'Network error' };
        }
      });
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    res.json({ success: true, results });
  } catch (err: any) {
    console.error('Error batch fetching video info:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error processing batch' });
  }
});

// 3. User Search
app.get('/api/user-search', async (req, res) => {
  try {
    const keywords = (req.query.keywords as string) || 'tiktok';
    const cursor = Number(req.query.cursor) || 0;
    const count = Number(req.query.count) || 10;

    const data = await callRapidApi('/user/search', {
      profile_type: 0,
      follower_count: 0,
      other_pref: 0,
      count,
      cursor,
      keywords
    });

    res.json(data);
  } catch (err: any) {
    console.error('Error searching users:', err);
    res.status(500).json({ code: -1, msg: err.message || 'Error searching users' });
  }
});

// 4. User Posts
app.get('/api/user-posts', async (req, res) => {
  try {
    const unique_id = req.query.unique_id as string;
    if (!unique_id) {
      return res.status(400).json({ code: -1, msg: 'Creator unique_id is required' });
    }
    const count = Number(req.query.count) || 12;
    const cursor = Number(req.query.cursor) || 0;

    const data = await callRapidApi('/user/posts', {
      unique_id,
      count,
      cursor
    });

    res.json(data);
  } catch (err: any) {
    console.error('Error getting user posts:', err);
    res.status(500).json({ code: -1, msg: err.message || 'Error fetching user posts' });
  }
});

// 5. Proxy Media Download with streaming and range support
app.get('/api/proxy-media', async (req, res) => {
  try {
    const mediaUrl = req.query.url as string;
    const filename = (req.query.filename as string) || 'tiktok_video_nowatermark.mp4';
    const download = req.query.download === '1' || req.query.download === 'true';

    if (!mediaUrl) {
      return res.status(400).json({ error: 'Media URL required' });
    }

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.tiktok.com/'
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const mediaResponse = await fetch(mediaUrl, { headers });

    if (!mediaResponse.ok && mediaResponse.status !== 206) {
      return res.status(mediaResponse.status).send(`Failed upstream media request: ${mediaResponse.statusText}`);
    }

    // Set headers
    const contentType = mediaResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = mediaResponse.headers.get('content-length');
    const contentRange = mediaResponse.headers.get('content-range');
    const acceptRanges = mediaResponse.headers.get('accept-ranges');

    res.status(mediaResponse.status);
    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
    
    // Enable CORS and expose content-length for client-side progress calculation
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Disposition, Content-Range');

    if (download) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    }

    if (!mediaResponse.body) {
      return res.end();
    }

    // Pipe Web Stream to Node writable stream
    const reader = mediaResponse.body.getReader();
    req.on('close', () => {
      reader.cancel().catch(() => {});
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.write(value)) {
        await new Promise((resolve) => res.once('drain', resolve));
      }
    }
    res.end();
  } catch (err: any) {
    console.error('Error streaming proxy media:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Streaming failed' });
    }
  }
});

// Vite or Static Serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
