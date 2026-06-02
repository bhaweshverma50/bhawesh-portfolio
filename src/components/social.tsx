import { SOCIALS } from '../config/site';

/** A single social link — renders nothing if that profile URL isn't configured
 *  (so there are never dead "#" links). */
export function SocialLink({ k }: { k: string }) {
  const s = SOCIALS.find((x) => x.key === k);
  if (!s || !s.url) return null;
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer">
      {s.label}
    </a>
  );
}
