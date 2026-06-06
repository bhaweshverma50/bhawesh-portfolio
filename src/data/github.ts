/* Open-source section. The contribution graph is pulled live from GitHub;
   these repo cards are curated (edit / reorder freely). */

export const GITHUB_USER = 'bhaweshverma50';

export interface Repo {
  name: string;
  desc: string;
  lang: string;
  stars: number;
  url: string;
}

const gh = (name: string) => `https://github.com/${GITHUB_USER}/${name}`;

export const REPOS: Repo[] = [
  { name: 'spacelens', desc: 'macOS disk analyzer: treemap Explorer, safe cleanup, local-AI recommendations.', lang: 'Swift', stars: 2, url: gh('spacelens') },
  { name: 'validatyr', desc: 'AI engine that scores and stress-tests app ideas before you build.', lang: 'Dart', stars: 0, url: gh('validatyr') },
  { name: 'beyond-bmi-poc', desc: 'AI 3D morphological health & longevity assessment POC.', lang: 'TypeScript', stars: 0, url: gh('beyond-bmi-poc') },
  { name: 'bill-split-ai-poc', desc: 'AI receipt scanner that auto-splits bills between friends using Gemini.', lang: 'TypeScript', stars: 0, url: gh('bill-split-ai-poc') },
  { name: 'patternflow-ai', desc: 'Turns AI fashion sketches into production-ready technical tech packs.', lang: 'TypeScript', stars: 0, url: gh('patternflow-ai') },
  { name: 'any-speak', desc: 'Offline-first, on-device speech translation for iOS.', lang: 'Swift', stars: 0, url: gh('any-speak') },
];
