import type { RouteKey } from '../types';

/** Map a router pathname to a logical route key (used for themes, titles, nav state). */
export function routeKeyOf(pathname: string): RouteKey {
  const p = pathname || '/';
  if (p === '/' || p === '') return 'home';
  if (p.startsWith('/project/')) return 'project';
  if (p.startsWith('/post/')) return 'post';
  if (p.startsWith('/work')) return 'work';
  if (p.startsWith('/blog')) return 'blog';
  if (p.startsWith('/contact')) return 'contact';
  return 'home';
}

export function slugOf(pathname: string): string | undefined {
  const m = pathname.match(/^\/(?:project|post)\/([^/]+)/);
  return m ? m[1] : undefined;
}
