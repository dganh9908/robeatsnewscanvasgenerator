import { BannerConfig, DifficultyTier, LeaderboardSlotConfig, SlotConfig } from '../types';
import { getElementFallbackUrl, getElementImageUrl } from './elementAssets';
import { getDifficultyFrameFallbackUrl, getDifficultyFrameUrl } from './frameAssets';

export const resolveAssetUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const base = import.meta.env.BASE_URL || './';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};

export const DEFAULT_BACKGROUND_URL = resolveAssetUrl('assets/aistudio/WeeklyMission__5__7e00c34b.png');

export const TEMPLATE_METRICS = {
  width: 1920,
  height: 1080,
  star: {
    cover: { x: 305, y: 410, w: 183, h: 183, radius: 0 },
    artist: { x: 531, y: 423, maxWidth: 385, align: 'left' as CanvasTextAlign },
    song: { x: 534, y: 487, maxWidth: 382, align: 'left' as CanvasTextAlign },
    difficulty: { x: 532, y: 517, maxWidth: 384, align: 'left' as CanvasTextAlign },
    score: { x: 696, y: 576, maxWidth: 268, align: 'center' as CanvasTextAlign },
    // Yellow vertical divider is at x=934; Star score pill top pink border is at y=540
    bounds: { right: 916, top: 402, bottom: 533 },
  },
  pro: {
    cover: { x: 308, y: 709, w: 184, h: 185, radius: 0 },
    artist: { x: 540, y: 724, maxWidth: 376, align: 'left' as CanvasTextAlign },
    song: { x: 544, y: 795, maxWidth: 372, align: 'left' as CanvasTextAlign },
    difficulty: { x: 537, y: 826, maxWidth: 379, align: 'left' as CanvasTextAlign },
    score: { x: 697, y: 879, maxWidth: 268, align: 'center' as CanvasTextAlign },
    // Yellow vertical divider is at x=934; Pro score pill top pink border is at y=844
    bounds: { right: 916, top: 702, bottom: 837 },
  },
  leaderboard: [
    // Column 1 (Slots 1-4 top to bottom) — right bound stops cleanly before Column 2 pink box borders
    {
      cover: { x: 991, y: 317, w: 115, h: 115, radius: 0 },
      artist: { x: 1134, y: 333, maxWidth: 240 },
      song: { x: 1138, y: 371, maxWidth: 236 },
      difficulty: { x: 1146, y: 408, maxWidth: 228 },
      bounds: { right: 1374, top: 310, bottom: 452 },
    },
    {
      cover: { x: 1000, y: 467, w: 115, h: 115, radius: 0 },
      artist: { x: 1144, y: 487, maxWidth: 236 },
      song: { x: 1148, y: 525, maxWidth: 232 },
      difficulty: { x: 1156, y: 564, maxWidth: 224 },
      bounds: { right: 1380, top: 462, bottom: 606 },
    },
    {
      cover: { x: 1006, y: 621, w: 115, h: 115, radius: 0 },
      artist: { x: 1152, y: 641, maxWidth: 234 },
      song: { x: 1156, y: 679, maxWidth: 230 },
      difficulty: { x: 1160, y: 716, maxWidth: 226 },
      bounds: { right: 1386, top: 616, bottom: 760 },
    },
    {
      cover: { x: 1012, y: 774, w: 115, h: 115, radius: 0 },
      artist: { x: 1154, y: 794, maxWidth: 238 },
      song: { x: 1158, y: 832, maxWidth: 234 },
      difficulty: { x: 1166, y: 869, maxWidth: 226 },
      bounds: { right: 1392, top: 770, bottom: 912 },
    },
    // Column 2 (Slots 5-8 top to bottom) — right bound stops cleanly before the tilted right yellow frame border
    {
      cover: { x: 1398, y: 304, w: 115, h: 115, radius: 0 },
      artist: { x: 1547, y: 323, maxWidth: 285 },
      song: { x: 1551, y: 361, maxWidth: 281 },
      difficulty: { x: 1555, y: 398, maxWidth: 277 },
      bounds: { right: 1832, top: 300, bottom: 452 },
    },
    {
      cover: { x: 1404, y: 467, w: 115, h: 115, radius: 0 },
      artist: { x: 1554, y: 487, maxWidth: 286 },
      song: { x: 1558, y: 525, maxWidth: 282 },
      difficulty: { x: 1562, y: 562, maxWidth: 278 },
      bounds: { right: 1840, top: 462, bottom: 606 },
    },
    {
      cover: { x: 1410, y: 624, w: 115, h: 115, radius: 0 },
      artist: { x: 1562, y: 644, maxWidth: 285 },
      song: { x: 1566, y: 682, maxWidth: 281 },
      difficulty: { x: 1570, y: 719, maxWidth: 277 },
      bounds: { right: 1847, top: 618, bottom: 760 },
    },
    {
      cover: { x: 1416, y: 775, w: 115, h: 115, radius: 0 },
      artist: { x: 1572, y: 795, maxWidth: 283 },
      song: { x: 1576, y: 833, maxWidth: 279 },
      difficulty: { x: 1580, y: 870, maxWidth: 275 },
      bounds: { right: 1855, top: 770, bottom: 912 },
    },
  ],
  poster: {
    // In WeeklyMission, POSTER: is pre-printed at 1381..1506
    // The open space for custom name is centered at 1710, y: 1010.
    x: 1710,
    y: 1010,
    maxWidth: 360,
    fullPillX: 1640,
    fullPillY: 1010,
  },
};

