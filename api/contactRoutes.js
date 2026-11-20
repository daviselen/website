// Keys must match `topics` in src/pages/Contact.jsx.
const TOPIC_RECIPIENTS = {
  'New Business Inquiry': 'newbiz@daviselen.com',
  'Public Relations': 'communications@daviselen.com',
  'Media Planning & Buying': 'mediaplanning@daviselen.com',
  'Media Billing': 'mediabilling@daviselen.com',
  'Social Media & UGC': 'socialmedia@daviselen.com',
  'Careers': 'careers@daviselen.com',
};
const DEFAULT_RECIPIENT = 'contact@daviselen.com';

export const isKnownTopic = (topic) =>
  typeof topic === 'string' && Object.hasOwn(TOPIC_RECIPIENTS, topic);

// Only real production traffic reaches the department inboxes; local and
// preview deploys all land in the shared inbox. Unknown topics (including the
// combobox's free-text option) also go to the shared inbox.
export function recipientFor(topic, vercelEnv = process.env.VERCEL_ENV) {
  return vercelEnv === 'production' && isKnownTopic(topic)
    ? TOPIC_RECIPIENTS[topic]
    : DEFAULT_RECIPIENT;
}
