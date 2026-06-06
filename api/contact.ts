/* Vercel Serverless Function: POST /api/contact
   Delivers contact-form messages to my inbox via Resend (https://resend.com).
   Env: RESEND_API_KEY (required) - without it this returns 503 and the client
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
const FROM = process.env.CONTACT_FROM || 'Portfolio Contact <onboarding@resend.dev>';

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.RESEND_API_KEY;
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

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: `Portfolio enquiry${safeName ? ` from ${safeName}` : ''}`,
      text: `${msg}\n\n${[safeName, safeEmail].filter(Boolean).join(' | ')}`,
      ...(validReply ? { reply_to: safeEmail } : {}),
    }),
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    console.error('Resend error', r.status, detail);
    res.status(502).json({ error: 'Mail service failed' });
    return;
  }

  res.status(200).json({ ok: true });
}
