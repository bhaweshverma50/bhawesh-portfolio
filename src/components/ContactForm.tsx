import { useState, type FormEvent } from 'react';
import { SITE } from '../config/site';

/** Composes an email via mailto: (no backend needed) and gives clear feedback. */
export function ContactForm() {
  const [status, setStatus] = useState('');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get('name') as string)?.trim() ?? '';
    const email = (fd.get('email') as string)?.trim() ?? '';
    const msg = (fd.get('message') as string)?.trim() ?? '';
    if (!msg) {
      setStatus('Add a short message first, then hit send.');
      return;
    }
    const subject = encodeURIComponent('Portfolio enquiry' + (name ? ' from ' + name : ''));
    const sig = [name && '— ' + name, email].filter(Boolean).join(' · ');
    const body = encodeURIComponent(msg + (sig ? '\n\n' + sig : ''));
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setStatus(`Opening your email app… if nothing happens, write me directly at ${SITE.email}.`);
  };

  return (
    <form className="cform reveal" onSubmit={onSubmit} noValidate>
      <div className="fld">
        <label htmlFor="cf-name">Name</label>
        <input type="text" id="cf-name" name="name" placeholder="Your name" autoComplete="name" />
      </div>
      <div className="fld">
        <label htmlFor="cf-email">Email</label>
        <input type="email" id="cf-email" name="email" placeholder="you@company.com" autoComplete="email" />
      </div>
      <div className="fld full">
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" placeholder="What are you building?" />
      </div>
      <div className="fld full" style={{ padding: 20 }}>
        <button className="btn solid" type="submit">
          <span>Send message →</span>
        </button>
        <p className="cform-status" role="status" aria-live="polite">{status}</p>
      </div>
    </form>
  );
}
