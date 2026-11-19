import { resolveAssetUrl } from './canvasRenderer';

export type ElementKey =
  | 'Beat'
  | 'Beat/Chill'
  | 'Beat/Flow'
  | 'Beat/Rush'
  | 'Beat/Vibe'
  | 'Chill'
  | 'Chill/Beat'
  | 'Chill/Flow'
  | 'Chill/Rush'
  | 'Chill/Vibe'
  | 'Flow'
  | 'Flow/Beat'
  | 'Flow/Chill'
  | 'Flow/Rush'
  | 'Flow/Vibe'
  | 'Rush'
  | 'Rush/Beat'
  | 'Rush/Chill'
  | 'Rush/Flow'
  | 'Rush/Vibe'
  | 'Vibe'
  | 'Vibe/Beat'
  | 'Vibe/Chill'
  | 'Vibe/Flow'
  | 'Vibe/Rush';

export interface ElementAssetInfo {
  key: ElementKey;
  localPath: string;
  remoteUrl: string;
}

export const ELEMENT_ASSETS: Record<ElementKey, ElementAssetInfo> = {
  'Beat': {
    key: 'Beat',
    localPath: 'assets/elements/Beat.webp',
    remoteUrl: 'https://i.postimg.cc/sg1CpTDf/Beat.webp',
  },
  'Beat/Chill': {
    key: 'Beat/Chill',
    localPath: 'assets/elements/Beat-Chill.webp',
    remoteUrl: 'https://i.postimg.cc/0yr1pV2s/Beat-Chill.webp',
  },
  'Beat/Flow': {
    key: 'Beat/Flow',
    localPath: 'assets/elements/Beat-Flow.webp',
    remoteUrl: 'https://i.postimg.cc/1341pv5Z/Beat-Flow.webp',
  },
  'Beat/Rush': {
    key: 'Beat/Rush',
    localPath: 'assets/elements/Beat-Rush.webp',
    remoteUrl: 'https://i.postimg.cc/Hkj1Q6s1/Beat-Rush.webp',
  },
  'Beat/Vibe': {
    key: 'Beat/Vibe',
    localPath: 'assets/elements/Beat-Vibe.webp',
    remoteUrl: 'https://i.postimg.cc/W1tcM5bL/Beat-Vibe.webp',
  },
  'Chill': {
    key: 'Chill',
    localPath: 'assets/elements/Chill.webp',
    remoteUrl: 'https://i.postimg.cc/RZqxcgVM/Chill.webp',
  },
  'Chill/Beat': {
    key: 'Chill/Beat',
    localPath: 'assets/elements/Chill-Beat.webp',
    remoteUrl: 'https://i.postimg.cc/6pTxdM6P/Chill-Beat.webp',
  },
  'Chill/Flow': {
    key: 'Chill/Flow',
    localPath: 'assets/elements/Chill-Flow.webp',
    remoteUrl: 'https://i.postimg.cc/2S3N40jJ/Chill-Flow.webp',
  },
  'Chill/Rush': {
    key: 'Chill/Rush',
    localPath: 'assets/elements/Chill-Rush.webp',
    remoteUrl: 'https://i.postimg.cc/JztCbp7v/Chill-Rush.webp',
  },
  'Chill/Vibe': {
    key: 'Chill/Vibe',
    localPath: 'assets/elements/Chill-Vibe.webp',
    remoteUrl: 'https://i.postimg.cc/y8WCFL6r/Chill-Vibe.webp',
  },
  'Flow': {
    key: 'Flow',
    localPath: 'assets/elements/Flow.webp',
    remoteUrl: 'https://i.postimg.cc/RZqxcgVm/Flow.webp',
  },
  'Flow/Beat': {
    key: 'Flow/Beat',
    localPath: 'assets/elements/Flow-Beat.webp',
    remoteUrl: 'https://i.postimg.cc/bNmjD78f/Flow-Beat.webp',
  },
  'Flow/Chill': {
    key: 'Flow/Chill',
    localPath: 'assets/elements/Flow-Chill.webp',
    remoteUrl: 'https://i.postimg.cc/sDTRQkyF/Flow-Chill.webp',
  },
  'Flow/Rush': {
    key: 'Flow/Rush',
    localPath: 'assets/elements/Flow-Rush.webp',
    remoteUrl: 'https://i.postimg.cc/8PZVJ2DQ/Flow-Rush.webp',
  },
  'Flow/Vibe': {
    key: 'Flow/Vibe',
    localPath: 'assets/elements/Flow-Vibe.webp',
    remoteUrl: 'https://i.postimg.cc/8PZVJ2G2/Flow-Vibe.webp',
  },
  'Rush': {
    key: 'Rush',
    localPath: 'assets/elements/Rush.webp',
    remoteUrl: 'https://i.postimg.cc/t47GhBCp/Rush.webp',
  },
  'Rush/Beat': {
    key: 'Rush/Beat',
    localPath: 'assets/elements/Rush-Beat.webp',
    remoteUrl: 'https://i.postimg.cc/1341pv5x/Rush-Beat.webp',
  },
  'Rush/Chill': {
    key: 'Rush/Chill',
    localPath: 'assets/elements/Rush-Chill.webp',
    remoteUrl: 'https://i.postimg.cc/52jWws9h/Rush-Chill.webp',
  },
  'Rush/Flow': {
    key: 'Rush/Flow',
    localPath: 'assets/elements/Rush-Flow.webp',
    remoteUrl: 'https://i.postimg.cc/P5NnmSfB/Rush-Flow.webp',
  },
  'Rush/Vibe': {
    key: 'Rush/Vibe',
    localPath: 'assets/elements/Rush-Vibe.webp',
    remoteUrl: 'https://i.postimg.cc/4xnRzW4j/Rush-Vibe.webp',
  },
  'Vibe': {
    key: 'Vibe',
    localPath: 'assets/elements/Vibe.webp',
    remoteUrl: 'https://i.postimg.cc/6pTxdM5w/Vibe.webp',
  },
  'Vibe/Beat': {
    key: 'Vibe/Beat',
    localPath: 'assets/elements/Vibe-Beat.webp',
    remoteUrl: 'https://i.postimg.cc/GhX18WRV/Vibe-Beat.webp',
  },
  'Vibe/Chill': {
    key: 'Vibe/Chill',
    localPath: 'assets/elements/Vibe-Chill.webp',
    remoteUrl: 'https://i.postimg.cc/02VqMTvh/Vibe-Chill.webp',
  },
  'Vibe/Flow': {
    key: 'Vibe/Flow',
    localPath: 'assets/elements/Vibe-Flow.webp',
    remoteUrl: 'https://i.postimg.cc/xT6SJwQW/Vibe-Flow.webp',
  },
  'Vibe/Rush': {
    key: 'Vibe/Rush',
    localPath: 'assets/elements/Vibe-Rush.webp',
    remoteUrl: 'https://i.postimg.cc/9FLjR62k/Vibe-Rush.webp',
  },
};

