// Next's basePath config rewrites its own internal asset/script URLs automatically,
// but public/manifest.webmanifest and public/sw.js are copied into the export
// verbatim — they still need their root-relative paths prefixed by hand for a
// GitHub Pages project page (served under /<repo>/, not the domain root). A no-op
// when NEXT_PUBLIC_BASE_PATH isn't set, so Netlify/Vercel/local builds are untouched.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
if (!basePath) {
  console.log('patch-base-path: NEXT_PUBLIC_BASE_PATH not set, skipping.');
  process.exit(0);
}

const outDir = join(process.cwd(), 'out');

function prefixRootPaths(content) {
  // Rewrite quoted root-relative paths, e.g. "/icons/foo.png" or '/icons/foo.png'
  // -> .../listicles-party-game/icons/foo.png. Skips already-prefixed paths.
  return content.replace(/(["'])(\/[a-zA-Z0-9_\-./]*)\1/g, (match, quote, path) => {
    if (path.startsWith(basePath + '/') || path === basePath) return match;
    return `${quote}${basePath}${path}${quote}`;
  });
}

const manifestPath = join(outDir, 'manifest.webmanifest');
const manifest = prefixRootPaths(readFileSync(manifestPath, 'utf8'));
writeFileSync(manifestPath, manifest);

const swPath = join(outDir, 'sw.js');
const sw = prefixRootPaths(readFileSync(swPath, 'utf8'));
writeFileSync(swPath, sw);

console.log(`patch-base-path: prefixed manifest.webmanifest and sw.js with "${basePath}".`);
