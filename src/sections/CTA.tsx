import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { ResumeButton } from '../components/ResumeButton';
import { SocialLink } from '../components/social';
import { useTweaks } from '../components/tweaks/TweaksContext';
import { useIsTouch } from '../hooks/useMediaQuery';
import { CTA as CTA_COPY } from '../data/content';
import { hasPosts } from '../data/posts';

export function CTA() {
  const { toggle } = useTweaks();
  const isTouch = useIsTouch();
  return (
    <section className="contact" id="cta" data-screen-label="CTA">
      <div className="wrap">
        <span className="eyebrow reveal">{CTA_COPY.eyebrow}</span>
        <h2 className="reveal reveal-d1" style={{ marginTop: 24 }}>
          <Link to="/contact">
            {CTA_COPY.titleLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </Link>
        </h2>
        <div className="contact-row reveal reveal-d2">
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link className="btn solid" to="/contact">
              <span>Get in touch</span>
            </Link>
            <ResumeButton />
          </div>
          <div className="contact-links">
            <Link to="/work">Work</Link>
            {hasPosts() && <Link to="/blog">Writing</Link>}
            <SocialLink k="github" />
          </div>
        </div>
        <Footer>
          {CTA_COPY.footerNote}
          {!isTouch && (
            <>
              {' '}/ Hit the{' '}
              <button type="button" className="footer-tweaks" onClick={toggle}>
                Tweaks
              </button>{' '}
              dial to remix
            </>
          )}
        </Footer>
      </div>
    </section>
  );
}
