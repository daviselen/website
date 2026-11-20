// HTML body for the contact-form notification. Email clients ignore webfonts
// and most modern CSS, so this is inline-styled tables with the site's tokens
// (DESIGN.md); Arial/Arial Black stand in for Knockout/Ringside.
// Light theme, mirroring the site's `light:` mappings (neutral-0 page,
// neutral-1000 text, neutral-100 card, neutral-300 rules, neutral-600 muted).
const COLORS = {
  surface: '#ffffff',
  surfaceAlt: '#e0e0e0',
  text: '#000000',
  muted: '#666666',
  rule: '#b3b3b3',
  button: '#1e5631',
  buttonText: '#ffffff',
};
const DISPLAY = "'Arial Black',Arial,sans-serif";
const BODY = "Arial,Helvetica,sans-serif";
// public/email/logo.png is 420x120; Outlook ignores width:auto, so both are set.
const LOGO = { url: 'https://daviselen.com/email/logo.png', width: 112, height: 32 };

// Every submitter-controlled value goes through this: it's HTML-injected.
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

// Outlook desktop (Word engine) mishandles the `font:` shorthand.
const type = (size, lineHeight, family = BODY, color = COLORS.text) =>
  `font-family:${family};font-size:${size}px;line-height:${lineHeight};font-weight:normal;color:${color};`;

const label = (text) =>
  `<div style="${type(13, 1, BODY, COLORS.muted)}letter-spacing:0.12em;text-transform:uppercase;padding-bottom:8px;">${text}</div>`;

export function renderContactEmail({ name, email, topic, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const topicText = topic ?? 'General inquiry';
  const safeTopic = escapeHtml(topicText);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
  const replyHref = `mailto:${safeEmail}?subject=${escapeHtml(encodeURIComponent(`Re: ${topicText}`))}`;
  const wrap = 'word-break:break-word;overflow-wrap:anywhere;';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>:root { color-scheme: light; supported-color-schemes: light; }</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.surface};" bgcolor="${COLORS.surface}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.surface}" style="background:${COLORS.surface};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.surface}" style="width:100%;max-width:600px;background:${COLORS.surface};">
        <tr><td style="padding-bottom:32px;border-bottom:1px solid ${COLORS.rule};"><img src="${LOGO.url}" alt="Davis Elen" width="${LOGO.width}" height="${LOGO.height}" style="display:block;width:${LOGO.width}px;height:${LOGO.height}px;border:0;${type(13, 1, DISPLAY)}"></td></tr>
        <tr><td style="padding:40px 0 8px;">${label('New inquiry')}</td></tr>
        <tr><td style="padding-bottom:40px;${type(44, 1, DISPLAY)}text-transform:uppercase;${wrap}">${safeTopic}</td></tr>
        <tr><td style="padding-bottom:24px;">
          ${label('From')}
          <div style="${type(22, 1.3)}${wrap}">${safeName}</div>
          <a href="mailto:${safeEmail}" style="${type(18, 1.5, BODY, COLORS.muted)}text-decoration:none;${wrap}">${safeEmail}</a>
        </td></tr>
        <tr><td bgcolor="${COLORS.surfaceAlt}" style="padding:24px;background:${COLORS.surfaceAlt};border-radius:8px;">
          ${label('Message')}
          <div style="${type(18, 1.5)}${wrap}">${safeMessage}</div>
        </td></tr>
        <tr><td style="padding:32px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td bgcolor="${COLORS.button}" style="background:${COLORS.button};border-radius:8px;padding:16px 32px;">
              <a href="${replyHref}" style="${type(18, 1, BODY, COLORS.buttonText)}text-decoration:none;display:inline-block;">Reply</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid ${COLORS.rule};${type(13, 1.5, BODY, COLORS.muted)}">Sent from the contact form at daviselen.com</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
