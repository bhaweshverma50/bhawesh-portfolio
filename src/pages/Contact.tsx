import { Fragment } from 'react';
import { ContactForm } from '../components/ContactForm';
import { Footer } from '../components/Footer';
import { ResumeButton } from '../components/ResumeButton';
import { SocialLink } from '../components/social';
import { SITE, SOCIALS } from '../config/site';
import { CONTACT } from '../data/content';

export function Contact() {
  const mailto = `mailto:${SITE.email}`;
  return (
    <section className="contact" data-screen-label="Contact" style={{ borderTop: 'none', paddingTop: 'clamp(120px,18vh,210px)' }}>
      <div className="wrap">
        <span className="eyebrow reveal">{CONTACT.eyebrow}</span>
        <h2 className="reveal reveal-d1" style={{ marginTop: 20 }}>
          <a href={mailto}>
            {CONTACT.titleLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </a>
        </h2>
        <div className="contact-row reveal reveal-d2">
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a className="btn solid" href={mailto}>
              <span>{SITE.email}</span>
            </a>
            <ResumeButton />
          </div>
          <div className="contact-links">
            {SOCIALS.map((s) => (
              <SocialLink k={s.key} key={s.key} />
            ))}
          </div>
        </div>

        <div className="block" style={{ padding: '60px 0 0' }}>
          <div className="sec-head reveal">
            <span className="sec-num">{CONTACT.formNum}</span>
            <h2 className="sec-title" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.6rem)' }}>
              {CONTACT.formTitle}
            </h2>
            <span className="eyebrow">{CONTACT.formEyebrow}</span>
          </div>
          <ContactForm />
        </div>

        <Footer />
      </div>
    </section>
  );
}
