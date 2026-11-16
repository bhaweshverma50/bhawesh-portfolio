// Production server for Cloud Run: serves the Vite build and the contact API.
// Zero dependencies. Node 24 runs api/contact.ts directly (type stripping), so
// the same file still deploys as a Vercel function.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import contact from './api/contact.ts';

const ROOT = join(import.meta.dirname, 'dist');
const PORT = Number(process.env.PORT) || 8080;
const MAX_BODY = 20_000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt', '.xml', '.webmanifest']);

// ponytail: files are read per request; the OS page cache makes that cheap at
// portfolio traffic. Preload into memory if it ever matters.
async function readStatic(pathname) {
  let rel;
  try {
    rel = normalize(decodeURIComponent(pathname));
  } catch {
    return null;
  }
  const file = join(ROOT, rel);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null; // path traversal
  for (const candidate of [file, join(file, 'index.html')]) {
    try {
      return { file: candidate, body: await readFile(candidate) };
    } catch {
      // not a file (missing, or a directory): try the next candidate
    }
  }
  return null;
}

function send(req, res, status, file, body) {
  const ext = extname(file);
  res.statusCode = status;
  res.setHeader('Content-Type', TYPES[ext] ?? 'application/octet-stream');
  // Vite's hashed bundles never change; everything else must revalidate.
  res.setHeader(
    'Cache-Control',
    file.startsWith(join(ROOT, 'assets') + sep) ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate'
  );
  if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
    body = gzipSync(body);
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
  }
  res.setHeader('Content-Length', body.length);
  res.end(req.method === 'HEAD' ? undefined : body);
}

async function handleContact(req, res) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) {
      res.writeHead(413, { 'Content-Type': 'application/json' }).end('{"error":"Message too large"}');
      return;
    }
  }
  let body = {};
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' }).end('{"error":"Invalid JSON"}');
      return;
    }
  }
  // The Vercel-style (req, res) shape the handler expects.
  const out = {
    status(code) {
      res.statusCode = code;
      return out;
    },
    setHeader(key, value) {
      res.setHeader(key, value);
      return out;
    },
    json(value) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(value));
    },
  };
  await contact({ method: req.method, body }, out);
}

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://x');
    if (pathname === '/api/contact') return await handleContact(req, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const hit = await readStatic(pathname);
    if (hit) return send(req, res, 200, hit.file, hit.body);
    // Client-side routes (/work, /project/:slug, …): the app renders them,
    // including its own not-found page.
    const index = join(ROOT, 'index.html');
    return send(req, res, 200, index, await readFile(index));
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500).end();
  }
}).listen(PORT, () => console.log(`listening on :${PORT}`));
