import type { Post } from '../types';
import { GENERATED_POSTS, GENERATED_ORDER } from './posts.generated';

/* Posts are generated at build time from content/posts/*.md and any configured
   remote SOURCES. To add a post: drop a markdown file in content/posts/ and run
   `npm run posts` (auto-runs on dev/build). The "Writing" nav link + page light
   up automatically when at least one post exists. */

export const POSTS: Record<string, Post> = GENERATED_POSTS;
export const POST_ORDER: string[] = GENERATED_ORDER;
export const hasPosts = (): boolean => POST_ORDER.length > 0;
