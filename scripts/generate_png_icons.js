import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlineWidth = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineWidth);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * (isMaskable ? 0.42 : 0.46);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineWidth;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep dark blue / slate background
      let r = 9;
      let g = 13;
      let b = 22;
      let a = 255;

      // Subtle cyan/blue gradient glow
      const gradT = (x + y) / (width + height);
      r = Math.round(9 + gradT * 5);
      g = Math.round(13 + gradT * 25);
      b = Math.round(22 + gradT * 40);

      // Concentric glowing ring
      if (dist < rOuter && dist > rOuter - (width * 0.04)) {
        r = 6;
        g = 182;
        b = 212;
      }

      // Center Download Icon Symbol
      const normalizedX = (x - cx) / (width * 0.35);
      const normalizedY = (y - cy) / (height * 0.35);

      // Arrow stem: vertical bar (-0.1 to 0.1, y: -0.6 to 0.1)
      const inStem = Math.abs(normalizedX) < 0.12 && normalizedY >= -0.55 && normalizedY <= 0.1;
      // Arrow head: triangle pointing down
      const inArrow = normalizedY > 0.05 && normalizedY < 0.45 && Math.abs(normalizedX) <= (0.45 - normalizedY);
      // Tray bar: y in 0.3 to 0.45, x in -0.5 to 0.5
      const inTray = normalizedY >= 0.35 && normalizedY <= 0.48 && Math.abs(normalizedX) <= 0.6;

      if (inStem || inArrow) {
        // Bright cyan/blue
        r = 6;
        g = 210;
        b = 240;
      } else if (inTray) {
        r = 56;
        g = 189;
        b = 248;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));

console.log('Generated PNG icons successfully.');
