import { lazy, Suspense, useEffect, useRef, useState } from "react";
import MastheadImage from "../design-system/components/MastheadImage";
import CTABanner from "../sections/CTABanner";
import MediaObject from "../design-system/components/MediaObject.jsx";
import TextReveal from "../design-system/components/TextReveal.jsx";
import SplitIntro from "../design-system/components/SplitIntro.jsx";
import { useOverlay } from "../design-system/components/Overlay.jsx";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import Marquee from "../design-system/components/Marquee.jsx";
import Picture from "../design-system/components/Picture.jsx";
import { holdForMedia } from "../lib/siteReady.js";

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
    <Suspense
      fallback={
        <div
          className="flex aspect-video w-full items-center justify-center text-lg"
          aria-busy="true"
        >
          Loading map&hellip;
        </div>
      }
    >
      <RetailMap className="" />
    </Suspense>
  ),
};

// `vimeoId` (optional): when set, the tile plays the Vimeo background embed
// and the self-hosted `video` is ignored. Without it the tile falls back to
// the self-hosted file.
const people = [
  {
    name: "Mark Davis",
    vimeoId: "1249436011",
    video: {
      mp4: "/videos/people/mark-davis.mp4"
    }
  },
  {
    name: "Terry Sullivan",
    vimeoId: "1249436022",
    video: {
      mp4: "/videos/people/terry-sullivan.mp4"
    }
  },
  {
    name: "David Moranville",
    vimeoId: "1249436023",
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
    name: "Malu Santamaria",
    vimeoId: "1249436009",
    video: {
      mp4: "/videos/people/malu-santamaria.mp4",
      webm: "/videos/people/malu-santamaria.webm"
    }
  },
  {
    name: "Marianne Turner",
    vimeoId: "1249436012",
    img: {
      src: "/images/portraits/marianne-turner.jpg",
    },
    video: {
      mp4: "/videos/people/marianne-turner.mp4"
    }
  },
  {
    name: "Bert Kelley",
    vimeoId: "1249435965",
    video: {
      mp4: "/videos/people/bert-kelley.mp4",
      webm: "/videos/people/bert-kelley.webm"
    },
  },
  {
    name: "Jennifer Lin",
    vimeoId: "1249435997",
    video: {
      mp4: "/videos/people/jennifer-lin.mp4",
      webm: "/videos/people/jennifer-lin.webm"
    }
  },
  {
    name: "Brett Bandow",
    vimeoId: "1249435994",
    video: {
      mp4: "/videos/people/brett-bandow.mp4",
      webm: "/videos/people/brett-bandow.webm"
    },
  },
  {
    name: "John Papadopoulos",
    vimeoId: "1249436001",
    video: {
      mp4: "/videos/people/john-papadopoulos.mp4",
      webm: "/videos/people/john-papadopoulos.webm"
    }
  },
  {
    name: "Karen Lipker",
    vimeoId: "1249435962",
    img: {
      src: "/images/portraits/karen-lipker.jpg",
    },
    video: {
      mp4: "/videos/people/karen-lipker.mp4",
      webm: "/videos/people/karen-lipker.webm"
    }
  },
  {
    name: "Stan Kaplan",
    vimeoId: "1249436026",
    video: {
      webm: "/videos/people/stan-kaplan.webm",
      mp4: "/videos/people/stan-kaplan.mp4",
    },
    img: {
      src: "/images/portraits/stan-kaplan.jpg",
    },
  },
  {
    name: "Amy Drell",
    vimeoId: "1249447446",
    img: {
      src: "/images/portraits/amy-drell.jpg",
    },
    video: {
      mp4: "/videos/people/amy-drell.mp4",
      webm: "/videos/people/amy-drell.webm"
    }
  },
  {
    name: "Shelly Choi",
    vimeoId: "1249435961",
    img: {
      src: "/images/portraits/shelly-choi.jpg",
    },
    video: {
      mp4: "/videos/people/shelly-choi.mp4",
      webm: "/videos/people/shelly-choi.webm"
    }
  },
  // {
  //   name: "Jenny Rusinko",
  //   img: {
  //     src: "/images/portraits/jenny-rusinko.jpg",
  //   },
  //   video: {
  //     mp4: "/videos/people/jenny-rusinko.mp4",
  //     webm: "/videos/people/jenny-rusinko.webm"
  //   }
  // },
  {
    name: "Zachary Moranville",
    vimeoId: "1249435964",
    img: {
      src: "/images/portraits/zachary-moranville.jpg",
    },
    video: {
      mp4: "/videos/people/zachary-moranville.mp4",
      webm: "/videos/people/zachary-moranville.webm",
    }
  },
  {
    name: "Alejandro Clopatofsky",
    vimeoId: "1249435952",
    img: {
      src: "/images/portraits/cassedy-banks.jpg",
    },
    video: {
      mp4: "/videos/people/alejandro-clopatofsky.mp4",
      webm: "/videos/people/alejandro-clopatofsky.webm"
    }
  },
  // {
  //   name: "Lucía Galicia",
  //   img: {
  //     src: "/images/portraits/lucia-galicia.jpg",
  //   },
  // },
  {
    name: "Derek Morrison",
    vimeoId: "1249435954",
    video: {
      mp4: "/videos/people/derek-morrison.mp4",
      webm: "/videos/people/derek-morrison.webm"
    }
  },
  {
    name: "Jessica Westlake",
    vimeoId: "1249435951",
    video: {
      mp4: "/videos/people/jessica-westlake.mp4",
      webm: "/videos/people/jessica-westlake.webm"
    }
  },
  {
    name: "Brian Banks",
    vimeoId: "1249435950",
    video: {
      mp4: "/videos/people/brian-banks.mp4",
      webm: "/videos/people/brian-banks.webm"
    }
  },
  {
    name: "Marcos Arroyo",
    vimeoId: "1249436013",
    video: {
      mp4: "/videos/people/marcos-arroyo.mp4",
      webm: "/videos/people/marcos-arroyo.webm"
    }
  },
  // {
  //   name: "Christina Dominguez",
  //   img: {
  //     src: "/images/portraits/christina-dominguez.jpg",
  //   },
  // },
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

// Hold the preloader until a tile's poster is decoded, so the tiles paint with
// their thumbnails instead of empty boxes. Settles on error too (the
// preloader's own MAX_WAIT_MS caps a slow one).
function usePosterHold(src) {
  useEffect(() => {
    if (!src) return undefined;
    const release = holdForMedia();
    const img = new Image();
    img.src = src;
    img.decode().catch(() => {}).then(release);
    return release;
  }, [src]);
}

// Self-hosted fallback, used only for tiles without a `vimeoId`.
// preload="none" keeps the tiles from downloading up front; each tile plays
// only while near the viewport. Same background-video contract as
// MastheadVideo: muted + playsInline make autoplay legal on Safari/iOS.
function PersonVideo({ person }) {
  const ref = useRef(null);

  // The video files stay preload="none": thumbnails only, not ~16 videos.
  usePosterHold(person.img?.src);

  useEffect(() => {
    const video = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="aspect-video h-auto w-full rounded-md object-cover"
      poster={person.img?.src}
      aria-label={person.name}
      preload="none"
      loop
      muted
      playsInline
    >
      <source src={person.video.webm} type="video/webm" />
      <source src={person.video.mp4} type="video/mp4" />
    </video>
  );
}

// Same background-mode params MastheadVideo uses: no player chrome, muted,
// looping, autoplaying.
const PERSON_EMBED_PARAMS = "background=1&autoplay=1&loop=1&muted=1";

// Vimeo tile. The iframe is created only once the tile nears the viewport
// (an iframe with no src is inert: no player JS, no video), and it is paused
// while the tile is off-screen so the tiles aren't all decoding at once. The
// poster sits underneath and the embed fades in once it reports playing.
function VimeoPersonVideo({ person }) {
  const wrapRef = useRef(null);
  const iframeRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);

  usePosterHold(person.img?.src);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMounted(true);
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  // Bound to the iframe already in the JSX, not to a container, for the same
  // reason as MastheadVideo. The SDK is imported lazily to keep it out of the
  // entry bundle. Its destroy() is skipped for the same StrictMode reason.
  useEffect(() => {
    if (!mounted) return undefined;
    let cancelled = false;
    let player;
    let observer;
    import("@vimeo/player").then(({ default: Player }) => {
      if (cancelled) return;
      player = new Player(iframeRef.current);
      player.on("playing", () => setPlaying(true));
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) player.play().catch(() => {});
          else player.pause().catch(() => {});
        },
        { rootMargin: "200px" },
      );
      observer.observe(wrapRef.current);
    });
    return () => {
      cancelled = true;
      observer?.disconnect();
      player?.off("playing");
    };
  }, [mounted]);

  return (
    <div
      ref={wrapRef}
      className="relative aspect-video w-full overflow-hidden rounded-md"
    >
      {person.img && (
        <Picture
          src={person.img.src}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <iframe
        ref={iframeRef}
        src={
          mounted
            ? `https://player.vimeo.com/video/${person.vimeoId}?${PERSON_EMBED_PARAMS}`
            : undefined
        }
        title={`${person.name} video`}
        allow="autoplay"
        className="absolute block transition-opacity duration-500"
        style={{
          // 8px overscan a side pushes the player's bright bottom-edge line
          // out of the clip (same trick as MastheadVideo).
          top: -8,
          left: -8,
          width: "calc(100% + 16px)",
          height: "calc(100% + 16px)",
          colorScheme: "light",
          opacity: playing ? 1 : 0,
        }}
      />
    </div>
  );
}

export default function About() {
  const { openOverlay } = useOverlay();
  return (
    <main
      itemScope
      itemType="https://schema.org/Organization"
      className="flex min-h-screen flex-col gap-0 bg-surface-default light:bg-neutral-0 pb-1000 font-narrow font-light text-neutral-0 light:text-neutral-1000 lg:pb-1800"
    >
      <meta itemProp="name" content="Davis Elen Advertising" />
      <meta itemProp="url" content="https://daviselen.com" />
      
      <section id="top">
        <MastheadImage src="/images/about-masthead.jpg" alt="About Davis Elen Advertising" title={`Inside \nthe Box`} />
        {/* <Picture src="/images/about-masthead.jpg" alt="About Davis Elen Advertising" className="block w-full h-auto rounded-md" /> */}
        <div className="px-300 lg:px-8">
          {/* grid-cols-12 with a fixed col-span-6 was applying at every
              width — on a phone that's a ~150px-wide copy column with every
              word wrapping. Single column below md, real 2-up split at md+
              (Careers.jsx's matching intro block already gates this
              correctly with `lg:grid`; this one had no gate at all). */}
          <SplitIntro
            gridClassName="grid grid-cols-1 gap-100 md:gap-200 lg:gap-300 xl:gap-400 md:grid-cols-12"
            leftClassName="md:col-span-6 md:col-start-1"
            rightClassName="md:col-span-6 md:col-start-7"
            left="Davis Elen has been in business since 1948 and independent every single day of it. No holding company, no parent, nobody upstairs to run it past. That isn't nostalgia. It's just how we like to work."
            right="We make advertising that has a job to do. Move product off a shelf. Get a car onto a lot. Put a person in a store. The constraint is the whole point. Give us a real budget, a real deadline and a real strategy and we'll show you what happens inside the box."
          />
        </div>
      </section>
      <MediaObject
        title="$18 Billion in Sales from Over 4000 Locations."
        text="Through retail locations that include Toyota, Best Buy, Smart & Final and over 25% of McDonald’s restaurants nationwide."
        imgSrc="/images/about-map.jpg"
        imgAlt="Map of Los Angeles County showing the locations of Toyota dealership, McDonald's restaurant, Best Buy and Smart & Final locations."
        imageCta="View the map"
        onClick={() => openOverlay(RETAIL_MAP)}
      />
      <section id="people" className="flex flex-col gap-600 px-300 pt-1000 md:pt-3000 lg:gap-1000 lg:px-8">
        <div className="flex flex-col gap-600">
          <HeadingReveal
            className="font-display text-fluid-2xl uppercase md:text-7xl lg:text-display-h3"
            text={`Let’s \nMeet Up`}
          />
          <TextReveal className="max-w-prose text-fluid-sm md:text-xl lg:text-pre-title"
            text="This is the whole meeting. No account person you'll never see again, no bench of strangers who vanish after the pitch. The people in the room are the people who do the work."
          />
        </div>
        {/* grid-cols-4 at every width put 12 portrait tiles four-across on a
            phone (~80px tiles) — 2-up below md, real 4-up unchanged. */}
        <div className="grid grid-cols-2 gap-100 md:grid-cols-4 lg:gap-400">
          {people.map((person, index) => (
          <div key={index} className="teams-video relative rounded-md bg-surface-alt light:bg-neutral-100">
            {person.vimeoId ? (
              <VimeoPersonVideo person={person} />
            ) : person.video ? (
              // aspect-video is Tailwind's built-in 16/9, so the tile keeps the
              // exact ratio the <Picture> below it uses.
              <PersonVideo person={person} />
            ) : (
              <Picture className="flex aspect-[16/9] h-auto w-full items-center justify-center rounded-md" src={person.img.src} alt={person.name} />
            )}
            {person.vimeoId || person.video ? (
              <span className="absolute bottom-100 left-100 flex gap-[6px] rounded-[3px] bg-neutral-1000/50 px-100 text-neutral-0 text-[12px] tracking-[0.03em]">
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
        text="From a small printing shop in Glendale to one of the largest independently owned ad agencies in the country."
        imgSrc="/images/about-history.jpg"
        imgAlt="Photo of Henry Mayers and the four partners who took over in 1958."
        onClick={() => openOverlay(ORIGIN_STORY)}
        opensVideo
      />
      <section id="clients" className="flex flex-col gap-0 px-300 pt-1000 md:pt-3000 lg:px-8">
        <HeadingReveal
          as="h2"
          className="mb-1200 font-display text-fluid-2xl uppercase md:text-7xl lg:text-display-h3"
          text={`Client \nExperience`}
        />
        {/* Full-bleed breakout: the section keeps its px-300/px-8 so the heading
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
                    className="h-auto w-full light:invert"
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
