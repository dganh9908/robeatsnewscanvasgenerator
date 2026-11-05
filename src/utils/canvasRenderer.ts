import { BannerConfig, SlotConfig } from '../types';

export const DEFAULT_BACKGROUND_URL = '/assets/aistudio/WeeklyMission_1e414277.png';

export const TEMPLATE_METRICS = {
  width: 1920,
  height: 1080,
  star: {
    cover: { x: 507, y: 361, w: 256, h: 256, radius: 20 },
    artist: { x: 635, y: 660, maxWidth: 360 },
    song: { x: 635, y: 708, maxWidth: 360 },
    score: { x: 775, y: 868, maxWidth: 300 },
  },
  pro: {
    cover: { x: 1301, y: 364, w: 256, h: 256, radius: 20 },
    artist: { x: 1429, y: 660, maxWidth: 360 },
    song: { x: 1429, y: 708, maxWidth: 360 },
    score: { x: 1525, y: 853, maxWidth: 300 },
  },
  poster: {
    // In WeeklyMission, POSTER: is pre-printed at ~1526-1630.
    // The open space for custom name is centered at 1765, y: 1022.
    x: 1765,
    y: 1022,
    maxWidth: 240,
    fullPillX: 1680,
    fullPillY: 1022,
  },
};

const imageCache = new Map<string, HTMLImageElement>();

export async function loadImage(src: string): Promise<HTMLImageElement> {
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
      if (src.startsWith('http') && !src.includes('/api/proxy-image')) {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(src)}`;
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.onload = () => {
          imageCache.set(src, fallbackImg);
          resolve(fallbackImg);
        };
        fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${src}`));
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

/**
 * Draws cover art inside the slot box ensuring custom uploaded or URL images
 * fit precisely into the designated square frame.
 */
