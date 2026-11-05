import { SongItem } from '../types';
import { parseSongSheet } from './csvParser';

export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1xfDC6nqXEO2hfWPV3zopZu4A-Vz40de3p9zNuks43i0/edit';
const LOCAL_CSV_FALLBACK = '/assets/aistudio/song_l_t_1987c8ec';
const CACHE_KEY = 'rhythm_songs_cache_v1';
const CACHE_TIME_KEY = 'rhythm_songs_cache_time_v1';

export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export function getSheetCsvUrl(sheetUrlOrId: string): string {
  const id = extractSheetId(sheetUrlOrId) || sheetUrlOrId;
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;
}

/**
 * Fetches songs with a multi-tier fallback:
 * 1. Live Google Sheets via gviz/tq endpoint
 * 2. Server proxy /api/songs
 * 3. Local cached data in localStorage
 * 4. Bundled local CSV file (/assets/aistudio/song_l_t_1987c8ec)
 */
export async function fetchSongs(sheetUrl: string = DEFAULT_SHEET_URL): Promise<{ songs: SongItem[]; source: 'live' | 'cache' | 'local'; timestamp: Date }> {
  const csvUrl = getSheetCsvUrl(sheetUrl);

  // 1. Try direct fetch from Google Sheets
  try {
    const res = await fetch(csvUrl, { cache: 'no-cache' });
    if (res.ok) {
      const text = await res.text();
      const songs = parseSongSheet(text);
      if (songs.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(songs));
          localStorage.setItem(CACHE_TIME_KEY, new Date().toISOString());
        } catch {
          // ignore quota error
        }
        return { songs, source: 'live', timestamp: new Date() };
      }
    }
  } catch (err) {
    console.warn('Direct Google Sheet fetch failed, trying proxy...', err);
  }

  // 2. Try proxy /api/songs
  try {
    const res = await fetch(`/api/songs?url=${encodeURIComponent(sheetUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.songs && data.songs.length > 0) {
        return { songs: data.songs, source: 'live', timestamp: new Date(data.timestamp || Date.now()) };
      }
    }
  } catch {
    // continue to cache
  }

  // 3. Try cached in localStorage
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as SongItem[];
      if (parsed.length > 0) {
        return { songs: parsed, source: 'cache', timestamp: cachedTime ? new Date(cachedTime) : new Date() };
      }
    }
  } catch {
    // continue to bundled
  }

  // 4. Fallback to bundled local CSV file
  try {
    const res = await fetch(LOCAL_CSV_FALLBACK);
    if (res.ok) {
      const text = await res.text();
      const songs = parseSongSheet(text);
      return { songs, source: 'local', timestamp: new Date() };
    }
  } catch (err) {
    console.error('Failed to load bundled fallback song list:', err);
  }

  return { songs: [], source: 'local', timestamp: new Date() };
}