export const ELEMENT_OPTIONS: ElementKey[] = Object.keys(ELEMENT_ASSETS) as ElementKey[];

/**
 * Normalizes raw Google Sheets Element text (e.g. "beat / chill", "Beat-Flow", "VIBE")
 * into a canonical ElementKey matching ELEMENT_ASSETS.
 */
export function normalizeElementKey(raw?: string | null): ElementKey | '' {
  if (!raw) return '';
  const cleaned = raw.trim();
  if (!cleaned || cleaned === '-') return '';

  const parts = cleaned
    .split(/[\s/|,+\-\\]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());

  if (parts.length === 0) return '';

  const candidate = parts.slice(0, 2).join('/') as ElementKey;
  if (candidate in ELEMENT_ASSETS) {
    return candidate;
  }

  // Fallback if single base element appears first
  const single = parts[0] as ElementKey;
  if (parts.length === 1 && single in ELEMENT_ASSETS) {
    return single;
  }

  return '';
}

/**
 * Resolves the local static image path for a given Element (ready for UI & future Canvas rendering).
 */
export function getElementImageUrl(raw?: string | null): string {
  const key = normalizeElementKey(raw);
  if (!key) return '';
  return resolveAssetUrl(ELEMENT_ASSETS[key].localPath);
}

/**
 * Returns the original remote fallback URL for a given Element.
 */
export function getElementFallbackUrl(raw?: string | null): string {
  const key = normalizeElementKey(raw);
  if (!key) return '';
  return ELEMENT_ASSETS[key].remoteUrl;
}
