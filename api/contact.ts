/* Vercel Serverless Function: POST /api/contact
   Delivers contact-form messages to my inbox via Brevo (https://brevo.com).
   Env: BREVO_API_KEY (required) - without it this returns 503 and the client
   falls back to its mailto: draft. CONTACT_TO / CONTACT_FROM optionally override
   the recipient and verified sender.
   Note: lives outside tsconfig "include" on purpose - Vercel builds api/* on its own. */

type Req = { method?: string; body?: unknown };
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (key: string, value: string) => void;
};

const TO = process.env.CONTACT_TO || 'bhaweshverma50@gmail.com';
const FROM_EMAIL = process.env.CONTACT_FROM || 'mail@bhawesh.dev';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/* Swiss Terminal notification card — same identity as the site (near-black navy,
   electric cobalt, mono type). Tables + inline styles for email-client sanity;
   Gmail won't load Martian Mono, so the system mono stack carries the voice. */
function renderHtml(name: string, email: string, msg: string, when: string): string {
  const MONO = "'Martian Mono','SF Mono','Cascadia Mono','Roboto Mono','Courier New',monospace";
  const row = (label: string, value: string) => `
    <tr>
      <td style="font-family:${MONO};font-size:11px;letter-spacing:1px;color:#a3adc2;padding:7px 16px 7px 0;vertical-align:top;white-space:nowrap;">${label}</td>
      <td style="font-family:${MONO};font-size:13px;color:#f2f5fa;padding:7px 0;word-break:break-word;">${value}</td>
    </tr>`;
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0a0b0f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0b0f;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0e1016;border:1px solid #2a3550;">
        <tr>
          <td style="padding:14px 24px;border-bottom:1px solid #2a3550;">
            <a href="https://bhawesh.dev" style="font-family:${MONO};font-size:11px;letter-spacing:2px;color:#7d97ff;text-decoration:none;">&#9679;&nbsp; INCOMING &mdash; bhawesh.dev/contact</a>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px 8px;">
            <div style="font-family:${MONO};font-size:22px;font-weight:700;line-height:1.3;color:#f2f5fa;">${name ? esc(name) : 'Anonymous visitor'}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:4px 24px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              ${email ? row('reply-to', `<a href="mailto:${esc(email)}" style="color:#7d97ff;text-decoration:none;">${esc(email)}</a>`) : row('reply-to', '<span style="color:#a3adc2;">not provided</span>')}
              ${row('received', esc(when))}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-left:2px solid #7d97ff;padding:16px 18px;background:#151a26;">
                  <div style="font-family:${MONO};font-size:14px;line-height:1.7;color:#f2f5fa;white-space:pre-wrap;word-break:break-word;">${esc(msg)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${
          email
            ? `<tr><td style="padding:0 24px 28px;">
            <a href="mailto:${esc(email)}" style="display:inline-block;background:#7d97ff;color:#0a0b0f;font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:.5px;text-decoration:none;padding:12px 22px;">Reply to ${name ? esc(name) : 'sender'} &rarr;</a>
          </td></tr>`
            : ''
        }
        <tr>
          <td style="padding:12px 24px;border-top:1px solid #2a3550;">
            <span style="font-family:${MONO};font-size:11px;color:#a3adc2;">sent by the contact form at <a href="https://bhawesh.dev" style="color:#7d97ff;text-decoration:none;">bhawesh.dev</a></span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.BREVO_API_KEY;
  if (!key) {
    res.status(503).json({ error: 'Mail service not configured' });
    return;
  }

  const { name = '', email = '', message = '' } = (req.body ?? {}) as Record<string, string>;
  const msg = String(message).trim();
  if (!msg || msg.length > 5000) {
    res.status(400).json({ error: 'Message is required (max 5000 chars)' });
    return;
  }
  const safeName = String(name).trim().slice(0, 200);
  const safeEmail = String(email).trim().slice(0, 200);
  const validReply = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail);

  const when = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Portfolio Contact', email: FROM_EMAIL },
      to: [{ email: TO }],
      subject: `Portfolio enquiry${safeName ? ` from ${safeName}` : ''}`,
      textContent: `${msg}\n\n${[safeName, safeEmail].filter(Boolean).join(' | ')}`,
      htmlContent: renderHtml(safeName, validReply ? safeEmail : '', msg, `${when} IST`),
      ...(validReply ? { replyTo: { email: safeEmail, ...(safeName ? { name: safeName } : {}) } } : {}),
    }),
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    console.error('Brevo error', r.status, detail);
    res.status(502).json({ error: 'Mail service failed' });
    return;
  }

  res.status(200).json({ ok: true });
}
