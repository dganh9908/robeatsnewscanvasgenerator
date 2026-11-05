import { SongItem } from '../types';

/**
 * Robust CSV parser that handles:
 * - Multi-line fields
 * - Quotes inside values
 * - Commas within quotes (e.g. "Jump, Goober, Jump!!")
 * - Trailing empty lines
 */
export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        curr += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(curr.trim());
      curr = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i++;
      }
      row.push(curr.trim());
      if (row.some(c => c.length > 0)) {
        result.push(row);
      }
      row = [];
      curr = '';
    } else {
      curr += char;
    }
  }

  if (curr.length > 0 || row.length > 0) {
    row.push(curr.trim());
    if (row.some(c => c.length > 0)) {
      result.push(row);
    }
  }

  return result;
}

/**
 * Parses the raw Google Sheets / local CSV data into SongItem objects.
 * Format of sheet:
 * Row 0: Song title, Cover art, Artists, Difficulty,,, Element
 * Row 1: ,,, Easy, Normal, Hard,
 * Row 2+: song data...
 */
export function parseSongSheet(csvText: string): SongItem[] {
  const rows = parseCSV(csvText);
  if (!rows || rows.length < 2) return [];

  const songs: SongItem[] = [];

  // Determine starting row: row 0 or 1 might be headers
  let startIdx = 0;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const firstCell = (rows[i][0] || '').toLowerCase();
    if (firstCell.includes('song title') || firstCell.includes('title')) {
      startIdx = i + 1;
      // If the row after is subheaders (Easy, Normal, Hard)
      if (rows[startIdx] && rows[startIdx].some(c => /easy|normal|hard/i.test(c))) {
        startIdx++;
      }
      break;
    }
  }

  for (let i = startIdx; i < rows.length; i++) {
    const r = rows[i];
    const title = (r[0] || '').trim();
    if (!title) continue;

    const coverArtUrl = (r[1] || '').trim();
    const artist = (r[2] || '').trim();
    const diffEasy = (r[3] || '-').trim();
    const diffNormal = (r[4] || '-').trim();
    const diffHard = (r[5] || '-').trim();
    const element = (r[6] || '').trim();

    songs.push({
      id: `song-${i}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title,
      coverArtUrl,
      artist: artist || 'Unknown Artist',
      difficultyEasy: diffEasy,
      difficultyNormal: diffNormal,
      difficultyHard: diffHard,
      element,
    });
  }

  return songs;
}
