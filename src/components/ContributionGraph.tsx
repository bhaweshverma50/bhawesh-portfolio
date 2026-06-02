import { useEffect, useState } from 'react';

interface Day {
  level: 0 | 1 | 2 | 3 | 4;
}

/** Live GitHub contribution heatmap — pulled from a public, no-auth API and
 *  rendered into the site's own grid. Fails silently (renders nothing) if the
 *  request can't complete, so it never breaks the page. */
export function ContributionGraph({ user }: { user: string }) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { contributions?: Day[]; total?: { lastYear?: number } }) => {
        if (!alive) return;
        setDays(j.contributions ?? []);
        setTotal(j.total?.lastYear ?? null);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [user]);

  if (failed) return null;

  // render a base grid while loading, then the real levels
  const cells = days ?? Array.from({ length: 52 * 7 }, () => ({ level: 0 as const }));

  return (
    <>
      <div className="contrib reveal reveal-d1" aria-hidden="true">
        {cells.map((d, i) => (
          <i key={i} className={d.level ? `l${d.level}` : undefined} />
        ))}
      </div>
      {total != null && (
        <p className="eyebrow" style={{ marginTop: 20 }}>
          {total.toLocaleString()} contributions in the last year
        </p>
      )}
    </>
  );
}
