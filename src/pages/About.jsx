import { lazy, Suspense, useEffect, useRef } from "react";
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

const people = [
  {
    name: "Mark Davis",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249436011/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=3025fc48efe47bde1631e5046a23d165f2396b74f9d462fdd63aa5f35cb41553",
    video: "/videos/people/mark-davis.mp4"
  },
  {
    name: "Terry Sullivan",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249436022/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=1924502bc567c6432f649e212aed0c379f3408dd1d8b8b2f27810ece0ce6f65e",
    video: "/videos/people/terry-sullivan.mp4"
  },
  {
    name: "David Moranville",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249436023/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=886c980784836d30760a37f2ab1a3ec6a673af12e9b76483d09d3e9636cf47d4",
    video: "/videos/people/david-moranville.mp4",
    img: {
      src: "/images/portraits/david-moranville.jpg",
    },
  },
  {
    name: "Malu Santamaria",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249436009/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=a1ef27a0b8c49e60fd5e5db362d4f250a0ecf1fe6703d6bac086439cd362a3c5",
    video: "/videos/people/malu-santamaria.mp4"
  },
  {
    name: "Marianne Turner",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249436012/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=df78138610a2e91a5d5eda23d6e2edfa4efdb4782d3f93400babd7a9982171e4",
    img: {
      src: "/images/portraits/marianne-turner.jpg",
    },
    video: "/videos/people/marianne-turner.mp4"
  },
  {
    name: "Bert Kelley",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435965/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=4ef31d39d8052981ca350a7aedc5329fe41ee27e1119991246ec0c32695b196e",
    video: "/videos/people/bert-kelley.mp4",
  },
  {
    name: "Jennifer Lin",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435997/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=a30cc5f4e86d40f35a273ae3636e6b60113e6dacf8bf6a029b490dea885b4cd4",
    video: "/videos/people/jennifer-lin.mp4"
  },
  {
    name: "Brett Bandow",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435994/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=6492ef42e986a5d16ba6a83185bcf0666bf9877e35d22d1cb55b8adbcf7f6931",
    video: "/videos/people/brett-bandow.mp4",
  },
  {
    name: "John Papadopoulos",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249436001/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=a4342ec5d6b3ca4e6480df9d67e1c867c9b4da1d3a3c62bc37c9607e9973e81a",
    video: "/videos/people/john-papadopoulos.mp4"
  },
  {
    name: "Karen Lipker",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435962/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=a57f03dc75da7d4b2b9255682de5ad31a581aed9e7c0e27a300fc8d64de61ff4",
    img: {
      src: "/images/portraits/karen-lipker.jpg",
    },
    video: "/videos/people/karen-lipker.mp4"
  },
  {
    name: "Stan Kaplan",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249436026/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=0ca0cc2a6d38e4f0f1f2a6b41fddf147cc96eea186c78a015cef688af07e5f50",
    video: "/videos/people/stan-kaplan.mp4",
    img: {
      src: "/images/portraits/stan-kaplan.jpg",
    },
  },
  {
    name: "Amy Drell",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249447446/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=b50f7797805ab802ba6f3217e02af44fbc2c86c04b0d0fa23f06c0ea35f397b4",
    img: {
      src: "/images/portraits/amy-drell.jpg",
    },
    video: "/videos/people/amy-drell.mp4"
  },
  {
    name: "Shelly Choi",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435961/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=679d6890a79a22132d96b7687fa5351ec2da211f45ac5a20e6a7c4c2df7f1614",
    img: {
      src: "/images/portraits/shelly-choi.jpg",
    },
    video: "/videos/people/shelly-choi.mp4"
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
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435964/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=8644e4967adf9caf8545972cd94c922d324ec598a166d4cd9a64d7cfd2faf593",
    img: {
      src: "/images/portraits/zachary-moranville.jpg",
    },
    video: "/videos/people/zachary-moranville.mp4"
  },
  {
    name: "Alejandro Clopatofsky",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435952/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=8ae1e22b0caa727a4e03787374a454ac69557514c016b393f5003e1ba5fefa6c",
    img: {
      src: "/images/portraits/cassedy-banks.jpg",
    },
    video: "/videos/people/alejandro-clopatofsky.mp4"
  },
  // {
  //   name: "Lucía Galicia",
  //   img: {
  //     src: "/images/portraits/lucia-galicia.jpg",
  //   },
  // },
  {
    name: "Derek Morrison",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435954/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=f17df01be7f9627112407878f83f50056e5acd7fd9758210181806c396973b55",
    video: "/videos/people/derek-morrison.mp4"
  },
  {
    name: "Jessica Westlake",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435951/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=5a3f3d156527ed6261c0c6fbd8674f6d2a7e92f6172ac46d7c96083efe0770f3",
    video: "/videos/people/jessica-westlake.mp4"
  },
  {
    name: "Brian Banks",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249435950/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=26bd3b025c6fbf29a9d753a04586e0667a468448046add34c5624d4e12731702",
    video: "/videos/people/brian-banks.mp4"
  },
  {
    name: "Marcos Arroyo",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249436013/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=9fe4569303e94c55587cf51bca7752f1dd45b4425930fed03a82dcab6a01a32c",
    video: "/videos/people/marcos-arroyo.mp4"
  },
  {
    name: "Julie Saracco",
    vimeo: "https://player.vimeo.com/progressive_redirect/playback/1249457961/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=04c46683324c5c6a61b664a515842a4607ecc17f061009769e1fa6ba093544fc",
    video: "/videos/people/julie-saracco.mp4"
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

// A plain <video>, never the Vimeo embed: the embed's player made the first
// tile ~15x slower to start. `vimeo` is the clip's Vimeo file link (540p
// progressive), listed first so Vimeo carries the bandwidth; `video` is the
// local copy (`npm run encode:video`) the browser falls back to when that
// source fails to load. Both hosts measured within a fraction of a second.
// preload="none" keeps the tiles from downloading up front; each tile plays
// only while near the viewport. Same background-video contract as
// MastheadVideo: muted + playsInline make autoplay legal on Safari/iOS.
function PersonVideo({ person }) {
  const ref = useRef(null);

  // Hold the preloader until the poster is decoded, so the tiles paint with
  // their thumbnails instead of empty boxes. Settles on error too (the
  // preloader's own MAX_WAIT_MS caps a slow one).
  useEffect(() => {
    const src = person.img?.src;
    if (!src) return undefined;
    const release = holdForMedia();
    const img = new Image();
    img.src = src;
    img.decode().catch(() => {}).then(release);
    return release;
  }, [person.img?.src]);

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
      {person.vimeo && <source src={person.vimeo} type="video/mp4" />}
      <source src={person.video} type="video/mp4" />
    </video>
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
            {person.video ? (
              // aspect-video is Tailwind's built-in 16/9, so the tile keeps the
              // exact ratio the <Picture> below it uses.
              <PersonVideo person={person} />
            ) : (
              <Picture className="flex aspect-[16/9] h-auto w-full items-center justify-center rounded-md" src={person.img.src} alt={person.name} />
            )}
            {person.video ? (
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
