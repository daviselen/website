import { useRef } from "react";
import { useOverlay } from "../design-system/components/Overlay.jsx";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import Card from "../design-system/components/Card.jsx";
import Channel from "../design-system/components/Channel.jsx";
import DiceTypeAnimation from "../design-system/components/DiceTypeAnimation.jsx";
import MastheadClip from "../design-system/components/MastheadClip.jsx";
import MediaObject from "../design-system/components/MediaObject.jsx";
import Shot from "../design-system/components/Shot.jsx";
import { useStaggerReveal } from "../design-system/animation.js";
import TextReveal from "../design-system/components/TextReveal.jsx";
import CTABanner from "../sections/CTABanner.jsx";

const PATH = "/work/dice-branding";
const CANONICAL = `https://www.daviselen.com${PATH}`;
const TITLE = "Dice: We Speak Tech | Davis Elen";
const DESCRIPTION =
  "Davis Elen rebuilt the Dice.com brand from the ground up, covering messaging, visual identity and advertising around one ownable truth: Where tech connects.";
const YOUTUBE_VIDEO = {
  embed: "https://www.youtube.com/embed/rwSqk-ITESA?autoplay=1&rel=0",
  title: "7 Reasons I Love Being a Software Engineer",
};
// Vimeo IDs of the three vertical influencer videos, in display order.
const INSTAGRAM_VIDEOS = [
  {
    id: "838758842",
    title: "3 Tips On Writing a Resume with NO Prior Job Experience",
  },
  {
    id: "838758895",
    title: "Aral is Answering Some of Your Tech Career-Related Questions",
  },
  {
    id: "838760353",
    title: "3 Things Not to Say to a Tech Recruiter",
  },
].map((v, i) => ({
  ...v,
  src: `/images/work-dice-instagram-${i + 1}.jpg`,
  embed: `https://player.vimeo.com/video/${v.id}?autoplay=1&dnt=1`,
}));

const SHARE_IMAGE = "https://www.daviselen.com/images/work-dice-masthead.jpg";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Dice: We Speak Tech",
  description: DESCRIPTION,
  url: CANONICAL,
  image: SHARE_IMAGE,
  about: { "@type": "Brand", name: "Dice.com" },
  creator: {
    "@type": "Organization",
    name: "Davis Elen Advertising",
    url: "https://www.daviselen.com",
  },
};

export default function Dice() {
  const { openOverlay } = useOverlay();
  const instagramRef = useRef(null);
  useStaggerReveal(instagramRef, { amount: 0.333 });
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
        <MastheadClip
          mp4="/videos/dice_masthead_video.mp4"
          poster="/images/work-dice-masthead.jpg"
          className="mx-300 mb-1000 aspect-contact-masthead rounded-md object-cover md:mx-400"
        />
        <div className="grid grid-cols-1 gap-600 px-300 lg:grid-cols-12 lg:gap-800 lg:gap-x-8 lg:px-8 lg:pt-1000">
          <HeadingReveal
            as="h1"
            text={`We speak \ntech.`}
            className="font-display text-fluid-2xl uppercase leading-none md:text-8xl lg:col-span-6 xl:text-display-h2"
          />
          <TextReveal
            className="text-fluid-sm md:text-xl lg:col-span-5 lg:col-start-8 lg:self-start lg:text-pre-title"
            text="Dice.com is the go-to career marketplace for tech professionals, connecting job seekers with the recruiters and employers who need their skills. Davis Elen rebuilt the brand from the ground up, covering messaging, visual identity and advertising to give both B2B and B2C audiences a reason to choose Dice over every other platform competing for their attention. The result was a brand built around a simple, ownable truth: Dice is “Where tech connects.”"
          />
        </div>
      </section>

      <section className="px-300 pt-1000 md:pt-3000 lg:px-8">
        <Shot>
          <DiceTypeAnimation />
        </Shot>
      </section>

      <MediaObject
        titleSize="large"
        title={`Brand \nPersonality`}
        subhead="Messaging"
        imgSrc="/images/work-dice-brand-personality.jpg"
        imgAlt="Dice.com brand personality messaging artwork"
      />

      <Channel channel="Brand Identity" title="Photography and Logos">
        {/* Figma also layers the brand hero asset (3533:943, 112% tall) over this
            node; treated as a stray layer and not built. Unverified by screenshot. */}
        <Shot
          src="/images/work-dice-photography-system.jpg"
          alt="The Dice.com photography system: a grid of black and white portraits of tech professionals"
          ratio="1792 / 900"
        />
      </Channel>

      <Channel channel="Campaign" title="Key Visuals">
        <div className="grid grid-cols-1 gap-400 md:grid-cols-2 lg:gap-8">
          <Shot
            src="/images/work-dice-key-visual-1.jpg"
            alt="Dice.com key visual built from a grid of architectural photographs"
            ratio="880 / 622"
          />
          <Shot
            src="/images/work-dice-key-visual-2.jpg"
            alt="Dice.com key visual featuring tech professionals"
            ratio="880 / 622"
            delay={0.15}
          />
        </div>
      </Channel>

      <Channel channel="Digital" title="Display">
        <div className="grid grid-cols-1 gap-400 md:grid-cols-3 lg:gap-8">
          <Shot
            src="/images/work-dice-display-1.jpg"
            alt="Dice.com 300 by 250 display banner"
            ratio="576 / 480"
          />
          <Shot
            src="/images/work-dice-display-2.jpg"
            alt="Dice.com 300 by 250 display banner"
            ratio="576 / 480"
            delay={0.15}
          />
          <Shot
            src="/images/work-dice-display-3.jpg"
            alt="Dice.com 300 by 250 display banner"
            ratio="576 / 480"
            delay={0.3}
          />
        </div>
      </Channel>

      {/* One heading for the whole section, so Channel carries no children:
          MediaObject brings its own page padding and can't nest inside it. */}
      <Channel channel="Social Media" title="YouTube" />

      <MediaObject
        imageSide="left"
        titleSize="large"
        title={`7 Reasons I \nLove Being a \nSoftware \nEngineer`}
        imgSrc="/images/work-dice-youtube.jpg"
        imgAlt="Still from the YouTube video 7 Reasons I Love Being a Software Engineer"
        onClick={() => openOverlay(YOUTUBE_VIDEO)}
        opensVideo
        flush
      />

      <Channel channel="Social Media" title="Instagram">
        <div
          ref={instagramRef}
          className="grid gap-600 md:grid-cols-3 md:gap-1000 lg:gap-8"
        >
          {INSTAGRAM_VIDEOS.map((v) => (
            <Card
              key={v.id}
              src={v.src}
              alt={`Still from the video ${v.title}`}
              heading={v.title}
              size="med"
              aspect="11/10"
              onClick={() => openOverlay({ embed: v.embed, title: v.title })}
            />
          ))}
        </div>
      </Channel>

      <CTABanner />
    </main>
  );
}
