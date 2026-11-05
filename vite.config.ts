import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function rhythmApiPlugin(): Plugin {
  return {
    name: 'rhythm-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // 1. /api/songs endpoint
        if (req.url.startsWith('/api/songs')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const targetUrl = urlObj.searchParams.get('url') || 'https://docs.google.com/spreadsheets/d/1xfDC6nqXEO2hfWPV3zopZu4A-Vz40de3p9zNuks43i0/edit';
            
            // Extract sheet ID
            const match = targetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            const sheetId = match ? match[1] : '1xfDC6nqXEO2hfWPV3zopZu4A-Vz40de3p9zNuks43i0';
            const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

            let csvText = '';
            let source = 'live';

            try {
              const fetchRes = await fetch(gvizUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
              if (fetchRes.ok) {
                csvText = await fetchRes.text();
              }
            } catch (e) {
              console.warn('Backend fetch from Google Sheets failed, using local file:', e);
            }

            if (!csvText || csvText.length < 50) {
              // fallback to local file
              const localPath = path.resolve(__dirname, 'public/assets/aistudio/song_l_t_1987c8ec');
              if (fs.existsSync(localPath)) {
                csvText = fs.readFileSync(localPath, 'utf8');
                source = 'local_file';
              }
            }

            // Simple line-based/quote CSV parser
            const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
            const songs = [];
            
            // Detect start index of song items (header might be 1 or 2 rows)
            let startIdx = 1;
            if (lines.length > 1) {
              const line1Lower = lines[1].toLowerCase();
              if (line1Lower.includes('easy') || line1Lower.includes('normal') || line1Lower.includes('hard') || line1Lower.startsWith(',,,')) {
                startIdx = 2;
              }
            }
            
            for (let i = startIdx; i < lines.length; i++) {
              const line = lines[i];
              // Match CSV items allowing quotes
              const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
              const matches = [];
              let m;
              while ((m = regex.exec(line)) !== null) {
                if (m.index === regex.lastIndex) regex.lastIndex++;
                let val = m[1] || '';
                if (val.startsWith('"') && val.endsWith('"')) {
                  val = val.substring(1, val.length - 1).replace(/""/g, '"');
                }
                matches.push(val.trim());
              }

              const title = matches[0] || '';
              if (!title) continue;

              songs.push({
                id: `song-${i}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                title,
                coverArtUrl: matches[1] || '',
                artist: matches[2] || 'Unknown Artist',
                difficultyEasy: matches[3] || '-',
                difficultyNormal: matches[4] || '-',
                difficultyHard: matches[5] || '-',
                element: matches[6] || '',
              });
            }

            res.end(JSON.stringify({
              success: true,
              totalSongs: songs.length,
              source,
              timestamp: new Date().toISOString(),
              songs,
            }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
            return;
          }
        }

        // 2. /api/proxy-image endpoint (to prevent canvas tainting for external cover URLs)
        if (req.url.startsWith('/api/proxy-image')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const targetUrl = urlObj.searchParams.get('url');

            if (!targetUrl || !targetUrl.startsWith('http')) {
              res.statusCode = 400;
              res.end('Missing or invalid url param');
              return;
            }

            const imgRes = await fetch(targetUrl);
            if (!imgRes.ok) {
              res.statusCode = imgRes.status;
              res.end('Failed to fetch image');
              return;
            }

            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=86400');

            const buffer = await imgRes.arrayBuffer();
            res.end(Buffer.from(buffer));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.end('Proxy image error: ' + err.message);
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), rhythmApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

