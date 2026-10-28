// Vercel-only adapter. Keep vite.config.ts unchanged for Cloudflare Workers.
// Vinext requires Nitro to create Vercel-compatible server routes, rather than
// deploying the Cloudflare Worker bundle as a static Vite project.
//
// Vercel project configuration:
//   Install: npm ci && npm install --no-save --package-lock=false nitro@3.0.260903-beta
//   Build:   npx vite build --config vite.vercel.config.mjs
//   Output:  .output
//   Preset:  NITRO_PRESET=vercel (Nitro should also auto-detect Vercel CI)
import { defineConfig } from 'vite';
import vinext from 'vinext';
import { nitro } from 'nitro/vite';
import tailwindcss from '@tailwindcss/postcss';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const academyDbPath = fileURLToPath(
  new URL('./lib/academy-db.ts', import.meta.url),
).replaceAll('\\', '/');

export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [
    {
      name: 'academy-vercel-storage-adapter',
      enforce: 'pre',
      load(id) {
        if (id.split('?')[0].replaceAll('\\', '/') === academyDbPath) {
          return readFileSync(
            new URL('./lib/academy-db-vercel.ts', import.meta.url),
            'utf8',
          );
        }
      },
    },
    vinext(),
    nitro(),
  ],
});
