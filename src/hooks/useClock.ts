import { useEffect, useState } from 'react';

/** Live IST clock. IST = UTC+5:30; Date.now() is a UTC epoch, so add 5.5h and read
 *  the UTC fields — correct for every viewer regardless of their own timezone. */
export function useClock(): string {
  const [time, setTime] = useState('— : — IST');
  useEffect(() => {
    const tick = () => {
      const d = new Date(Date.now() + 5.5 * 3_600_000);
      const txt =
        [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
          .map((n) => String(n).padStart(2, '0'))
          .join(':') + ' IST';
      setTime(txt);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}
