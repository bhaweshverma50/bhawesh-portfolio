import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRenderer } from '../src/lib/posts/markdown';
import { parseLocalPost } from '../src/lib/posts/local';
import { fetchDevtoPosts } from '../src/lib/posts/devto';
import { mergePosts } from '../src/lib/posts/merge';
import { serializeGenerated } from '../src/lib/posts/codegen';
import { SOURCES } from '../src/data/sources';
import type { Post } from '../src/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(root, 'content/posts');
const OUT = join(root, 'src/data/posts.generated.ts');
const localOnly = process.argv.includes('--local-only');

async function main() {
  const renderer = await createRenderer();
  const lists: Post[][] = [];

  // Local markdown (canonical, trusted)
  const local: Post[] = [];
  if (existsSync(POSTS_DIR)) {
    const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const { post } = await parseLocalPost(f, await readFile(join(POSTS_DIR, f), 'utf8'), renderer);
      if (post) local.push(post);
    }
  }
  lists.push(local);
  console.log(`[posts] local: ${local.length}`);

  // Remote sources (best-effort — never fail the build)
  if (!localOnly) {
    for (const s of SOURCES) {
      try {
        if (s.type === 'devto') {
          const r = await fetchDevtoPosts(s.user, renderer);
          lists.push(r);
          console.log(`[posts] devto(${s.user}): ${r.length}`);
        }
        // hashnode / medium adapters: TODO
      } catch (err) {
        console.warn(`[posts] ${s.type} fetch failed — skipping:`, (err as Error).message);
      }
    }
  }

  const { posts, order } = mergePosts(lists);
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, serializeGenerated(posts, order), 'utf8');
  console.log(`[posts] wrote ${order.length} post(s) -> ${OUT}${localOnly ? ' (local-only)' : ''}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