const imageCache = new Map<string, HTMLImageElement>();

export async function loadImage(rawSrc: string, fallbackSrc?: string): Promise<HTMLImageElement> {
  const src = resolveAssetUrl(rawSrc);

  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) return cached;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };

    img.onerror = () => {
      // If a secondary fallback URL was provided (e.g. remote postimg fallback for local asset)
      if (fallbackSrc && fallbackSrc !== src) {
        loadImage(fallbackSrc).then(resolve).catch(reject);
        return;
      }

      // If external image fails (e.g. strict CORS), try server proxy or static CDN fallback
      if (src.startsWith('http')) {
        const tryStaticCdnFallback = () => {
          const cdnUrl = `https://images.weserv.nl/?url=${encodeURIComponent(src)}`;
          const cdnImg = new Image();
          cdnImg.crossOrigin = 'anonymous';
          cdnImg.onload = () => {
            imageCache.set(src, cdnImg);
            resolve(cdnImg);
          };
          cdnImg.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          cdnImg.src = cdnUrl;
        };

        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(src)}`;
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.onload = () => {
          imageCache.set(src, fallbackImg);
          resolve(fallbackImg);
        };
        fallbackImg.onerror = () => {
          tryStaticCdnFallback();
        };
        fallbackImg.src = proxyUrl;
      } else {
        reject(new Error(`Failed to load image: ${src}`));
      }
    };

    img.src = src;
  });
}

export async function ensureRighteousFont(): Promise<void> {
  try {
    await document.fonts.load('32px Righteous');
    await document.fonts.load('600 32px Righteous');
  } catch (err) {
    console.warn('Righteous font load check error:', err);
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
  ctx.closePath();
}

type CoverSlotLike = {
  coverImage: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  fit?: 'cover' | 'contain' | 'fill';
  difficultyTier?: DifficultyTier;
};

/**
 * Draws cover art auto-fitted cleanly to the slot frame (sharp square with radius: 0)
 * and overlays the Difficulty frame (Easy or Hard; none for Normal).
 */
async function drawSlotCover(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number; radius: number },
  slot: CoverSlotLike
) {
  // 1px bleed covers any anti-aliased green placeholder fringe inside the pink border
  const fx = box.x - 1;
  const fy = box.y - 1;
  const fw = box.w + 2;
  const fh = box.h + 2;

  if (slot.coverImage) {
    try {
      const img = await loadImage(slot.coverImage);
      ctx.save();

      // Clip to full slot frame (sharp square when radius is 0)
      if (box.radius > 0) {
        drawRoundedRect(ctx, fx, fy, fw, fh, box.radius);
      } else {
        ctx.beginPath();
        ctx.rect(fx, fy, fw, fh);
        ctx.closePath();
      }
      ctx.clip();

      const scale = Math.max(1, slot.scale !== undefined && slot.scale !== null ? slot.scale : 1);
      const offsetX = slot.offsetX || 0;
      const offsetY = slot.offsetY || 0;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = fw / fh;

      let drawW = fw;
      let drawH = fh;

      // Auto-fit cover mode fills the entire frame edge-to-edge without gaps
      if (slot.fit === 'contain') {
        if (imgRatio > boxRatio) {
          drawW = fw * scale;
          drawH = (fw / imgRatio) * scale;
        } else {
          drawH = fh * scale;
          drawW = fh * imgRatio * scale;
        }
      } else if (slot.fit === 'fill') {
        drawW = fw * scale;
        drawH = fh * scale;
      } else {
        // Default 'cover': automatically fits and fills the exact frame
        if (imgRatio > boxRatio) {
          drawH = fh * scale;
          drawW = fh * imgRatio * scale;
        } else {
          drawW = fw * scale;
          drawH = (fw / imgRatio) * scale;
        }
      }

      const drawX = fx + (fw - drawW) / 2 + offsetX;
      const drawY = fy + (fh - drawH) / 2 + offsetY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      ctx.restore();
    } catch (err) {
      console.warn('Failed to draw cover image for slot:', err);
    }
  }

  // Overlay Easy / Hard crystal difficulty frame if selected (Normal = no frame)
  const frameUrl = getDifficultyFrameUrl(slot.difficultyTier);
  if (frameUrl) {
    try {
      const frameImg = await loadImage(frameUrl, getDifficultyFrameFallbackUrl(slot.difficultyTier));
      ctx.save();
      if (box.radius > 0) {
        drawRoundedRect(ctx, fx, fy, fw, fh, box.radius);
      } else {
        ctx.beginPath();
        ctx.rect(fx, fy, fw, fh);
        ctx.closePath();
      }
      ctx.clip();
      ctx.drawImage(frameImg, fx, fy, fw, fh);
      ctx.restore();
    } catch (err) {
      console.warn('Failed to draw difficulty frame:', err);
    }
  }
}

/**
 * Draws the RoBeats Element .webp icon on the bottom-right corner of a cover box.
 */
async function drawElementBadge(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  element?: string,
  badgeSize: number = 48,
  bottomOffset: number = 9
) {
  const elementUrl = getElementImageUrl(element);
  if (!elementUrl) return;

  try {
    const img = await loadImage(elementUrl, getElementFallbackUrl(element));
    const centerX = box.x + box.w + 1;
    const centerY = box.y + box.h - bottomOffset;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    let drawW = badgeSize;
    let drawH = badgeSize;
    if (imgRatio > 1) {
      drawH = badgeSize / imgRatio;
    } else {
      drawW = badgeSize * imgRatio;
    }

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    ctx.restore();
  } catch (err) {
    console.warn('Failed to draw element badge:', err);
  }
}

/**
 * Splits text into wrapped lines that never exceed `maxWidth`.
 * Wraps naturally on word boundaries and cleanly breaks oversized unbroken tokens
 * so text wraps before colliding with nearby dividers, cover boxes, or borders.
 */
function wrapTextToLines(
  ctx: CanvasRenderingContext2D,
  rawText: string,
  maxWidth: number
): string[] {
  if (!rawText) return [];
  const safeMaxW = Math.max(40, maxWidth);
  const paragraphs = rawText.split('\n');
  const lines: string[] = [];

  const pushLongToken = (token: string) => {
    let chunk = '';
    for (const ch of token) {
      const test = chunk + ch;
      if (chunk && ctx.measureText(test).width > safeMaxW) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk = test;
      }
    }
    return chunk;
  };

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (ctx.measureText(trimmed).width <= safeMaxW) {
      lines.push(trimmed);
      continue;
    }

    const words = trimmed.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (!currentLine) {
        if (ctx.measureText(word).width <= safeMaxW) {
          currentLine = word;
        } else {
          currentLine = pushLongToken(word);
        }
        continue;
      }

      const candidate = `${currentLine} ${word}`;
      if (ctx.measureText(candidate).width <= safeMaxW) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        if (ctx.measureText(word).width <= safeMaxW) {
          currentLine = word;
        } else {
          currentLine = pushLongToken(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Draws pre-wrapped lines with Righteous font, stroke, and drop shadow.
 * `topY` is the top edge of the first line (drawn vertically centered inside each line box).
 */
function drawWrappedLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  firstLineCenterY: number,
  options: {
    fontSize: number;
    lineHeight: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    align?: CanvasTextAlign;
    shadowColor?: string;
    shadowOffsetY?: number;
  }
) {
  if (lines.length === 0) return;

  const {
    fontSize,
    lineHeight,
    fillColor = '#fed835',
    strokeColor = '#1e1335',
    strokeWidth = 6,
    align = 'left',
    shadowColor = 'rgba(0, 0, 0, 0.7)',
    shadowOffsetY = 3,
  } = options;

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.font = `bold ${fontSize}px 'Righteous', cursive, sans-serif`;

  lines.forEach((line, idx) => {
    const y = firstLineCenterY + idx * lineHeight;

    ctx.fillStyle = shadowColor;
    ctx.fillText(line, x + 2, y + shadowOffsetY);

    if (strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeText(line, x, y);
    }

    ctx.fillStyle = fillColor;
    ctx.fillText(line, x, y);
  });

  ctx.restore();
}

/**
 * Draws single-line text with Righteous font (used for Score pills, Poster, and DIFFICULTY labels)
 */
function drawRighteousText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize: number;
    maxWidth?: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    shadowColor?: string;
    shadowOffsetY?: number;
  }
) {
  if (!text) return;

  const {
    fontSize,
    maxWidth = 400,
    fillColor = '#fed835',
    strokeColor = '#1e1335',
    strokeWidth = 6,
    align = 'center',
    baseline = 'middle',
    shadowColor = 'rgba(0, 0, 0, 0.7)',
    shadowOffsetY = 3,
  } = options;

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  let currentSize = fontSize;
  ctx.font = `bold ${currentSize}px 'Righteous', cursive, sans-serif`;
  const measured = ctx.measureText(text).width;

  if (maxWidth && measured > maxWidth) {
    currentSize = Math.max(11, Math.floor(fontSize * (maxWidth / measured)));
    ctx.font = `bold ${currentSize}px 'Righteous', cursive, sans-serif`;
  }

  // Shadow
  ctx.fillStyle = shadowColor;
  ctx.fillText(text, x + 2, y + shadowOffsetY);

  // Outer stroke
  if (strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.strokeText(text, x, y);
  }

  // Inner fill
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);

  ctx.restore();
}

/**
 * Lays out and draws Star / Pro Mission Artist + Song + DIFFICULTY text with automatic
 * boundary-aware line wrapping and vertical collision avoidance against
 * the vertical yellow divider (right) and Score pill (bottom).
 */
function drawMissionTextBlock(
  ctx: CanvasRenderingContext2D,
  metric: typeof TEMPLATE_METRICS.star | typeof TEMPLATE_METRICS.pro,
  slot: SlotConfig,
  config: BannerConfig
) {
  const artistText = (slot.artist || '').trim();
  const songText = (slot.songName || '').trim();
  const diffVal = (slot.difficultyLevel || '').trim();
  const diffText = diffVal ? `DIFFICULTY: ${diffVal}` : '';

  const fillColor = slot.textColor || config.textColor || '#fed835';
  const strokeWidth = slot.strokeWidth !== undefined ? slot.strokeWidth : (config.strokeWidth ?? 6);
  const strokePad = Math.ceil(strokeWidth / 2) + 4;

  const baseArtistSize = slot.artistFontSize || config.artistFontSize || 27;
  const baseSongSize = slot.songFontSize || config.songFontSize || 35;
  const baseDiffSize = 21;

  const artistX = metric.artist.x + (slot.artistOffsetX || 0);
  const songX = metric.song.x + (slot.songOffsetX || 0);
  const diffX = metric.difficulty.x;
  const artistMaxW = Math.max(80, metric.bounds.right - artistX - strokePad);
  const songMaxW = Math.max(80, metric.bounds.right - songX - strokePad);
  const diffMaxW = Math.max(80, metric.bounds.right - diffX - strokePad);

  const maxAvailH = metric.bounds.bottom - metric.bounds.top;
  const lineFactor = 1.12;

  const measureLayout = (scale: number) => {
    const aSize = Math.max(14, Math.round(baseArtistSize * scale));
    const sSize = Math.max(16, Math.round(baseSongSize * scale));
    const dSize = Math.max(13, Math.round(baseDiffSize * scale));

    ctx.font = `bold ${aSize}px 'Righteous', cursive, sans-serif`;
    const aLines = wrapTextToLines(ctx, artistText, artistMaxW);

    ctx.font = `bold ${sSize}px 'Righteous', cursive, sans-serif`;
    const sLines = wrapTextToLines(ctx, songText, songMaxW);

    const aLH = aSize * lineFactor;
    const sLH = sSize * lineFactor;
    const dLH = diffText ? dSize * 1.1 : 0;

    const gap1 = aLines.length > 0 && sLines.length > 0 ? Math.max(5, Math.round(8 * scale)) : 0;
    const gap2 =
      (aLines.length > 0 || sLines.length > 0) && diffText
        ? Math.max(4, Math.round(7 * scale))
        : 0;
    const totalH = aLines.length * aLH + gap1 + sLines.length * sLH + gap2 + dLH;

    return { aSize, sSize, dSize, aLines, sLines, aLH, sLH, dLH, gap1, gap2, totalH };
  };

  let layout = measureLayout(1);

  // Fast path: single-line Artist & single-line Song stay at exact configured coordinates,
  // with DIFFICULTY cleanly positioned directly underneath Song Title
  if (layout.aLines.length <= 1 && layout.sLines.length <= 1) {
    if (layout.aLines.length === 1) {
      drawWrappedLines(ctx, layout.aLines, artistX, metric.artist.y + (slot.artistOffsetY || 0), {
        fontSize: layout.aSize,
        lineHeight: layout.aLH,
        fillColor,
        strokeColor: config.strokeColor,
        strokeWidth,
        align: metric.artist.align || 'left',
      });
    }
    const songCenterY = metric.song.y + (slot.songOffsetY || 0);
    if (layout.sLines.length === 1) {
      drawWrappedLines(ctx, layout.sLines, songX, songCenterY, {
        fontSize: layout.sSize,
        lineHeight: layout.sLH,
        fillColor,
        strokeColor: config.strokeColor,
        strokeWidth,
        align: metric.song.align || 'left',
      });
    }
    if (diffText) {
      const naturalDiffY = songCenterY + layout.sSize * 0.56 + layout.dSize * 0.58;
      const safeDiffY = Math.min(metric.bounds.bottom - layout.dSize * 0.5, Math.max(metric.difficulty.y, naturalDiffY));
      drawRighteousText(ctx, diffText, diffX, safeDiffY, {
        fontSize: layout.dSize,
        maxWidth: diffMaxW,
        fillColor,
        strokeColor: config.strokeColor,
        strokeWidth: Math.min(strokeWidth, 5),
        align: metric.difficulty.align || 'left',
        shadowOffsetY: 2,
      });
    }
    return;
  }

  // Wrapped multiline path: progressively scale down ONLY if vertical height would collide with Score pill
  let scale = 1;
  while (layout.totalH > maxAvailH && scale > 0.52) {
    scale = Number((scale - 0.06).toFixed(2));
    layout = measureLayout(scale);
  }

  const effectiveStroke = Math.max(0, Math.round(strokeWidth * Math.max(0.75, scale)));
  const blockStartY = metric.bounds.top + Math.max(0, (maxAvailH - layout.totalH) / 2);

  let cursorY = blockStartY;

  if (layout.aLines.length > 0) {
    const firstArtistY = cursorY + layout.aLH / 2 + (slot.artistOffsetY || 0);
    drawWrappedLines(ctx, layout.aLines, artistX, firstArtistY, {
      fontSize: layout.aSize,
      lineHeight: layout.aLH,
      fillColor,
      strokeColor: config.strokeColor,
      strokeWidth: effectiveStroke,
      align: metric.artist.align || 'left',
    });
    cursorY += layout.aLines.length * layout.aLH + layout.gap1;
  }

  if (layout.sLines.length > 0) {
    const firstSongY = cursorY + layout.sLH / 2 + (slot.songOffsetY || 0);
    drawWrappedLines(ctx, layout.sLines, songX, firstSongY, {
      fontSize: layout.sSize,
      lineHeight: layout.sLH,
      fillColor,
      strokeColor: config.strokeColor,
      strokeWidth: effectiveStroke,
      align: metric.song.align || 'left',
    });
    cursorY += layout.sLines.length * layout.sLH + layout.gap2;
  }

  if (diffText) {
    const diffCenterY = Math.min(metric.bounds.bottom - layout.dLH / 2, cursorY + layout.dLH / 2);
    drawRighteousText(ctx, diffText, diffX, diffCenterY, {
      fontSize: layout.dSize,
      maxWidth: diffMaxW,
      fillColor,
      strokeColor: config.strokeColor,
      strokeWidth: Math.min(effectiveStroke, 5),
      align: metric.difficulty.align || 'left',
      shadowOffsetY: 2,
    });
  }
}

async function drawLeaderboardSlot(
  ctx: CanvasRenderingContext2D,
  metric: (typeof TEMPLATE_METRICS.leaderboard)[number],
  slot: LeaderboardSlotConfig,
  config: BannerConfig
) {
  // 1. Cover Art + Easy/Hard Difficulty Frame
  await drawSlotCover(ctx, metric.cover, slot);

  // 2. Element icon at bottom-right corner of cover art
  await drawElementBadge(ctx, metric.cover, slot.element, 48, 9);

  const artistFillColor = slot.artistTextColor || '#ffffff';
  const fillColor = slot.textColor || config.textColor || '#fed835';
  const strokeWidth = slot.strokeWidth !== undefined ? slot.strokeWidth : 4;
  const strokePad = Math.ceil(strokeWidth / 2) + 3;

  const artistText = (slot.artist || '').trim();
  const songText = (slot.songName || '').trim();
  const diffVal = (slot.difficultyLevel || '').trim();
  const diffText = diffVal ? `DIFFICULTY: ${diffVal}` : '';

  const baseArtistSize = slot.artistFontSize || 20;
  const baseSongSize = slot.songFontSize || 21;
  const baseDiffSize = slot.difficultyFontSize || 18;

  const artistX = metric.artist.x + (slot.artistOffsetX || 0);
  const songX = metric.song.x + (slot.songOffsetX || 0);
  const diffX = metric.difficulty.x + (slot.difficultyOffsetX || 0);

  // Exact collision-safe horizontal widths before Col 2 pink borders (Col 1) or right yellow frame (Col 2)
  const artistMaxW = Math.max(70, metric.bounds.right - artistX - strokePad);
  const songMaxW = Math.max(70, metric.bounds.right - songX - strokePad);
  const diffMaxW = Math.max(70, metric.bounds.right - diffX - strokePad);

  const maxAvailH = metric.bounds.bottom - metric.bounds.top;
  const lineFactor = 1.12;

  const measureLayout = (scale: number) => {
    const aSize = Math.max(11, Math.round(baseArtistSize * scale));
    const sSize = Math.max(11, Math.round(baseSongSize * scale));
    const dSize = Math.max(11, Math.round(baseDiffSize * scale));

    ctx.font = `bold ${aSize}px 'Righteous', cursive, sans-serif`;
    const aLines = wrapTextToLines(ctx, artistText, artistMaxW);

    ctx.font = `bold ${sSize}px 'Righteous', cursive, sans-serif`;
    const sLines = wrapTextToLines(ctx, songText, songMaxW);

    const aLH = aSize * lineFactor;
    const sLH = sSize * lineFactor;
    const dLH = diffText ? dSize * 1.12 : 0;

    const gap1 = aLines.length > 0 && sLines.length > 0 ? Math.max(3, Math.round(6 * scale)) : 0;
    const gap2 =
      (aLines.length > 0 || sLines.length > 0) && diffText
        ? Math.max(3, Math.round(6 * scale))
        : 0;

    const totalH = aLines.length * aLH + gap1 + sLines.length * sLH + gap2 + dLH;
    return { aSize, sSize, dSize, aLines, sLines, aLH, sLH, dLH, gap1, gap2, totalH };
  };

  let layout = measureLayout(1);

  // Fast path: when both Artist and Song fit on 1 line, keep exact template Y positions
  if (layout.aLines.length <= 1 && layout.sLines.length <= 1) {
    if (layout.aLines.length === 1) {
      drawWrappedLines(ctx, layout.aLines, artistX, metric.artist.y + (slot.artistOffsetY || 0), {
        fontSize: layout.aSize,
        lineHeight: layout.aLH,
        fillColor: artistFillColor,
        strokeColor: config.strokeColor,
        strokeWidth,
        align: 'left',
        shadowOffsetY: 2,
      });
    }
    if (layout.sLines.length === 1) {
      drawWrappedLines(ctx, layout.sLines, songX, metric.song.y + (slot.songOffsetY || 0), {
        fontSize: layout.sSize,
        lineHeight: layout.sLH,
        fillColor,
        strokeColor: config.strokeColor,
        strokeWidth,
        align: 'left',
        shadowOffsetY: 2,
      });
    }
    if (diffText) {
      drawRighteousText(
        ctx,
        diffText,
        diffX,
        metric.difficulty.y + (slot.difficultyOffsetY || 0),
        {
          fontSize: layout.dSize,
          maxWidth: diffMaxW,
          fillColor,
          strokeColor: config.strokeColor,
          strokeWidth,
          align: 'left',
          shadowOffsetY: 2,
        }
      );
    }
    return;
  }

  // Wrapped multiline path: progressively fit vertically so rows never collide with each other
  let scale = 1;
  while (layout.totalH > maxAvailH && scale > 0.56) {
    scale = Number((scale - 0.06).toFixed(2));
    layout = measureLayout(scale);
  }

  const effectiveStroke = Math.max(0, Math.round(strokeWidth * Math.max(0.75, scale)));
  const blockStartY = metric.bounds.top + Math.max(0, (maxAvailH - layout.totalH) / 2);

  let cursorY = blockStartY;

  if (layout.aLines.length > 0) {
    const firstArtistY = cursorY + layout.aLH / 2 + (slot.artistOffsetY || 0);
    drawWrappedLines(ctx, layout.aLines, artistX, firstArtistY, {
      fontSize: layout.aSize,
      lineHeight: layout.aLH,
      fillColor: artistFillColor,
      strokeColor: config.strokeColor,
      strokeWidth: effectiveStroke,
      align: 'left',
      shadowOffsetY: 2,
    });
    cursorY += layout.aLines.length * layout.aLH + layout.gap1;
  }

  if (layout.sLines.length > 0) {
    const firstSongY = cursorY + layout.sLH / 2 + (slot.songOffsetY || 0);
    drawWrappedLines(ctx, layout.sLines, songX, firstSongY, {
      fontSize: layout.sSize,
      lineHeight: layout.sLH,
      fillColor,
      strokeColor: config.strokeColor,
      strokeWidth: effectiveStroke,
      align: 'left',
      shadowOffsetY: 2,
    });
    cursorY += layout.sLines.length * layout.sLH + layout.gap2;
  }

  if (diffText) {
    const diffCenterY = cursorY + layout.dLH / 2 + (slot.difficultyOffsetY || 0);
    drawRighteousText(ctx, diffText, diffX, diffCenterY, {
      fontSize: layout.dSize,
      maxWidth: diffMaxW,
      fillColor,
      strokeColor: config.strokeColor,
      strokeWidth: effectiveStroke,
      align: 'left',
      shadowOffsetY: 2,
    });
  }
}

/**
 * Main Canvas Render Function
 */
export async function renderBannerToCanvas(
  canvas: HTMLCanvasElement,
  config: BannerConfig,
  targetScale: number = 1
): Promise<void> {
  const metrics = TEMPLATE_METRICS;
  const baseW = metrics.width;
  const baseH = metrics.height;

  canvas.width = Math.round(baseW * targetScale);
  canvas.height = Math.round(baseH * targetScale);

  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.save();
  ctx.scale(targetScale, targetScale);

  // 1. Ensure Righteous font
  await ensureRighteousFont();

  // 2. Load and draw the unified WeeklyMission + Weekly Leaderboard background
  const bgSrc = config.backgroundUrl || DEFAULT_BACKGROUND_URL;

  try {
    const bgImg = await loadImage(bgSrc);
    ctx.drawImage(bgImg, 0, 0, baseW, baseH);
  } catch (err) {
    console.error('Failed to load background template:', err);
    ctx.fillStyle = '#2d1b54';
    ctx.fillRect(0, 0, baseW, baseH);
  }

  // 3. Draw Star Slot Cover Art (+ Easy/Hard frame) & bottom-right Element icon
  await drawSlotCover(ctx, metrics.star.cover, config.starSlot);
  await drawElementBadge(ctx, metrics.star.cover, config.starSlot.element, 68, 14);

  // 4. Draw Pro Slot Cover Art (+ Easy/Hard frame) & bottom-right Element icon
  await drawSlotCover(ctx, metrics.pro.cover, config.proSlot);
  await drawElementBadge(ctx, metrics.pro.cover, config.proSlot.element, 68, 14);

  // 5. Draw Star Artist + Song (boundary-aware auto-wrapping)
  const starStrokeWidth = config.starSlot.strokeWidth !== undefined ? config.starSlot.strokeWidth : (config.strokeWidth ?? 6);
  drawMissionTextBlock(ctx, metrics.star, config.starSlot, config);

  // 6. Draw Star Score inside pill
  if (config.starSlot.score) {
    drawRighteousText(
      ctx,
      config.starSlot.score,
      metrics.star.score.x,
      metrics.star.score.y,
      {
        fontSize: config.starSlot.scoreFontSize || config.scoreFontSize || 32,
        maxWidth: metrics.star.score.maxWidth,
        fillColor: config.starSlot.scoreColor || config.textColor || '#fed835',
        strokeColor: config.strokeColor,
        strokeWidth: starStrokeWidth > 0 ? Math.min(starStrokeWidth, 8) : 0,
        align: 'center',
      }
    );
  }

  // 7. Draw Pro Artist + Song (boundary-aware auto-wrapping)
  const proStrokeWidth = config.proSlot.strokeWidth !== undefined ? config.proSlot.strokeWidth : (config.strokeWidth ?? 6);
  drawMissionTextBlock(ctx, metrics.pro, config.proSlot, config);

  // 8. Draw Pro Score inside pill
  if (config.proSlot.score) {
    drawRighteousText(
      ctx,
      config.proSlot.score,
      metrics.pro.score.x,
      metrics.pro.score.y,
      {
        fontSize: config.proSlot.scoreFontSize || config.scoreFontSize || 32,
        maxWidth: metrics.pro.score.maxWidth,
        fillColor: config.proSlot.scoreColor || config.textColor || '#fed835',
        strokeColor: config.strokeColor,
        strokeWidth: proStrokeWidth > 0 ? Math.min(proStrokeWidth, 8) : 0,
        align: 'center',
      }
    );
  }

  // 9. Draw all 8 Weekly Leaderboard songs (Cover + Frame + Element + wrapped Artist/Song + Difficulty)
  const leaderboardSlots = config.leaderboardSlots || [];
  for (let i = 0; i < metrics.leaderboard.length; i++) {
    const lbSlot = leaderboardSlots[i];
    if (!lbSlot) continue;
    await drawLeaderboardSlot(ctx, metrics.leaderboard[i], lbSlot, config);
  }

  // 12. Draw Poster text: Yellow color, black outline, manual offset
  if (config.poster) {
    const rawPoster = config.poster.trim();
    const hasPrefix = rawPoster.toLowerCase().startsWith('poster:');
    const displayText = rawPoster;

    let targetX = metrics.poster.x;
    let targetY = metrics.poster.y;
    let maxW = metrics.poster.maxWidth;

    if (hasPrefix) {
      targetX = metrics.poster.fullPillX;
      targetY = metrics.poster.fullPillY;
      maxW = 380;
    }

    drawRighteousText(
      ctx,
      displayText,
      targetX + (config.posterOffsetX || 0),
      targetY + (config.posterOffsetY || 0),
      {
        fontSize: config.posterFontSize || 24,
        maxWidth: maxW,
        fillColor: config.posterTextColor || '#fed835',
        strokeColor: config.posterStrokeColor || '#000000',
        strokeWidth: 4,
        shadowColor: '#000000',
        align: 'center',
      }
    );
  }

  ctx.restore();
}

export async function downloadCanvasImage(
  canvas: HTMLCanvasElement,
  filename: string = 'weekly_mission_1920x1080.png',
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality: number = 0.95
): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      },
      format,
      quality
    );
  });
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}
