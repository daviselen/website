import NavBar from "../sections/NavBar.jsx";
import MastheadImage from "../design-system/components/MastheadImage";
import Footer from "../sections/Footer.jsx";
import MediaObject from "../design-system/components/MediaObject.jsx";

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

export default function About() {
  return (
    <main
      itemScope
      itemType="https://schema.org/Organization"
      className="min-h-screen bg-surface-default pb-1800 font-narrow font-light text-neutral-0 flex flex-col gap-3000"
    >
      <meta itemProp="name" content="Davis Elen Advertising" />
      <meta itemProp="url" content="https://daviselen.com" />
      
      <section id="top">
        <MastheadImage src="/images/about-masthead.jpg" alt="About Davis Elen Advertising" className="px-8 pb-1000 rounded-md overflow-hidden" />
        <div className="px-8 columns-2">
          <p className="text-pre-title mb-6">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
          <p className="text-pre-title mb-6">Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam.</p>
        </div>
      </section>
      <MediaObject
        title="$18 Billion in Sales from Over 4000 Locations."
        text="Through Toyota, Best Buy, Smart & Final, and over 25% of McDonald’s restaurants nationwide."
        imgSrc="/images/about-map.jpg"
        imgAlt="Map of Los Angeles County showing the locations of Toyota dealership, McDonald's restaurant, Best Buy and Smart & Final locations."
      />
      <section id="" className="px-8 flex flex-col gap-1000">
        <h2 className="text-display-h2 font-display uppercase">Let’s<br></br> Meet Up</h2>
        <div className="grid grid-cols-4 gap-50 p-50 bg-[#292828]">
          {people.map((person, index) => (
          <div key={index} className="teams-video bg-surface-alt relative">
            <img className="h-auto w-full aspect-[16/9] flex justify-center items-center" src={person.img.src} alt={person.name} />
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
    </main>
  );
}
