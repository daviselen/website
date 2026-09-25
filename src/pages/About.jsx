import { lazy, Suspense } from "react";
import MastheadImage from "../design-system/components/MastheadImage";
import CTABanner from "../sections/CTABanner";
import MediaObject from "../design-system/components/MediaObject.jsx";
import TextReveal from "../design-system/components/TextReveal.jsx";
import SplitIntro from "../design-system/components/SplitIntro.jsx";
import { useOverlay } from "../design-system/components/Overlay.jsx";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import Marquee from "../design-system/components/Marquee.jsx";
import Picture from "../design-system/components/Picture.jsx";

// Hosted on Vimeo rather than self-served from /public/videos, so the overlay
// gets its `embed` payload (an iframe player URL) instead of `src`. The
// canonical share link is https://vimeo.com/849298824 — the player.vimeo.com
// host is the embeddable form of the same video, and autoplay=1 matches the
// autoPlay the overlay already applies to self-hosted files.
const ORIGIN_STORY = {
  embed: "https://player.vimeo.com/video/849298824?autoplay=1",
  title: "Our Origin Story",
};

// Same lazy import main.jsx gives the /about/retail-map route, so the two
// share one chunk: mapbox-gl and the geocoder (the heaviest dependencies in
// the app) stay out of the About bundle and only download when the overlay is
// actually opened. The element is built once at module scope — `lazy` defers
// the import until React renders it, which is the open, not this line.
const RetailMap = lazy(() => import("./RetailMap.jsx"));

// `content` instead of `src`/`embed`: the overlay renders this node as-is.
// className="" drops RetailMap's page gutter — the overlay panel supplies its
// own width.
const RETAIL_MAP = {
  title: "Retail locations map",
  content: (
    <Suspense fallback={<div className="aspect-video w-full" aria-busy="true" />}>
      <RetailMap className="" />
    </Suspense>
  ),
};

const people = [
  {
    name: "Mark Davis",
    video: {
      mp4: "/videos/people/mark-davis.mp4"
    }
  },
  {
    name: "Terry Sullivan",
    video: {
      mp4: "/videos/people/terry-sullivan.mp4"
    }
  },
  {
    name: "David Moranville",
    // Same `{ webm, mp4 }` shape PortfolioGrid passes to ImageCard, so the
    // <source> ordering (webm first, mp4 fallback) matches the rest of the
    // site. `img` stays as the poster frame: it's what shows before the
    // first video frame decodes, and what remains if the file 404s.
    video: {
      webm: "/videos/people/david-moranville.webm",
      mp4: "/videos/people/david-moranville.mp4",
    },
    img: {
      src: "/images/portraits/david-moranville.jpg",
    },
  },
  {
    name: "Karen Lipker",
    img: {
      src: "/images/portraits/karen-lipker.jpg",
    },
  },
  {
    name: "Marianne Turner",
    img: {
      src: "/images/portraits/marianne-turner.jpg",
    },
    video: {
      mp4: "/videos/people/marianne-turner.mp4"
    }
  },
  {
    name: "Stan Kaplan",
    video: {
      webm: "/videos/people/stan-kaplan.webm",
      mp4: "/videos/people/stan-kaplan.mp4",
    },
    img: {
      src: "/images/portraits/stan-kaplan.jpg",
    },
  },
  {
    name: "Cassedy Banks",
    img: {
      src: "/images/portraits/cassedy-banks.jpg",
    },
  },
  {
    name: "Zachary Moranville",
    img: {
      src: "/images/portraits/zachary-moranville.jpg",
    },
  },
  {
    name: "Marcos Arroyo",
    video: {
      mp4: "/videos/people/marcos-arroyo.mp4"
    }
  },
  // {
  //   name: "Lucía Galicia",
  //   img: {
  //     src: "/images/portraits/lucia-galicia.jpg",
  //   },
  // },
  {
    name: "Jenny Rusinko",
    img: {
      src: "/images/portraits/jenny-rusinko.jpg",
    },
  },
  // {
  //   name: "Alonso Núñez Sarrapy",
  //   img: {
  //     src: "/images/portraits/alonso-nunez-sarrapy.jpg",
  //   },
  // },
  // {
  //   name: "Christina Dominguez",
  //   img: {
  //     src: "/images/portraits/christina-dominguez.jpg",
  //   },
  // },
  {
    name: "John Papadopoulos",
    video: {
      mp4: "/videos/people/john-papadopoulos.mp4",
      webm: "/videos/people/john-papadopoulos.webm"
    }
  },
  {
    name: "Jennifer Lin",
    video: {
      mp4: "/videos/people/jennifer-lin.mp4"
    }
  },
  // {
  //   name: "Joshua Walan",
  //   img: {
  //     src: "/images/portraits/joshua-walan.jpg",
  //   },
  // },
  // {
  //   name: "Tyler Grinham",
  //   img: {
  //     src: "/images/portraits/tyler-grinham.jpg",
  //   },
  // },
  // {
  //   name: "Jorge Rodriguez",
  //   img: {
  //     src: "/images/portraits/jorge-rodriguez.jpg",
  //   },
  // },
];

