import { useState, type FormEvent } from 'react';
import { SITE } from '../config/site';

type Phase = 'idle' | 'sending' | 'sent' | 'fallback';

/** Sends via /api/contact (Resend). If the API is missing or down, falls back
    to composing a mailto: draft so the message is never silently lost. */
export function ContactForm() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = (fd.get('name') as string)?.trim() ?? '';
    const email = (fd.get('email') as string)?.trim() ?? '';
    const msg = (fd.get('message') as string)?.trim() ?? '';
    if (!msg) {
      setStatus('Add a short message first, then hit send.');
      return;
    }

    setPhase('sending');
    setStatus('Sending…');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: msg }),
      });
      if (!r.ok) throw new Error(`api ${r.status}`);
      form.reset();
      setPhase('sent');
      setStatus("Message sent. I'll get back to you soon!");
    } catch {
      // API unavailable: open a pre-filled draft in the visitor's mail app instead.
      const subject = encodeURIComponent('Portfolio enquiry' + (name ? ' from ' + name : ''));
      const sig = [name, email].filter(Boolean).join(' | ');
      const body = encodeURIComponent(msg + (sig ? '\n\n' + sig : ''));
      window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
      setPhase('fallback');
      setStatus(`Opening your email app… if nothing happens, write me directly at ${SITE.email}.`);
    }
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
        <button className="btn solid" type="submit" disabled={phase === 'sending'}>
          <span>{phase === 'sending' ? 'Sending…' : 'Send message →︎'}</span>
        </button>
        <p className="cform-status" role="status" aria-live="polite">{status}</p>
      </div>
    </form>
  );
}
