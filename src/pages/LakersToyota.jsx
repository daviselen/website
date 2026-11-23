import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import Channel from "../design-system/components/Channel.jsx";
import MastheadImage from "../design-system/components/MastheadImage.jsx";
import MediaObject from "../design-system/components/MediaObject.jsx";
import { useOverlay } from "../design-system/components/Overlay.jsx";
import TextReveal from "../design-system/components/TextReveal.jsx";
import Shot from "../design-system/components/Shot.jsx";
import CTABanner from "../sections/CTABanner.jsx";
import MoreWork from "../sections/MoreWork.jsx";

const PATH = "/work/lakers-and-toyota-legendary-partners";
const CANONICAL = `https://www.daviselen.com${PATH}`;
const TITLE = "Lakers & Toyota: Legendary Partners Since 1976 | Davis Elen";
const DESCRIPTION =
  "Davis Elen marks 50 years of the Lakers and Toyota partnership across broadcast, experiential, out-of-home and digital.";
const SHARE_IMAGE = "https://www.daviselen.com/images/work-legendary-partners-masthead.jpg";

const MOXY_VIDEO = {
  embed: "https://player.vimeo.com/video/1239670640?autoplay=1",
  title: "The Moxy Downtown LA",
};

const BROADCAST_VIDEO = {
  embed: "https://player.vimeo.com/video/1239676926?autoplay=1",
  title: "Broadcast Spot",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Lakers & Toyota: Legendary Partners",
  description: DESCRIPTION,
  url: CANONICAL,
  image: SHARE_IMAGE,
  about: [
    { "@type": "SportsTeam", name: "Los Angeles Lakers" },
    { "@type": "Brand", name: "Toyota" },
  ],
  creator: {
    "@type": "Organization",
    name: "Davis Elen Advertising",
    url: "https://www.daviselen.com",
  },
};

export default function LakersToyota() {
  const { openOverlay } = useOverlay();
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
          src="/images/work-legendary-partners-masthead.jpg"
          alt="The Toyota building in Los Angeles lit in Lakers purple and gold for 50 years of partnership, 1976 to 2026"
        />
        <div className="grid grid-cols-1 gap-600 px-300 lg:grid-cols-12 lg:gap-800 lg:gap-x-8 lg:px-8 lg:pt-1000">
          <div className="flex flex-col gap-300 lg:col-span-6 lg:gap-600 2xl:gap-1000">
            <HeadingReveal
              as="h1"
              text={`A celebration \n50 years in \nthe making`}
              className="font-display text-fluid-2xl uppercase leading-none md:text-8xl xl:text-display-h2"
            />
          </div>
          <TextReveal
            className="text-fluid-sm md:text-xl lg:col-span-5 lg:col-start-8 lg:self-start lg:text-pre-title"
            text="In one of the longest-running sports sponsorships in the country, the Los Angeles Lakers and Toyota honored their 50-year relationship with a season-long campaign. We captured the connection between the two iconic brands who share a legacy of passion, performance and perseverance. Both driven to bring their best to Southern California."
          />
        </div>
      </section>

      <MediaObject
        imageSide="left"
        titleSize="xlarge"
        title="Broadcast Spot"
        subhead="RUNTIME :30"
        text="Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus."
        imgSrc="/images/work-legendary-partners-thumbnail-1.jpg"
        imgAlt="Lakers and Toyota 50th anniversary broadcast spot"
        onClick={() => openOverlay(BROADCAST_VIDEO)}
        opensVideo
      />

      <section id="moxy" className="px-300 pt-1000 md:pt-3000 lg:px-8">
        <Shot
          src="/images/work-lakers-toyota-moxy.jpg"
          alt="A 50th anniversary Lakers and Toyota billboard wrapping a downtown Los Angeles corner at night"
          ratio="1792 / 900"
        />
      </section>
      <MediaObject
        titleSize="large"
        title={`The Moxy \nDowntown LA`}
        subhead="RUNTIME :30"
        text="Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus."
        imgSrc="/images/work-lakers-toyota-spot-2.jpg"
        imgAlt="A gold 3D Toyota logo billboard above a downtown Los Angeles building"
        onClick={() => openOverlay(MOXY_VIDEO)}
        opensVideo
      />

      <Channel channel="Experiential" title="LA Live Toyota Owners Event">
        <Shot
          src="/images/work-lakers-toyota-owners-event.jpg"
          alt="Lakers dancers with the Larry O'Brien trophy and 50th anniversary awards in front of a Lakers and Toyota backdrop"
          ratio="1792 / 900"
          imgClassName="object-bottom"
        />
        <div className="grid grid-cols-1 gap-400 md:grid-cols-3 lg:gap-8">
          <Shot
            src="/images/work-lakers-toyota-proof-1.jpg"
            alt="Two fans posing in front of a neon Los Angeles Lakers sign"
            ratio="576 / 760"
          />
          <Shot
            src="/images/work-lakers-toyota-proof-2.jpg"
            alt="Crypto.com Arena filled with lights ahead of a Lakers game"
            ratio="576 / 760"
            delay={0.15}
          />
          <Shot
            src="/images/work-lakers-toyota-proof-3.jpg"
            alt="Gold Larry O'Brien trophy beside 50th anniversary awards"
            ratio="576 / 760"
            delay={0.3}
          />
        </div>
      </Channel>

      <Channel channel="Experiential" title="Event Grand Prize">
        <Shot
          src="/images/work-lakers-toyota-grand-prize.jpg"
          alt="A black Toyota truck wrapped in Lakers and Toyota 50th anniversary graphics on a red carpet outside Crypto.com Arena"
          ratio="1792 / 900"
        />
      </Channel>

      <Channel channel="Out of Home" title="LA Live Boards">
        <div className="grid grid-cols-1 gap-400 md:grid-cols-12 lg:gap-8">
          <Shot
            src="/images/work-lakers-toyota-ooh-1.jpg"
            alt="A Lakers and Toyota 50th anniversary banner hung on an LA Live building"
            ratio="728 / 1098"
            className="md:col-span-5 md:self-start"
          />
          {/* One flex column, not two grid rows beside a row-span-2 image: the
              tall image is taller than the stack, and grid spreads that surplus
              into the row gap. */}
          <div className="flex flex-col gap-400 md:col-span-6 md:col-start-6 md:self-start lg:gap-8">
            <Shot
              src="/images/work-lakers-toyota-ooh-2.jpg"
              alt="A purple LA Live board reading Legendary Partners Since 1976"
              ratio="880 / 480"
              delay={0.15}
            />
            <Shot
              src="/images/work-lakers-toyota-ooh-3.jpg"
              alt="A Lakers and Toyota 50th anniversary tower beside Crypto.com Arena"
              ratio="728 / 452"
              delay={0.3}
              className="md:w-5/6"
            />
          </div>
        </div>
      </Channel>

      <Channel channel="Digital" title="Connected TV and Display">
        <Shot
          src="/images/work-lakers-toyota-digital.jpg"
          alt="A connected TV home screen promoting Legendary Partners Since 1976 and the Lakers and Toyota 50th anniversary"
          ratio="1792 / 900"
        />
      </Channel>

      <MoreWork current={PATH} />
      <CTABanner />
    </main>
  );
}