const clients = [
  {
    img: {
      src: "/images/clients/client-logo-05-lively.svg",
      alt: "Lively",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-01-toyota.svg",
      alt: "Toyota",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-02-mcdonalds.svg",
      alt: "McDonald's",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-03-smart-and-final.svg",
      alt: "Smart & Final",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-04-best-buy-health.svg",
      alt: "Best Buy Health",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-06-warner-bros-studio-tour.svg",
      alt: "Warner Bros. Studio Tour Hollywood",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-07-zircon.svg",
      alt: "Zircon Corp.",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-08-asana.svg",
      alt: "Asana",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-09-dice.svg",
      alt: "Dice",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-10-alkaline88.svg",
      alt: "The Alkaline Water Co.'s Alkaline88",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-11-los-angeles-chargers.svg",
      alt: "The Los Angeles Chargers",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-12-autodesk.svg",
      alt: "Autodesk",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-13-fremont-bank.svg",
      alt: "Fremont Bank",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-14-purity.svg",
      alt: "Purity Coffee",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-15-peatos.svg",
      alt: "Peatos",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-16-udacity.svg",
      alt: "Udacity",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-17-dolby.svg",
      alt: "Dolby",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-18-cisco.svg",
      alt: "Cisco",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-19-walmart-labs.svg",
      alt: "Walmart Labs",
    },
  },
  {
    img: {
      src: "/images/clients/client-logo-20-special-olympics-2015.svg",
      alt: "Special Olympics World Games 2015",
    },
  },
];

// Four marquee rows of five logos, preserving the grouping the old grid gave
// them. Chunked at module scope and NOT keyed off the breakpoint: the row count
// stays fixed at 4 at every width — only the tile width inside a row is
// responsive — so resizing never reshuffles which logo sits in which row or
// remounts a row's tween.
const ROW_SIZE = 5;
const CLIENT_ROWS = Array.from(
  { length: Math.ceil(clients.length / ROW_SIZE) },
  (_, row) => clients.slice(row * ROW_SIZE, row * ROW_SIZE + ROW_SIZE)
);

