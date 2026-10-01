// api/contact.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

// Best-effort only: this Map lives in the function instance's memory, which
// a serverless platform can spin up fresh per request/region at any time —
// it will not catch every abuser across instances. It's still a real gate
// against the common case (one instance getting hammered), and costs
// nothing to add; a real fix needs a shared store (Redis/KV) if this
// endpoint ever sees abuse this doesn't stop.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const timestamps = (requestLog.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );

  timestamps.push(now);
  requestLog.set(key, timestamps);

  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (name.length > MAX_NAME_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'Field too long' });
  }

  // Strips any CR/LF a submitter put in the name field before it reaches
  // the email subject — defensive hardening against header/content
  // injection even though Resend's JSON API isn't raw SMTP.
  const safeName = name.replace(/[\r\n]+/g, ' ').trim();

  try {
    // 1. Send Email Notification
    await resend.emails.send({
      from: 'Website Form <onboarding@resend.dev>', // Update to verified domain later
      to: process.env.MY_CONTACT_EMAIL,
      subject: `New Inquiry from ${safeName}`,
      replyTo: email,
      text: `Name: ${safeName}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}