import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import Channel from "../design-system/components/Channel.jsx";
import MastheadImage from "../design-system/components/MastheadImage.jsx";
import Shot from "../design-system/components/Shot.jsx";
import TextReveal from "../design-system/components/TextReveal.jsx";
import { caseStudies } from "../data/caseStudies.js";
import CTABanner from "../sections/CTABanner.jsx";
import MoreWork from "../sections/MoreWork.jsx";

// Header copy lives in caseStudies so the generic /work/:slug page and this
// one can't drift; the static route below takes precedence over :slug.
const { headline, copy } = caseStudies["super-snorkel-tours"];

const PATH = "/work/super-snorkel-tours";
const CANONICAL = `https://www.daviselen.com${PATH}`;
const TITLE = "Super Snorkel Tours: Body Glove Cruises | Davis Elen";
const DESCRIPTION =
  "Davis Elen turned Hawaii visitors into Body Glove Cruises adventurers with a Kona airport takeover and an online campaign that delivered a 4.2x return on ad spend.";
const SHARE_IMAGE = "https://www.daviselen.com/images/work-bgc-masthead.jpg";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Super Snorkel Tours: Body Glove Cruises",
  description: DESCRIPTION,
  url: CANONICAL,
  image: SHARE_IMAGE,
  about: { "@type": "Brand", name: "Body Glove Cruises" },
  creator: {
    "@type": "Organization",
    name: "Davis Elen Advertising",
    url: "https://www.daviselen.com",
  },
};

export default function BodyGlove() {
  return (
    <main
      itemScope
      itemType="https://schema.org/CreativeWork"
      className="flex min-h-screen flex-col gap-0 bg-surface-default pb-1000 font-narrow font-light text-neutral-0 light:bg-neutral-0 light:text-neutral-1000 lg:pb-1800"
    >
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <link rel="canonical" href={CANONICAL} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={CANONICAL} />
      <meta property="og:image" content={SHARE_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">
        {JSON.stringify(JSON_LD).replace(/</g, "\\u003c")}
      </script>

      <section id="top">
        <MastheadImage
          src="/images/work-bgc-masthead.jpg"
          alt="A humpback whale rolling beside a Body Glove Cruises boat, half above and half below the waterline"
        />
        <div className="grid grid-cols-1 gap-600 px-300 lg:grid-cols-12 lg:gap-800 lg:gap-x-8 lg:px-8 lg:pt-1000">
          <div className="flex flex-col gap-300 lg:col-span-6 lg:gap-600 2xl:gap-1000">
            <HeadingReveal
              as="h1"
              text={headline}
              className="font-display text-fluid-2xl uppercase leading-none md:text-8xl xl:text-display-h2"
            />
          </div>
          <TextReveal
            className="text-fluid-sm md:text-xl lg:col-span-5 lg:col-start-8 lg:self-start lg:text-pre-title"
            text={copy}
          />
        </div>
      </section>

      <Channel channel="Outdoor" title="Kona Airport">
        <Shot
          src="/images/work-bgc-outdoor.jpg"
          alt="Two Body Glove Cruises billboards at Kona airport, one with a snorkeler over a coral reef and one with a whale beside a tour boat"
          ratio="1792 / 900"
        />
      </Channel>

      <Channel channel="Display" title="Super Snorkel Tours">
        <Shot
          src="/images/work-bgc-display.jpg"
          alt="Six Body Glove Hawaii display banners for snorkeling, dinner and sightseeing cruises over an underwater photo of a snorkeler"
          ratio="1792 / 900"
        />
      </Channel>

      <MoreWork current={PATH} />
      <CTABanner />
    </main>
  );
}
