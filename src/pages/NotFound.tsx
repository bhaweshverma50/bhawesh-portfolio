import { Link } from 'react-router-dom';
import { TitleUnderline } from '../components/TitleUnderline';

export function NotFound({ label = 'Page not found' }: { label?: string }) {
  return (
    <section className="page-hero" data-screen-label="404">
      <div className="wrap">
        <span className="eyebrow">Error 404</span>
        <h1>{label}</h1>
        <TitleUnderline />
        <p className="lead">
          <b>That route doesn&apos;t exist.</b> The link may be stale or mistyped. Let&apos;s get you back on track.
        </p>
        <div className="contact-row" style={{ borderTop: 'none', marginTop: 30, paddingTop: 0 }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link className="btn solid" to="/">
              <span>{'←︎'} Back home</span>
            </Link>
            <Link className="btn" to="/work">
              <span>See the work</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
