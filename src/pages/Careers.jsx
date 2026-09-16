import MastheadImage from "../design-system/components/MastheadImage";
import HeadingReveal from "../design-system/components/HeadingReveal";
import TextReveal from "../design-system/components/TextReveal";
import JobOpenings from "../sections/JobOpenings.jsx";
import CTABanner from "../sections/CTABanner.jsx";
import ListMaskReveal from "../design-system/components/ListMaskReveal.jsx";

const benefits = [
  'Comprehensive health plan',
  '401(k) retirement plan',
  'Generous paid vacation and sick days',
  'Hybrid remote/in-office work environment',
  'Various wellness programs, including discounted gym membership',
  'Selective options, including pet insurance, supplemental life insurance, and more',
];

// NavBar and Footer are not rendered here: Layout.jsx already mounts both
// around every route, and its wrapper supplies the page background, the
// font-narrow/neutral-0 defaults, and the py-1800 that clears the fixed
// header.
//
// CTABanner stays on the page even when there are no openings, so the empty
// state reads as intentional — it carries real, human-written contact copy
// and a route into a conversation, which is the useful thing to offer someone
// who came here and found nothing listed.
export default function Careers() {
  return (
    <main
      className="min-h-screen bg-surface-default pb-1800 font-narrow font-light text-neutral-0 flex flex-col gap-0"
    >
      <section id="top">
        {/* Was `class=`, a plain HTML attribute React silently drops — none
            of px-8/pb-1000/rounded-md/overflow-hidden were ever applying. */}
        <div className="px-8 pb-1000 rounded-md overflow-hidden">
          <MastheadImage src="/images/careers-masthead.jpg" alt="Get a Job" title={`Get \na Job`} />
        </div>
        <div className="px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-400">
            <TextReveal className="text-lg md:text-xl lg:text-pre-title mb-6 lg:pr-300 lg:col-span-6 lg:col-start-1"
              text="Davis Elen is one of the largest independently owned agencies in the country. We've been at it since 1948 and we're not coasting on it. We're looking for people who bring fresh, no-holds-barred thinking and the same independent streak we have. Might be you."
            />
            <TextReveal className="text-lg md:text-xl lg:text-pre-title mb-6 lg:pr-600 lg:col-span-6 lg:col-start-7"
              text="We're headquartered in downtown LA with ridiculously talented people scattered across the country. Our multicultural staff writes for the general market, the Hispanic market and Asian markets. Sound like your kind of place? Here's what's open."
            />
          </div>
        </div>
      </section>
      <JobOpenings />
      <section
        id="always_looking"
        className="flex flex-col gap-1000 px-8 mt-1000 md:mt-3000"
      >
        <div className="flex flex-col gap-600">
        <HeadingReveal
          as="h3"
          text={`Always \nLooking`}
          className="font-display text-5xl md:text-7xl lg:text-display-h3 uppercase leading-none"
        />
        <TextReveal className="text-lg md:text-xl lg:text-pre-title max-w-prose"
          text="These aren't posted because they're open. They're posted because we'll always make time for someone good."
        />
        </div>
        <ul className="flex flex-col">
          <li className="border-t-2 border-neutral-0 last:border-b-2">
            <a
              href="/contact?position=copywriter"
              className="flex flex-col gap-100 pt-600 pb-800 hover:text-primary-300 transition-colors md:flex-row md:items-baseline md:justify-between md:gap-400"
            >
              <div className="flex flex-col gap-200 md:basis-[calc(100%-46rem)] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Position
                </span>
                <span className="font-narrow uppercase text-lg md:text-xl lg:text-pre-title">
                  Copywriter
                </span>
              </div>
              <div className="flex flex-col gap-200 md:basis-[20rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Group
                </span>
                <span className="shrink-0 font-narrow text-lg md:text-xl lg:text-pre-title uppercase">
                  <span className="inline-block">Creative</span>
                </span>
              </div>
              <div className="flex flex-col gap-200 md:basis-[26rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Location
                </span>
                <span className="shrink-0 font-narrow text-lg md:text-xl lg:text-pre-title uppercase">
                    <span className="inline-block">Los Angeles, <abbr title="California">CA</abbr></span>
                </span>
              </div>
            </a>
          </li>
          <li className="border-t-2 border-neutral-0 last:border-b-2">
            <a
              href="/contact?position=art_director"
              className="flex flex-col gap-100 pt-600 pb-800 hover:text-primary-300 transition-colors md:flex-row md:items-baseline md:justify-between md:gap-400"
            >
              <div className="flex flex-col gap-200 md:basis-[calc(100%-46rem)] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Position
                </span>
                <span className="font-narrow uppercase text-lg md:text-xl lg:text-pre-title">
                  Art Director
                </span>
              </div>
              <div className="flex flex-col gap-200 md:basis-[20rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Group
                </span>
                <span className="shrink-0 font-narrow text-lg md:text-xl lg:text-pre-title uppercase">
                  <span className="inline-block">Creative</span>
                </span>
              </div>
              <div className="flex flex-col gap-200 md:basis-[26rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Location
                </span>
                <span className="shrink-0 font-narrow text-lg md:text-xl lg:text-pre-title uppercase">
                    <span className="inline-block">Los Angeles, <abbr title="California">CA</abbr></span>
                </span>
              </div>
            </a>
          </li>
          <li className="border-t-2 border-neutral-0 last:border-b-2">
            <a
              href="/contact?position=production_designer"
              className="flex flex-col gap-100 pt-600 pb-800 hover:text-primary-300 transition-colors md:flex-row md:items-baseline md:justify-between md:gap-400"
            >
              <div className="flex flex-col gap-200 md:basis-[calc(100%-46rem)] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Position
                </span>
                <span className="font-narrow uppercase text-lg md:text-xl lg:text-pre-title">
                  Production Designer
                </span>
              </div>
              <div className="flex flex-col gap-200 md:basis-[20rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Group
                </span>
                <span className="shrink-0 font-narrow text-lg md:text-xl lg:text-pre-title uppercase">
                  <span className="inline-block">Creative</span>
                </span>
              </div>
              <div className="flex flex-col gap-200 md:basis-[26rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Location
                </span>
                <span className="shrink-0 font-narrow text-lg md:text-xl lg:text-pre-title uppercase">
                    <span className="inline-block">Los Angeles, <abbr title="California">CA</abbr></span>
                </span>
              </div>
            </a>
          </li>
        </ul>
      </section>
      {/* flex-row + basis-[50%] on both children was unconditional — on a
          phone that's two ~150px columns instead of the intended two-up
          desktop layout, and basis-[50%] on a flex-COLUMN (which is what
          these children fall back to once flex-row is gated) sets a HEIGHT,
          not a width, so it would have clipped each column to half the
          section's height too. Stacked below md, real 2-up at md+. */}
      <section
        id="culture"
        className="flex flex-col md:flex-row gap-1000 px-8 mt-1000 md:mt-3000"
      >
        <div className="flex flex-col gap-600 md:basis-[50%]">
          <HeadingReveal
            as="h3"
            text={`Live your \nbest life`}
            className="font-display text-5xl md:text-7xl lg:text-display-h3 uppercase leading-none"
          />
          <div>
            <TextReveal
              className="text-lg md:text-xl lg:text-pre-title mb-300 pr-600"
              text="Work matters. So does the rest of your life. We put real money behind that:"
            />
            {/* <ListMaskReveal
              items={benefits}
              barColor="#ff3366"
              className="text-pre-title list-[square] pl-200"
            /> */}
            <ul className="text-lg md:text-xl lg:text-pre-title list-[square] list-outside pl-600">
              <li className="mb-300">Comprehensive health plan</li>
              <li className="mb-300">401(k) retirement plan</li>
              <li className="mb-300">Generous paid vacation and sick days</li>
              <li className="mb-300">Hybrid remote/in-office work environment</li>
              <li className="mb-300">Various wellness programs, including discounted gym membership</li>
              <li className="mb-300">Selective options, including pet insurance, supplemental life insurance, and more</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-1000 md:basis-[50%]">
          <img src="/images/careers-best-people.jpg" alt="The best people: Giancarlo Llacar, Alexander Bell, Jason Corey"
            className="rounded-md"
          />
          <div className="flex flex-col gap-600">
            <HeadingReveal
              as="h3"
              text={`Hang with the \nbest people`}
              className="font-display text-5xl md:text-7xl lg:text-display-h3 uppercase leading-none"
            />
            <TextReveal
              className="text-lg md:text-xl lg:text-pre-title pr-600"
              text="Never work under someone who isn't better than you. That's the standard we hire against, and it's why the room is worth showing up to. Davis Elen's work and culture thrive on diversity and we're proud to be an equal opportunity employer."
            />
            <TextReveal
              className="text-lg md:text-xl lg:text-pre-title pr-600"
              text="All individuals seeking employment at Davis Elen are considered without regard to race, color, religion, national origin, age, sex, marital status, ancestry, physical or mental disability, veteran status, gender identity, sexual orientation, or any other legally protected characteristic."
            />
          </div>
        </div>
      </section>
    </main>
  );
}
