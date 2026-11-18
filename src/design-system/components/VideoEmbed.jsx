// A third-party player (Vimeo, YouTube) in the site's one corner radius.
// `ratio` is the video's own frame, applied here rather than minted as a
// Tailwind token, same as Shot. Allowed origins live in vercel.json's
// frame-src. Wrap in Shot for the scroll reveal.
export default function VideoEmbed({ src, title, ratio }) {
  return (
    <iframe
      src={src}
      title={title}
      style={{ aspectRatio: ratio }}
      className="block w-full rounded-md border-0"
      loading="lazy"
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
