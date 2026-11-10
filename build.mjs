import { rmSync, mkdirSync, cpSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const out = 'dist';
if (!existsSync('src/index.html')) { console.error('src/index.html missing'); process.exit(1); }
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync('src', out, { recursive: true });

// Cloudflare Pages extras
import { writeFileSync } from 'node:fs';
writeFileSync(join(out, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/brand/*\n  Cache-Control: public, max-age=31536000, immutable\n');
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');

let n = 0, bytes = 0;
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else { n++; bytes += statSync(p).size; } } })(out);
console.log(`dist/ ready: ${n} files, ${(bytes / 1024).toFixed(0)} KiB`);
