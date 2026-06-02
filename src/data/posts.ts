import type { Post } from '../types';

/* Add essays here and the "Writing" nav link + page light up automatically.
   Empty by default. A sample entry to copy:

   'designing-rag': {
     slug: 'designing-rag',
     title: 'Designing a RAG pipeline that actually cites its sources',
     date: 'Jun 2026',
     read: '8 min',
     tag: 'Systems',
     body: [
       'Paragraph one…',
       'Paragraph two…',
     ],
   },
*/

export const POSTS: Record<string, Post> = {};

export const POST_ORDER: string[] = [];

export const hasPosts = (): boolean => POST_ORDER.length > 0;
