/* ============================================================
   IDENTITY + CONTACT — edit everything about "you" here.
   Blank socials auto-hide (no dead links); project repo cards
   and the résumé button read from this file too.
   ============================================================ */

export const SITE = {
  name: 'Bhawesh Verma',
  /** used for the nav brand + the big hero word */
  firstName: 'Bhawesh',
  role: 'Senior Software Engineer',
  /** browser tab / share title for the home page */
  title: 'Bhawesh Verma | Senior Software Engineer',
  email: 'bhaweshverma50@gmail.com',
  phone: '+91 70045 89471', // stored for reference; not rendered by default
  location: 'Bangalore, India',
  /** © year shown in the footer */
  year: '2026',
  /** Real file in /public — the Download Résumé button serves this; blank → generated text fallback */
  resumeUrl: '/Bhawesh-Verma-Resume.pdf',
} as const;

export interface Social {
  key: string;
  label: string;
  url: string;
}

/** Order here = order rendered. Entries with an empty `url` are hidden. */
export const SOCIALS: Social[] = [
  { key: 'github', label: 'GitHub', url: 'https://github.com/bhaweshverma50' },
  { key: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/bhaweshverma50' },
  { key: 'twitter', label: 'Twitter / X', url: 'https://x.com/binaryBits101' },
  { key: 'readcv', label: 'Read.cv', url: '' },
];

export const githubBase = (): string => {
  const gh = SOCIALS.find((s) => s.key === 'github')?.url ?? '';
  return gh.replace(/\/+$/, '');
};