export default function About() {
  const { openOverlay } = useOverlay();
  return (
    <main
      itemScope
      itemType="https://schema.org/Organization"
      className="flex min-h-screen flex-col gap-0 bg-surface-default pb-1000 lg:pb-1800 font-narrow font-light text-neutral-0"
    >
      <meta itemProp="name" content="Davis Elen Advertising" />
      <meta itemProp="url" content="https://daviselen.com" />
      
      <section id="top">
        <MastheadImage src="/images/about-masthead.jpg" alt="About Davis Elen Advertising" title={`Inside \nthe Box`} />
        {/* <Picture src="/images/about-masthead.jpg" alt="About Davis Elen Advertising" className="block w-full h-auto rounded-md" /> */}
        <div className="px-2 lg:px-8">
          {/* grid-cols-12 with a fixed col-span-6 was applying at every
              width — on a phone that's a ~150px-wide copy column with every
              word wrapping. Single column below md, real 2-up split at md+
              (Careers.jsx's matching intro block already gates this
              correctly with `lg:grid`; this one had no gate at all). */}
          <SplitIntro
            gridClassName="grid grid-cols-1 gap-400 md:grid-cols-12"
            leftClassName="md:col-span-6 md:col-start-1"
            rightClassName="md:col-span-6 md:col-start-7"
            left="Davis Elen has been in business since 1948 and independent every single day of it. No holding company, no parent, nobody upstairs to run it past. That isn't nostalgia. It's just how we like to work."
            right="We make advertising that has a job to do. Move product off a shelf. Get a car onto a lot. Put a person in a store. The constraint is the whole point. Give us a real budget, a real deadline and a real strategy and we'll show you what happens inside the box."
          />
        </div>
      </section>
      <MediaObject
        title="$18 Billion in Sales from Over 4000 Locations."
        text="Toyota. Best Buy Health. Smart & Final. One in four McDonald's in the country. Zoom in on the map. We're probably in your neighborhood."
        imgSrc="/images/about-map.jpg"
        imgAlt="Map of Los Angeles County showing the locations of Toyota dealership, McDonald's restaurant, Best Buy and Smart & Final locations."
        onClick={() => openOverlay(RETAIL_MAP)}
      />
      <section id="people" className="flex flex-col gap-600 lg:gap-1000 px-2 lg:px-8 pt-1000 md:pt-3000">
        <div className="flex flex-col gap-600">
          <HeadingReveal
            className="font-display text-5xl uppercase md:text-7xl lg:text-display-h3"
            text={`Let’s \nMeet Up`}
          />
          <TextReveal className="max-w-prose text-lg md:text-xl lg:text-pre-title"
            text="This is the whole meeting. No account person you'll never see again, no bench of strangers who vanish after the pitch. The people in the room are the people who do the work."
          />
        </div>
        {/* grid-cols-4 at every width put 12 portrait tiles four-across on a
            phone (~80px tiles) — 2-up below md, real 4-up unchanged. */}
        <div className="grid grid-cols-2 gap-100 lg:gap-400 md:grid-cols-4">
          {people.map((person, index) => (
          <div key={index} className="teams-video relative rounded-md bg-surface-alt">
            {person.video ? (
              // autoPlay + loop + muted + playsInline is the same background
              // -video contract as MastheadVideo: muted is what makes autoplay
              // legal in Safari/Chrome, playsInline what stops iOS taking it
              // fullscreen. aspect-video is Tailwind's built-in 16/9, so the
              // tile keeps the exact ratio the <Picture> below it uses.
              <video
                className="aspect-video h-auto w-full rounded-md object-cover"
                poster={person.img?.src}
                aria-label={person.name}
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={person.video.webm} type="video/webm" />
                <source src={person.video.mp4} type="video/mp4" />
              </video>
            ) : (
              <Picture className="flex aspect-[16/9] h-auto w-full items-center justify-center rounded-md" src={person.img.src} alt={person.name} />
            )}
            {person.video ? (
              <span className="absolute bottom-100 left-100 flex gap-[6px] rounded-[3px] bg-neutral-1000/50 px-100 text-[12px] tracking-[0.03em]">
                <span className="py-100">{person.name}</span>
                <img src="/icons/teams-mic.svg" alt="" />
              </span>
            ) : (
              <></>
            )}
          </div>
          ))}
        </div>
      </section>
      <MediaObject
        imageSide="left"
        title={ORIGIN_STORY.title}
        titleSize="large"
        subhead="Runtime 15:50"
        text="It started as a print shop in Glendale. Nobody planned the rest of it."
        imgSrc="/images/about-history.jpg"
        imgAlt="Photo of Henry Mayers and the four partners who took over in 1958."
        onClick={() => openOverlay(ORIGIN_STORY)}
        opensVideo
      />
      <section id="clients" className="flex flex-col gap-0 px-2 lg:px-8 pt-1000 md:pt-3000">
        <HeadingReveal
          as="h2"
          className="mb-1200 font-display text-5xl uppercase md:text-7xl lg:text-display-h3"
          text={`Client \nExperience`}
        />
        {/* Full-bleed breakout: the section keeps its px-2/px-8 so the heading
            stays gutter-aligned, and only the rows run edge to edge. -mx-2/
            -mx-8 are the matching negative margins (real classes, unlike
            -mx-400), so it clears the repo's no-arbitrary-value rule. */}
        <div className="-mx-2 lg:-mx-8">
          <div className="flex flex-col gap-400">
            {CLIENT_ROWS.map((row, index) => (
              <Marquee
                key={index}
                items={row}
                direction={index % 2 === 0 ? "left" : "right"}
                imageScale={0.84}
              >
                {(client, itemIndex, isClone) => (
                  <Picture
                    className="h-auto w-full"
                    src={client.img.src}
                    // Copies past the first are decorative repeats of a logo
                    // the first copy already announced.
                    alt={isClone ? "" : client.img.alt}
                  />
                )}
              </Marquee>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
    </main>
  );
}
