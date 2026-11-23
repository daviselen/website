import { useParams } from "react-router-dom";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import MastheadImage from "../design-system/components/MastheadImage.jsx";
import MastheadVideo from "../design-system/components/MastheadVideo.jsx";
import TextReveal from "../design-system/components/TextReveal.jsx";
import { caseStudies } from "../data/caseStudies.js";
import NotFound from "./NotFound.jsx";

// Placeholder: swap per campaign once real masthead art exists.
const PLACEHOLDER_IMAGE = "/images/contact-masthead.jpg";

export default function CaseStudy() {
  const { slug } = useParams();
  const study = caseStudies[slug];
  if (!study) return <NotFound />;

  const { campaign, client, headline, copy, vimeoId } = study;
  const title = `${campaign}: ${client} | Davis Elen`;
  const url = `https://www.daviselen.com/work/${slug}`;
  const image = `https://www.daviselen.com${PLACEHOLDER_IMAGE}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${campaign}: ${client}`,
    description: copy,
    url,
    image,
    about: { "@type": "Brand", name: client },
    creator: {
      "@type": "Organization",
      name: "Davis Elen Advertising",
      url: "https://www.daviselen.com",
    },
  };

  return (
    <main
      itemScope
      itemType="https://schema.org/CreativeWork"
      className="flex min-h-screen flex-col gap-0 bg-surface-default pb-1000 font-narrow font-light text-neutral-0 light:bg-neutral-0 light:text-neutral-1000 lg:pb-1800 xl:pb-3000">
      <title>{title}</title>
      <meta name="description" content={copy} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={copy} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">
        {JSON.stringify(jsonLd).replace(/</g, "\\u003c")}
      </script>

      <section id="top">
        {vimeoId ? (
          // Same outer padding as MastheadImage so the two line up.
          <div className="px-300 pb-500 md:pb-700 lg:px-8 lg:pb-800 xl:pb-1000">
            <MastheadVideo
              key={slug}
              vimeoId={vimeoId}
              className="aspect-video w-full rounded-md"
            />
          </div>
        ) : (
          <MastheadImage
            key={slug}
            src={PLACEHOLDER_IMAGE}
            alt={`${campaign} for ${client}`}
          />
        )}
        <div className="grid grid-cols-1 gap-600 px-300 lg:grid-cols-12 lg:gap-800 lg:gap-x-8 lg:px-8 lg:pt-1000">
          <div className="flex flex-col gap-300 lg:col-span-6 lg:gap-600 2xl:gap-1000">
            <HeadingReveal
              key={slug}
              as="h1"
              text={headline}
              className="font-display text-fluid-2xl uppercase leading-none md:text-8xl xl:text-display-h2"
            />
          </div>
          <TextReveal
            key={slug}
            className="text-fluid-sm md:text-xl lg:col-span-5 lg:col-start-8 lg:self-start lg:text-pre-title"
            text={copy}
          />
        </div>
      </section>
    </main>
  );
}
