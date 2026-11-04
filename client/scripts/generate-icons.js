import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.resolve(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Generate High-Res SVG for 512x512 and 192x192
function createSvgIcon(isMaskable = false) {
  const bgRadius = isMaskable ? '0' : '112';
  const transform = isMaskable
    ? 'translate(56, 56) scale(0.78)'
    : 'translate(15, 15) scale(0.94)';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="60%" stop-color="#FFF3E8" />
      <stop offset="100%" stop-color="#FFE4D6" />
    </linearGradient>

    <!-- Glass Fill Gradient -->
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.85)" />
      <stop offset="35%" stop-color="rgba(240, 248, 255, 0.55)" />
      <stop offset="100%" stop-color="rgba(255, 240, 245, 0.70)" />
    </linearGradient>

    <!-- Cork Lid Gradient -->
    <linearGradient id="corkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D9A882" />
      <stop offset="50%" stop-color="#C89772" />
      <stop offset="100%" stop-color="#B2825E" />
    </linearGradient>

    <!-- Cork Rim Gradient -->
    <linearGradient id="rimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#C69570" />
      <stop offset="100%" stop-color="#A77754" />
    </linearGradient>

    <!-- Soft Drop Shadow -->
    <filter id="jarShadow" x="-20%" y="-15%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#8A4A3B" flood-opacity="0.16" />
    </filter>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="${bgRadius}" fill="url(#bgGrad)" />
  ${!isMaskable ? '<rect x="4" y="4" width="504" height="504" rx="108" fill="none" stroke="#FCE7F3" stroke-width="4" />' : ''}

  <g transform="${transform}">
    <!-- Shadow beneath Jar -->
    <ellipse cx="256" cy="454" rx="124" ry="22" fill="#D97706" opacity="0.14" />
    <ellipse cx="256" cy="454" rx="88" ry="14" fill="#92400E" opacity="0.10" />

    <!-- Ambient Sparkles -->
    <g fill="#F59E0B">
      <!-- Top Left Sparkle -->
      <path d="M106 142 Q106 158 90 158 Q106 158 106 174 Q106 158 122 158 Q106 158 106 142Z" fill="#F59E0B" />
      <circle cx="82" cy="188" r="4.5" fill="#EC4899" opacity="0.8" />
      <!-- Top Right Sparkle -->
      <path d="M404 126 Q404 146 384 146 Q404 146 404 166 Q404 146 424 146 Q404 146 404 126Z" fill="#EC4899" />
      <circle cx="432" cy="180" r="5" fill="#F59E0B" opacity="0.8" />
      <!-- Bottom Sparkle -->
      <circle cx="98" cy="380" r="4" fill="#A855F7" opacity="0.7" />
      <path d="M414 360 Q414 372 402 372 Q414 372 414 384 Q414 372 426 372 Q414 372 414 360Z" fill="#F59E0B" />
    </g>

    <!-- Main Glass Jar Body with Shadow -->
    <g filter="url(#jarShadow)">
      <!-- Glass Body Silhouette -->
      <path d="M172 168 C172 154 184 144 198 144 H314 C328 144 340 154 340 168 V190 C364 206 378 234 378 268 V384 C378 424 344 456 304 456 H208 C168 456 134 424 134 384 V268 C134 234 148 206 172 190 Z"
            fill="url(#glassGrad)"
            stroke="#F472B6"
            stroke-width="7" />
    </g>

    <!-- Paper Chits Layer Inside the Jar -->
    <g id="folded-chits">
      <!-- Chit 1: Pastel Pink (bottom-left) -->
      <path d="M168 392 L220 374 L244 416 L192 432 Z" fill="#FFB3C6" stroke="#FFA3B8" stroke-width="2" />
      <path d="M192 432 L220 374 L204 404 Z" fill="#FFA3B8" opacity="0.5" />

      <!-- Chit 2: Pastel Yellow (bottom-center) -->
      <path d="M224 402 L288 386 L306 430 L242 444 Z" fill="#FFE66D" stroke="#FAD850" stroke-width="2" />
      <path d="M266 394 L276 436" stroke="#FAD850" stroke-width="2" stroke-dasharray="2 3" />

      <!-- Chit 3: Soft Lavender (bottom-right) -->
      <path d="M284 376 L342 388 L330 434 L272 420 Z" fill="#D0BCFE" stroke="#C0A8FD" stroke-width="2" />
      <path d="M284 376 L308 426 L342 388 Z" fill="#C0A8FD" opacity="0.4" />

      <!-- Chit 4: Mint Green (mid-tier left) -->
      <path d="M164 340 L218 322 L240 364 L186 380 Z" fill="#D8F3DC" stroke="#B7E4C7" stroke-width="2" />
      <path d="M186 380 L218 322 L202 352 Z" fill="#B7E4C7" opacity="0.5" />

      <!-- Chit 5: Light Blue (mid-tier center-right) -->
      <path d="M228 344 L294 330 L312 376 L246 388 Z" fill="#A9DEF9" stroke="#90D3F7" stroke-width="2" />
      <path d="M228 344 L270 382 L294 330 Z" fill="#90D3F7" opacity="0.4" />

      <!-- Chit 6: Soft Peach (top tier, slightly angled) -->
      <path d="M202 292 L266 280 L282 328 L218 338 Z" fill="#FFD7BA" stroke="#FEC5A6" stroke-width="2" />
      <path d="M234 286 L250 334" stroke="#FEC5A6" stroke-width="2" stroke-dasharray="3 3" />

      <!-- Chit 7: Rose Folded Origami Note (center attraction) -->
      <path d="M246 296 L310 306 L298 350 L234 338 Z" fill="#FFCAD4" stroke="#FFAFB9" stroke-width="2" />
    </g>

    <!-- Glass Inner Specular Highlights & Glare -->
    <!-- Left vertical curve highlight -->
    <path d="M156 260 C154 310 156 360 168 410" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.75" />
    <path d="M170 250 C168 280 170 310 178 350" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.55" />
    <!-- Bottom base rim highlight -->
    <path d="M200 442 C236 448 276 448 312 442" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.6" />
    <!-- Right subtle rim sheen -->
    <path d="M356 260 C358 310 356 360 344 406" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.4" />

    <!-- Twine String around Jar Neck -->
    <path d="M182 178 Q256 186 330 178" stroke="#9A6B43" stroke-width="6" stroke-linecap="round" />
    <path d="M184 184 Q256 192 328 184" stroke="#7A502D" stroke-width="4" stroke-linecap="round" />

    <!-- Hanging Kraft Tag with Heart -->
    <g transform="translate(254, 184) rotate(14)">
      <!-- String down to tag -->
      <line x1="0" y1="0" x2="16" y2="34" stroke="#9A6B43" stroke-width="3.5" />
      <!-- Kraft Tag Body -->
      <path d="M2 32 L30 32 L38 52 L20 84 L-6 64 Z" fill="#ECCBB0" stroke="#A77855" stroke-width="2.5" />
      <!-- Tag Eyelet -->
      <circle cx="16" cy="40" r="3.5" fill="#7A502D" />
      <!-- Cute Pink Heart on Tag -->
      <path d="M16 66 L12 62 C6 56 4 52 4 48 C4 44 7 41 11 41 C13.5 41 15 42 16 43.5 C17 42 18.5 41 21 41 C25 41 28 44 28 48 C28 52 26 56 20 62 Z" fill="#E11D48" />
    </g>

    <!-- Cork Wooden Lid -->
    <!-- Cork Lip / Rim -->
    <rect x="176" y="132" width="160" height="22" rx="8" fill="url(#rimGrad)" stroke="#7A502D" stroke-width="2" />
    <!-- Cork Main Stopper -->
    <path d="M194 92 C194 84 202 78 212 78 H300 C310 78 318 84 318 92 V134 H194 Z" fill="url(#corkGrad)" stroke="#7A502D" stroke-width="2" />
    <!-- Cork Wood Texture lines -->
    <line x1="216" y1="94" x2="236" y2="94" stroke="#8F5E3B" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    <line x1="270" y1="102" x2="296" y2="102" stroke="#8F5E3B" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    <line x1="230" y1="116" x2="258" y2="116" stroke="#8F5E3B" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    <line x1="202" y1="143" x2="310" y2="143" stroke="#FFE4D6" stroke-width="2" opacity="0.4" />
  </g>
</svg>`;
}

// 2. Pure Node.js PNG Generator
// Writes true RGBA PNG files using zlib deflate
function createCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf, offset, length) {
  let c = 0xFFFFFFFF;
  for (let i = offset; i < offset + length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data ? data.length : 0;
  const chunk = Buffer.alloc(12 + len);

  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  if (data && len > 0) {
    data.copy(chunk, 8);
  }

  const crcData = Buffer.concat([typeBuf, data || Buffer.alloc(0)]);
  const crcVal = crc32(crcData, 0, crcData.length);
  chunk.writeUInt32BE(crcVal, 8 + len);

  return chunk;
}

function encodePng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // deflate
  ihdr.writeUInt8(0, 11); // standard filter
  ihdr.writeUInt8(0, 12); // no interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0x00 at start of each line
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rawOffset = y * (1 + width * 4);
    rawScanlines[rawOffset] = 0; // Filter: None
    rgbaBuffer.copy(
      rawScanlines,
      rawOffset + 1,
      y * width * 4,
      (y + 1) * width * 4
    );
  }

  // Deflate IDAT
  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 3. Procedural Rasterizer for Memory Jar Icon
function renderMemoryJarRaster(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);

  // Helper pixel setter with alpha blending
  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    if (a >= 255) {
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = 255;
    } else if (a > 0) {
      const srcA = a / 255;
      const dstA = buf[idx + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA > 0) {
        buf[idx] = Math.round((r * srcA + buf[idx] * dstA * (1 - srcA)) / outA);
        buf[idx + 1] = Math.round((g * srcA + buf[idx + 1] * dstA * (1 - srcA)) / outA);
        buf[idx + 2] = Math.round((b * srcA + buf[idx + 2] * dstA * (1 - srcA)) / outA);
        buf[idx + 3] = Math.round(outA * 255);
      }
    }
  }

  const cornerRadius = isMaskable ? 0 : Math.round(size * 0.22);
  const cx = size / 2;
  const cy = size / 2;

  // Background gradient: Warm cream #FFFDF9 to #FFE4D6
  for (let y = 0; y < size; y++) {
    const t = y / size;
    const bgR = Math.round(255 * (1 - t) + 255 * t);
    const bgG = Math.round(253 * (1 - t) + 228 * t);
    const bgB = Math.round(249 * (1 - t) + 214 * t);

    for (let x = 0; x < size; x++) {
      if (!isMaskable && cornerRadius > 0) {
        // Rounded corner check
        let inCorner = false;
        let dist = 0;
        if (x < cornerRadius && y < cornerRadius) {
          dist = Math.hypot(x - cornerRadius, y - cornerRadius);
          inCorner = true;
        } else if (x > size - cornerRadius && y < cornerRadius) {
          dist = Math.hypot(x - (size - cornerRadius), y - cornerRadius);
          inCorner = true;
        } else if (x < cornerRadius && y > size - cornerRadius) {
          dist = Math.hypot(x - cornerRadius, y - (size - cornerRadius));
          inCorner = true;
        } else if (x > size - cornerRadius && y > size - cornerRadius) {
          dist = Math.hypot(x - (size - cornerRadius), y - (size - cornerRadius));
          inCorner = true;
        }

        if (inCorner) {
          if (dist > cornerRadius) continue; // transparent outside rounded box
          const edgeAlpha = Math.min(1, Math.max(0, cornerRadius - dist + 1));
          setPixel(x, y, bgR, bgG, bgB, Math.round(edgeAlpha * 255));
          continue;
        }
      }
      setPixel(x, y, bgR, bgG, bgB, 255);
    }
  }

  // Draw Cute Memory Jar inside
  const s = isMaskable ? 0.72 : 0.88;
  const jarW = Math.round(size * 0.44 * s);
  const jarH = Math.round(size * 0.58 * s);
  const jarX = Math.round(cx - jarW / 2);
  const jarY = Math.round(cy - jarH * 0.40);
  const jarR = Math.round(jarW * 0.38);

  // Soft Jar Base Shadow
  const shadowY = jarY + jarH;
  for (let dy = -Math.round(size * 0.04); dy <= Math.round(size * 0.04); dy++) {
    for (let dx = -jarW * 0.65; dx <= jarW * 0.65; dx++) {
      const d = Math.hypot(dx / (jarW * 0.65), dy / (size * 0.04));
      if (d <= 1) {
        setPixel(
          Math.round(cx + dx),
          Math.round(shadowY + dy),
          168, 70, 30,
          Math.round((1 - d) * 36)
        );
      }
    }
  }

  // Jar Glass Body
  for (let y = jarY; y <= jarY + jarH; y++) {
    for (let x = jarX; x <= jarX + jarW; x++) {
      let inside = false;
      // Neck region
      if (y < jarY + jarH * 0.22) {
        const neckW = jarW * 0.66;
        if (Math.abs(x - cx) <= neckW / 2) inside = true;
      } else {
        // Main rounded bottle body
        const by = y - (jarY + jarH - jarR);
        if (by > 0) {
          if (x < jarX + jarR) {
            inside = Math.hypot(x - (jarX + jarR), by) <= jarR;
          } else if (x > jarX + jarW - jarR) {
            inside = Math.hypot(x - (jarX + jarW - jarR), by) <= jarR;
          } else {
            inside = true;
          }
        } else {
          inside = true;
        }
      }

      if (inside) {
        // Soft Glass Tint & Glare
        const fy = (y - jarY) / jarH;
        let gR = 245, gG = 248, gB = 255, gA = 160;

        // Soft pink glass reflection at bottom
        if (fy > 0.65) {
          gR = 255; gG = 230; gB = 240; gA = 180;
        }
        setPixel(x, y, gR, gG, gB, gA);

        // Glass Border Pink Sheen
        const isBorder = (
          x <= jarX + 3 || x >= jarX + jarW - 3 ||
          y >= jarY + jarH - 3
        );
        if (isBorder) {
          setPixel(x, y, 244, 114, 182, 220); // Pink border #F472B6
        }
      }
    }
  }

  // Draw Colorful Pastel Paper Chits inside the glass body
  const chitPalette = [
    [255, 179, 198], // Pink #FFB3C6
    [255, 230, 109], // Yellow #FFE66D
    [208, 188, 254], // Lavender #D0BCFE
    [216, 243, 220], // Mint #D8F3DC
    [169, 222, 249], // Blue #A9DEF9
    [255, 215, 186], // Peach #FFD7BA
  ];

  const chitOffsets = [
    { dx: -0.22, dy: 0.82, w: 0.38, h: 0.18, color: chitPalette[0] },
    { dx: 0.08, dy: 0.84, w: 0.40, h: 0.18, color: chitPalette[1] },
    { dx: -0.16, dy: 0.68, w: 0.36, h: 0.17, color: chitPalette[2] },
    { dx: 0.14, dy: 0.69, w: 0.38, h: 0.17, color: chitPalette[3] },
    { dx: -0.05, dy: 0.54, w: 0.36, h: 0.16, color: chitPalette[4] },
    { dx: 0.12, dy: 0.48, w: 0.34, h: 0.15, color: chitPalette[5] },
  ];

  chitOffsets.forEach(({ dx, dy, w, h, color }) => {
    const cw = Math.round(jarW * w);
    const ch = Math.round(jarH * h);
    const cx0 = Math.round(cx + jarW * dx - cw / 2);
    const cy0 = Math.round(jarY + jarH * dy - ch / 2);

    for (let cy = cy0; cy < cy0 + ch; cy++) {
      for (let cx1 = cx0; cx1 < cx0 + cw; cx1++) {
        // Draw folded rounded note
        if (Math.hypot((cx1 - (cx0 + cw / 2)) / (cw / 2), (cy - (cy0 + ch / 2)) / (ch / 2)) <= 1) {
          setPixel(cx1, cy, color[0], color[1], color[2], 240);
        }
      }
    }
  });

  // Front Specular Glare (Curve on left)
  const glareX = Math.round(jarX + jarW * 0.14);
  const glareH = Math.round(jarH * 0.52);
  for (let gy = 0; gy < glareH; gy++) {
    const y = Math.round(jarY + jarH * 0.32 + gy);
    const x = glareX + Math.round(Math.sin(gy / glareH * Math.PI) * 4);
    setPixel(x, y, 255, 255, 255, 200);
    setPixel(x + 1, y, 255, 255, 255, 210);
    setPixel(x + 2, y, 255, 255, 255, 170);
  }

  // Wooden / Cork Lid
  const lidW = Math.round(jarW * 0.72);
  const lidH = Math.round(jarH * 0.18);
  const lidX = Math.round(cx - lidW / 2);
  const lidY = Math.round(jarY - lidH * 0.65);

  for (let ly = lidY; ly < lidY + lidH; ly++) {
    for (let lx = lidX; lx < lidX + lidW; lx++) {
      // Rounded cork top
      if (Math.abs(lx - cx) <= lidW / 2) {
        const isHighlight = (ly === lidY + 1 || lx === lidX + 1);
        if (isHighlight) {
          setPixel(lx, ly, 225, 185, 150, 255);
        } else {
          setPixel(lx, ly, 200, 151, 114, 255); // Cork #C89772
        }
      }
    }
  }

  // Cork Neck Ring Lip
  const lipW = Math.round(jarW * 0.84);
  const lipH = Math.round(jarH * 0.08);
  const lipX = Math.round(cx - lipW / 2);
  const lipY = Math.round(lidY + lidH - 2);

  for (let ly = lipY; ly < lipY + lipH; ly++) {
    for (let lx = lipX; lx < lipX + lipW; lx++) {
      setPixel(lx, ly, 178, 128, 92, 255); // Darker cork #B2805C
    }
  }

  // Hanging Red/Pink Heart Charm
  const heartCx = Math.round(cx + jarW * 0.22);
  const heartCy = Math.round(jarY + jarH * 0.28);
  const hr = Math.round(size * 0.04 * s);

  for (let dy = -hr; dy <= hr * 1.5; dy++) {
    for (let dx = -hr * 1.2; dx <= hr * 1.2; dx++) {
      const x0 = dx / hr;
      const y0 = dy / hr;
      // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const inHeart = Math.pow(x0 * x0 + y0 * y0 - 1, 3) - x0 * x0 * Math.pow(y0, 3) <= 0;
      if (inHeart) {
        setPixel(Math.round(heartCx + dx), Math.round(heartCy + dy), 244, 63, 94, 245); // Rose Heart
      }
    }
  }

  // Golden Twine String
  for (let tx = Math.round(cx - jarW * 0.36); tx <= Math.round(cx + jarW * 0.36); tx++) {
    const ty = Math.round(lipY + lipH + 1);
    setPixel(tx, ty, 154, 107, 67, 240);
  }

  // Floating Golden & Pink Sparkles
  const sparkles = [
    { x: cx - size * 0.32, y: cy - size * 0.22, r: 245, g: 158, b: 11 },
    { x: cx + size * 0.34, y: cy - size * 0.20, r: 236, g: 72, b: 153 },
    { x: cx + size * 0.32, y: cy + size * 0.22, r: 245, g: 158, b: 11 },
  ];

  sparkles.forEach((sp) => {
    const sr = Math.round(size * 0.035 * s);
    for (let dy = -sr; dy <= sr; dy++) {
      for (let dx = -sr; dx <= sr; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= sr) {
          setPixel(Math.round(sp.x + dx), Math.round(sp.y + dy), sp.r, sp.g, sp.b, 230);
        }
      }
    }
  });

  return encodePng(size, size, buf);
}

// Write All SVG Icons
console.log('Generating SVG icons...');
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), createSvgIcon(false), 'utf8');
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), createSvgIcon(false), 'utf8');
fs.writeFileSync(path.join(iconsDir, 'maskable-icon.svg'), createSvgIcon(true), 'utf8');
fs.writeFileSync(path.resolve(__dirname, '../public/favicon.svg'), createSvgIcon(false), 'utf8');

// Write All PNG Icons
console.log('Generating PNG icons...');
const png192 = renderMemoryJarRaster(192, false);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);
console.log('✓ icon-192.png generated (' + png192.length + ' bytes)');

const png512 = renderMemoryJarRaster(512, false);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);
console.log('✓ icon-512.png generated (' + png512.length + ' bytes)');

const pngMaskable = renderMemoryJarRaster(512, true);
fs.writeFileSync(path.join(iconsDir, 'maskable-icon.png'), pngMaskable);
console.log('✓ maskable-icon.png generated (' + pngMaskable.length + ' bytes)');

console.log('All icons generated successfully!');