async function drawSlotCover(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number; radius: number },
  slot: SlotConfig
) {
  if (!slot.coverImage) return;

  try {
    const img = await loadImage(slot.coverImage);
    ctx.save();

    // Clip to rounded slot matching the card frame
    drawRoundedRect(ctx, box.x, box.y, box.w, box.h, box.radius);
    ctx.clip();

    const scale = slot.scale !== undefined && slot.scale !== null ? slot.scale : 0.9;
    const offsetX = slot.offsetX || 0;
    const offsetY = slot.offsetY || 0;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = box.w / box.h;

    let drawW = box.w;
    let drawH = box.h;

    if (slot.fit === 'contain') {
      if (imgRatio > boxRatio) {
        drawW = box.w * scale;
        drawH = (box.w / imgRatio) * scale;
      } else {
        drawH = box.h * scale;
        drawW = box.h * imgRatio * scale;
      }
    } else if (slot.fit === 'cover') {
      if (imgRatio > boxRatio) {
        drawH = box.h * scale;
        drawW = box.h * imgRatio * scale;
      } else {
        drawW = box.w * scale;
        drawH = (box.w / imgRatio) * scale;
      }
    } else {
      drawW = box.w * scale;
      drawH = box.h * scale;
    }

    const drawX = box.x + (box.w - drawW) / 2 + offsetX;
    const drawY = box.y + (box.h - drawH) / 2 + offsetY;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    ctx.restore();

    // Inner glossy specular accent
    ctx.save();
    drawRoundedRect(ctx, box.x, box.y, box.w, box.h, box.radius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(box.x + 35, box.y + 25, 22, 10, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fill();
    ctx.restore();
  } catch (err) {
    console.warn('Failed to draw cover image for slot:', err);
  }
}

/**
 * Draws single-line text with Righteous font
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
  } = options;

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  let currentSize = fontSize;
  ctx.font = `bold ${currentSize}px 'Righteous', cursive, sans-serif`;
  let measured = ctx.measureText(text).width;

  if (maxWidth && measured > maxWidth) {
    currentSize = Math.max(14, Math.floor(fontSize * (maxWidth / measured)));
    ctx.font = `bold ${currentSize}px 'Righteous', cursive, sans-serif`;
  }

  // Shadow
  ctx.fillStyle = shadowColor;
  ctx.fillText(text, x + 2, y + 4);

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
 * Multiline text renderer:
 * Wraps if text is too long or splits by manual newlines (\n),
 * while maintaining centered formatting for every line!
 */
function drawMultilineRighteousText(
  ctx: CanvasRenderingContext2D,
  rawText: string,
  centerX: number,
  centerY: number,
  options: {
    fontSize: number;
    maxWidth: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    lineHeightFactor?: number;
  }
) {
  if (!rawText) return;

  const {
    fontSize,
    maxWidth,
    fillColor = '#fed835',
    strokeColor = '#1e1335',
    strokeWidth = 6,
    lineHeightFactor = 1.15,
  } = options;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.font = `bold ${fontSize}px 'Righteous', cursive, sans-serif`;

  const rawParagraphs = rawText.split('\n');
  const lines: string[] = [];

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (ctx.measureText(trimmed).width <= maxWidth) {
      lines.push(trimmed);
      continue;
    }

    const words = trimmed.split(/\s+/);
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(currentLine);
        currentLine = words[n];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  if (lines.length === 0) {
    ctx.restore();
    return;
  }

  let finalFontSize = fontSize;
  if (lines.length > 2) {
    finalFontSize = Math.max(16, Math.floor(fontSize * 0.85));
    ctx.font = `bold ${finalFontSize}px 'Righteous', cursive, sans-serif`;
  }

  const lineHeight = finalFontSize * lineHeightFactor;
  const totalBlockHeight = (lines.length - 1) * lineHeight;
  const startY = centerY - totalBlockHeight / 2;

  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText(line, centerX + 2, y + 4);

    // Stroke
    if (strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeText(line, centerX, y);
    }

    // Fill
    ctx.fillStyle = fillColor;
    ctx.fillText(line, centerX, y);
  });

  ctx.restore();
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

  // 2. Load and draw the unified WeeklyMission default background
  const bgSrc = config.backgroundUrl || DEFAULT_BACKGROUND_URL;

  try {
    const bgImg = await loadImage(bgSrc);
    ctx.drawImage(bgImg, 0, 0, baseW, baseH);
  } catch (err) {
    console.error('Failed to load background template:', err);
    ctx.fillStyle = '#2d1b54';
    ctx.fillRect(0, 0, baseW, baseH);
  }

  // 3. Draw Star Slot Cover Art
  await drawSlotCover(ctx, metrics.star.cover, config.starSlot);

  // 4. Draw Pro Slot Cover Art
  await drawSlotCover(ctx, metrics.pro.cover, config.proSlot);

  // 5. Draw Star Artist Name (No parentheses + manual offset + per-slot size/color)
  const starArtist = config.starSlot.artist || '';
  const starStrokeWidth = config.starSlot.strokeWidth !== undefined ? config.starSlot.strokeWidth : (config.strokeWidth ?? 6);
  drawRighteousText(
    ctx,
    starArtist,
    metrics.star.artist.x + (config.starSlot.artistOffsetX || 0),
    metrics.star.artist.y + (config.starSlot.artistOffsetY || 0),
    {
      fontSize: config.starSlot.artistFontSize || config.artistFontSize || 28,
      maxWidth: metrics.star.artist.maxWidth,
      fillColor: config.starSlot.textColor || config.textColor || '#fed835',
      strokeColor: config.strokeColor,
      strokeWidth: starStrokeWidth,
    }
  );

  // 6. Draw Star Song Name (No parentheses + multiline + manual offset + per-slot size/color)
  const starSong = config.starSlot.songName || '';
  drawMultilineRighteousText(
    ctx,
    starSong,
    metrics.star.song.x + (config.starSlot.songOffsetX || 0),
    metrics.star.song.y + (config.starSlot.songOffsetY || 0),
    {
      fontSize: config.starSlot.songFontSize || config.songFontSize || 34,
      maxWidth: metrics.star.song.maxWidth,
      fillColor: config.starSlot.textColor || config.textColor || '#fed835',
      strokeColor: config.strokeColor,
      strokeWidth: starStrokeWidth,
    }
  );

  // 7. Draw Star Score inside pill (with per-slot font color, size, stroke width)
  if (config.starSlot.score) {
    drawRighteousText(
      ctx,
      config.starSlot.score,
      metrics.star.score.x,
      metrics.star.score.y,
      {
        fontSize: config.starSlot.scoreFontSize || config.scoreFontSize || 34,
        maxWidth: metrics.star.score.maxWidth,
        fillColor: config.starSlot.scoreColor || config.textColor || '#fed835',
        strokeColor: config.strokeColor,
        strokeWidth: starStrokeWidth > 0 ? Math.min(starStrokeWidth, 8) : 0,
      }
    );
  }

  // 8. Draw Pro Artist Name (No parentheses + manual offset + per-slot size/color)
  const proArtist = config.proSlot.artist || '';
  const proStrokeWidth = config.proSlot.strokeWidth !== undefined ? config.proSlot.strokeWidth : (config.strokeWidth ?? 6);
  drawRighteousText(
    ctx,
    proArtist,
    metrics.pro.artist.x + (config.proSlot.artistOffsetX || 0),
    metrics.pro.artist.y + (config.proSlot.artistOffsetY || 0),
    {
      fontSize: config.proSlot.artistFontSize || config.artistFontSize || 28,
      maxWidth: metrics.pro.artist.maxWidth,
      fillColor: config.proSlot.textColor || config.textColor || '#fed835',
      strokeColor: config.strokeColor,
      strokeWidth: proStrokeWidth,
    }
  );

  // 9. Draw Pro Song Name (No parentheses + multiline + manual offset + per-slot size/color)
  const proSong = config.proSlot.songName || '';
  drawMultilineRighteousText(
    ctx,
    proSong,
    metrics.pro.song.x + (config.proSlot.songOffsetX || 0),
    metrics.pro.song.y + (config.proSlot.songOffsetY || 0),
    {
      fontSize: config.proSlot.songFontSize || config.songFontSize || 34,
      maxWidth: metrics.pro.song.maxWidth,
      fillColor: config.proSlot.textColor || config.textColor || '#fed835',
      strokeColor: config.strokeColor,
      strokeWidth: proStrokeWidth,
    }
  );

  // 10. Draw Pro Score inside pill (with per-slot font color, size, stroke width)
  if (config.proSlot.score) {
    drawRighteousText(
      ctx,
      config.proSlot.score,
      metrics.pro.score.x,
      metrics.pro.score.y,
      {
        fontSize: config.proSlot.scoreFontSize || config.scoreFontSize || 34,
        maxWidth: metrics.pro.score.maxWidth,
        fillColor: config.proSlot.scoreColor || config.textColor || '#fed835',
        strokeColor: config.strokeColor,
        strokeWidth: proStrokeWidth > 0 ? Math.min(proStrokeWidth, 8) : 0,
      }
    );
  }

  // 11. Draw Poster text: Yellow color, black outline, manual offset
  if (config.poster) {
    const rawPoster = config.poster.trim();
    const hasPrefix = rawPoster.toLowerCase().startsWith('poster:');
    const displayText = hasPrefix ? rawPoster : rawPoster;

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
        fillColor: config.posterTextColor || '#fed835', // Yellow text
        strokeColor: config.posterStrokeColor || '#000000', // Black outline
        strokeWidth: 4,
        shadowColor: '#000000', // Black shadow
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
