export type DifficultyTier = 'Easy' | 'Normal' | 'Hard';

export interface SongItem {
  id: string;
  title: string;
  coverArtUrl: string;
  artist: string;
  difficultyEasy: string;
  difficultyNormal: string;
  difficultyHard: string;
  element: string;
}

export interface SlotConfig {
  coverImage: string; // URL, data URL, or object URL
  artist: string;
  songName: string;
  score: string;
  element?: string;
  difficultyTier?: DifficultyTier;
  difficultyLevel?: string;
  sheetDiffEasy?: string;
  sheetDiffNormal?: string;
  sheetDiffHard?: string;
  scale: number; // default 1.0
  offsetX: number;
  offsetY: number;
  fit: 'cover' | 'contain' | 'fill';
  selectedSongId?: string;
  artistOffsetX?: number;
  artistOffsetY?: number;
  songOffsetX?: number;
  songOffsetY?: number;
  artistFontSize?: number;
  songFontSize?: number;
  textColor?: string;
  scoreColor?: string;
  scoreFontSize?: number;
  strokeWidth?: number;
}

export interface LeaderboardSlotConfig {
  coverImage: string;
  artist: string;
  songName: string;
  element: string;
  difficultyTier: DifficultyTier;
  difficultyLevel: string;
  sheetDiffEasy?: string;
  sheetDiffNormal?: string;
  sheetDiffHard?: string;
  scale: number;
  offsetX: number;
  offsetY: number;
  fit: 'cover' | 'contain' | 'fill';
  selectedSongId?: string;
  artistOffsetX?: number;
  artistOffsetY?: number;
  songOffsetX?: number;
  songOffsetY?: number;
  difficultyOffsetX?: number;
  difficultyOffsetY?: number;
  artistFontSize?: number;
  songFontSize?: number;
  difficultyFontSize?: number;
  artistTextColor?: string;
  textColor?: string;
  strokeWidth?: number;
}

export interface BannerConfig {
  backgroundUrl: string; // Default: /assets/aistudio/WeeklyMission__5__7e00c34b.png
  category: string; // "Weekly Missions & Leaderboard"
  starSlot: SlotConfig;
  proSlot: SlotConfig;
  leaderboardSlots: LeaderboardSlotConfig[]; // 8 Weekly Leaderboard songs
  poster: string; // e.g. "meelo"
  posterPrefix: string; // "POSTER: "
  posterOffsetX?: number;
  posterOffsetY?: number;

  // Text styling overrides
  fontFamily: string; // "Righteous"
  textColor: string; // "#fed835"
  strokeColor: string; // "#1e1335"
  strokeWidth: number; // 6
  artistFontSize: number; // 28
  songFontSize: number; // 34
  scoreFontSize: number; // 34
  posterFontSize: number; // 24
  posterTextColor: string; // "#fed835" (Yellow)
  posterStrokeColor: string; // "#000000" (Black)

  // Export resolution
  exportScale: 1 | 1.3333 | 2; // 1080p, 1440p 2K, 2160p 4K
  exportFormat: 'image/png' | 'image/jpeg' | 'image/webp';
  exportQuality: number;
}

export interface SheetSyncState {
  sheetUrl: string;
  lastSynced: Date | null;
  isLoading: boolean;
  error: string | null;
  totalSongs: number;
}
