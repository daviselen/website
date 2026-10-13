import HeadingReveal from "../design-system/components/HeadingReveal";
import { PRIVACY_BLOCKS, PRIVACY_LAST_UPDATED } from "../data/privacyPolicy.js";

// The copy carries full URLs (opt-out platforms, Google, Mailchimp); keep them
// clickable. The trailing lookahead keeps sentence punctuation out of the link.
const URL_PATTERN = /(https?:\/\/[^\s]+[^\s.,;)])/g;

function linkify(text) {
  return text.split(URL_PATTERN).map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noreferrer"
        className="break-all underline hover:text-primary-300"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

// Level 2 is a section, 3 a subsection, 4 a sub-subsection; the source page
// uses the same three steps.
const HEADING_CLASSES = {
  2: "mt-1000 font-display text-display-h5 uppercase leading-none",
  3: "mt-600 text-2xl md:text-3xl",
  4: "mt-400 text-xl md:text-2xl",
};

function Block({ block }) {
  if (block.type === "heading") {
    const Tag = `h${block.level}`;
    const className = HEADING_CLASSES[block.level];

    return block.level === 2 ? (
      <HeadingReveal as="h2" text={block.text} className={className} />
    ) : (
      <Tag className={className}>{block.text}</Tag>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="flex list-disc flex-col gap-200 pl-400">
        {block.items.map((item, i) => (
          <li key={i}>{linkify(item)}</li>
        ))}
      </ul>
    );
  }

  return <p>{linkify(block.text)}</p>;
}

// NavBar and Footer come from Layout.jsx, which also supplies the top padding
// that clears the fixed header.
export default function PrivacyPolicy() {
  return (
    <main className="flex min-h-screen flex-col gap-0 bg-surface-default pb-1800 font-narrow font-light text-neutral-0">
      <header className="flex flex-col gap-400 px-2 lg:px-8">
        <HeadingReveal
          as="h1"
          text="Privacy Policy"
          fullyInView
          className="font-display text-display-h3 uppercase leading-none"
        />
        <p className="text-lg md:text-xl">Last updated: {PRIVACY_LAST_UPDATED}</p>
      </header>
      <article className="mt-800 flex max-w-prose flex-col gap-400 px-2 text-lg md:text-xl lg:px-8">
        {PRIVACY_BLOCKS.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </article>
    </main>
  );
}
