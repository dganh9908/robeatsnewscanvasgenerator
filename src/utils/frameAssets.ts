import { resolveAssetUrl } from './canvasRenderer';
import { DifficultyTier } from '../types';

export const DIFFICULTY_TIER_OPTIONS: DifficultyTier[] = ['Easy', 'Normal', 'Hard'];

export interface DifficultyFrameInfo {
  tier: DifficultyTier;
  localPath: string;
  remoteUrl: string;
}

export const DIFFICULTY_FRAME_ASSETS: Record<'Easy' | 'Hard', DifficultyFrameInfo> = {
  Easy: {
    tier: 'Easy',
    localPath: 'assets/frames/easy-frame.png',
    remoteUrl: 'https://i.postimg.cc/QdLZ4tXc/New-Project-2026-10-21T192423-682.png',
  },
  Hard: {
    tier: 'Hard',
    localPath: 'assets/frames/hard-frame.png',
    remoteUrl: 'https://i.postimg.cc/dVMcH1q8/New-Project-2026-10-21T192430-473.png',
  },
};

export function getDifficultyFrameUrl(tier?: DifficultyTier): string {
  if (!tier || tier === 'Normal') return '';
  return resolveAssetUrl(DIFFICULTY_FRAME_ASSETS[tier].localPath);
}

export function getDifficultyFrameFallbackUrl(tier?: DifficultyTier): string {
  if (!tier || tier === 'Normal') return '';
  return DIFFICULTY_FRAME_ASSETS[tier].remoteUrl;
}
