import NavBar from "../sections/NavBar.jsx";
import MastheadImage from "../design-system/components/MastheadImage";
import CTABanner from "../sections/CTABanner";
import Footer from "../sections/Footer.jsx";
import MediaObject from "../design-system/components/MediaObject.jsx";
import TextReveal from "../design-system/components/TextReveal.jsx";
import { useVideoOverlay } from "../design-system/components/VideoOverlay.jsx";

// Hosted on Vimeo rather than self-served from /public/videos, so the overlay
// gets its `embed` payload (an iframe player URL) instead of `src`. The
// canonical share link is https://vimeo.com/849298824 — the player.vimeo.com
// host is the embeddable form of the same video, and autoplay=1 matches the
// autoPlay the overlay already applies to self-hosted files.
const ORIGIN_STORY = {
  embed: "https://player.vimeo.com/video/849298824?autoplay=1",
  title: "Our Origin Story",
};

const people = [
  {
    name: "David Moranville",
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
    name: "Jenny Rusinko",
    img: {
      src: "/images/portraits/jenny-rusinko.jpg",
    },
  },
  {
    name: "Cassedy Banks",
    img: {
      src: "",
    },
  },
  {
    name: "Zachary Moranville",
    img: {
      src: "/images/portraits/zachary-moranville.jpg",
    },
  },
  {
    name: "Lucía Galicia",
    img: {
      src: "",
    },
  },
  {
    name: "Stan Kaplan",
    img: {
      src: "/images/portraits/stan-kaplan.jpg",
    },
  },
  {
    name: "Joshua Walan",
    img: {
      src: "",
    },
  },
  {
    name: "Alonso Núñez Sarrapy",
    img: {
      src: "",
    },
  },
  {
    name: "Christina Dominguez",
    img: {
      src: "",
    },
  },
  {
    name: "Tyler Grinham",
    img: {
      src: "",
    },
  },
  {
    name: "Jorge Rodriguez",
    img: {
      src: "",
    },
  },
];

const clients = [
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
      src: "/images/clients/client-logo-05-lively.svg",
      alt: "Lively",
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

export default function About() {
  const { openVideo } = useVideoOverlay();
  return (
    <main
      itemScope
      itemType="https://schema.org/Organization"
      className="min-h-screen bg-surface-default pb-1800 font-narrow font-light text-neutral-0 flex flex-col gap-0"
    >
      <meta itemProp="name" content="Davis Elen Advertising" />
      <meta itemProp="url" content="https://daviselen.com" />
      
      <section id="top">
        <MastheadImage src="/images/about-masthead.jpg" alt="About Davis Elen Advertising" className="px-8 pb-1000 rounded-md overflow-hidden" />
        <div className="px-8 columns-2">
          <TextReveal className="text-pre-title mb-6"
            text="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit."
          />
          <TextReveal className="text-pre-title mb-6"
            text="Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam."
          />
        </div>
      </section>
      <MediaObject
        title="$18 Billion in Sales from Over 4000 Locations."
        text="Through Toyota, Best Buy, Smart & Final, and over 25% of McDonald’s restaurants nationwide."
        imgSrc="/images/about-map.jpg"
        imgAlt="Map of Los Angeles County showing the locations of Toyota dealership, McDonald's restaurant, Best Buy and Smart & Final locations."
      />
      <section id="people" className="pt-3000 px-8 flex flex-col gap-1000">
        <h2 className="text-display-h2 font-display uppercase">Let’s<br></br> Meet Up</h2>
        <div className="grid grid-cols-4 gap-400">
          {people.map((person, index) => (
          <div key={index} className="teams-video bg-surface-alt relative rounded-md">
            <img className="h-auto w-full aspect-[16/9] flex justify-center items-center rounded-md" src={person.img.src} alt={person.name} />
            {!person.img.src ? (
              <span className="absolute bottom-100 left-100 flex gap-[6px] bg-neutral-1000/50 text-[12px] tracking-200 tracking-[0.03em] px-[8px] rounded-[3px]">
                <span className="py-[8px]">{person.name}</span>
                <img src="/icons/teams-mic.svg" />
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
        subhead="Runtime 44:32"
        text="From a small print shop in Glendale to one of the largest independently-owned agencies in the country."
        imgSrc="/images/about-history.jpg"
        imgAlt="Photo of Henry Mayers and the four partners who took over in 1958."
        onClick={() => openVideo(ORIGIN_STORY)}
      />
      <section id="clients" className="pt-3000 px-8 flex flex-col gap-0">
        <h2 className="text-display-h2 font-display uppercase">Client <br />Experience</h2>
        <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-400">
          {clients.map((client, index) => (
            <div key={index} className="">
              <img src={client.img.src} alt={client.img.alt} />
            </div>
          ))}
        </div>
      </section>
      <CTABanner />
    </main>
  );
}
