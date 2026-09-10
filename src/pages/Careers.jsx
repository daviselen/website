import MastheadImage from "../design-system/components/MastheadImage";
import HeadingReveal from "../design-system/components/HeadingReveal";
import TextReveal from "../design-system/components/TextReveal";
import JobOpenings from "../sections/JobOpenings.jsx";
import CTABanner from "../sections/CTABanner.jsx";

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
        <div class="px-8 pb-1000 rounded-md overflow-hidden">
          <MastheadImage src="/images/careers-masthead.jpg" alt="Get a Job" title={`Get \na Job`} />
        </div>
        <div className="px-8">
          <div className="grid grid-cols-12 gap-400">
            <TextReveal className="text-display-stat mb-6 pr-300 col-span-6 col-start-1"
              text="Davis Elen, or DE, is one of the largest independently owned agencies in the country. We have a storied 50-year past but we’re not resting on what we’ve done. We’re always looking for what’s next. For people who can bring fresh, no-holds-barred thinking and a similar independent spirit to our table. Might that be you?"
            />
            <TextReveal className="text-display-stat mb-6 pr-600 col-span-6 col-start-7"
              text="Headquartered in the heart of downtown LA, but with ridiculously talented people found all throughout the country, our multicultural staff is expert in crafting ads for the general market, Hispanic market, and Asian markets. Sound like your kind of place? If so, we always have open positions. Take a look."
            />
          </div>
        </div>
      </section>
      <JobOpenings />
      <section
        id="always_looking"
        className="flex flex-col gap-1000 px-8 mt-3000"
      >
        <HeadingReveal
          as="h3"
          text={`Always \nLooking`}
          className="font-display text-display-h3 uppercase leading-none"
        />
        <ul className="flex flex-col">
          <li className="border-t-2 border-neutral-0 last:border-b-2">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-100 pt-600 pb-800 hover:text-primary-300 transition-colors md:flex-row md:items-baseline md:justify-between md:gap-400"
            >
              <div className="flex flex-col gap-200 basis-[calc(100%-46rem)] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Position
                </span>
                <span className="font-narrow uppercase text-display-stat">
                  Copywriter
                </span>
              </div>
              <div className="flex flex-col gap-200 basis-[20rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Group
                </span>
                <span className="shrink-0 font-narrow text-display-stat uppercase">
                  <span className="inline-block">Creative</span>
                </span>
              </div>
              <div className="flex flex-col gap-200 basis-[26rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Location
                </span>
                <span className="shrink-0 font-narrow text-display-stat uppercase">
                    <span className="inline-block">Los Angeles, <abbr title="California">CA</abbr></span>
                </span>
              </div>
            </a>
          </li>
          <li className="border-t-2 border-neutral-0 last:border-b-2">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-100 pt-600 pb-800 hover:text-primary-300 transition-colors md:flex-row md:items-baseline md:justify-between md:gap-400"
            >
              <div className="flex flex-col gap-200 basis-[calc(100%-46rem)] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Position
                </span>
                <span className="font-narrow uppercase text-display-stat">
                  Art Director
                </span>
              </div>
              <div className="flex flex-col gap-200 basis-[20rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Group
                </span>
                <span className="shrink-0 font-narrow text-display-stat uppercase">
                  <span className="inline-block">Creative</span>
                </span>
              </div>
              <div className="flex flex-col gap-200 basis-[26rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Location
                </span>
                <span className="shrink-0 font-narrow text-display-stat uppercase">
                    <span className="inline-block">Los Angeles, <abbr title="California">CA</abbr></span>
                </span>
              </div>
            </a>
          </li>
          <li className="border-t-2 border-neutral-0 last:border-b-2">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-100 pt-600 pb-800 hover:text-primary-300 transition-colors md:flex-row md:items-baseline md:justify-between md:gap-400"
            >
              <div className="flex flex-col gap-200 basis-[calc(100%-46rem)] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Position
                </span>
                <span className="font-narrow uppercase text-display-stat">
                  Production Designer
                </span>
              </div>
              <div className="flex flex-col gap-200 basis-[20rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Group
                </span>
                <span className="shrink-0 font-narrow text-display-stat uppercase">
                  <span className="inline-block">Creative</span>
                </span>
              </div>
              <div className="flex flex-col gap-200 basis-[26rem] px-600">
                <span className="text-small uppercase text-neutral-400">
                  Location
                </span>
                <span className="shrink-0 font-narrow text-display-stat uppercase">
                    <span className="inline-block">Los Angeles, <abbr title="California">CA</abbr></span>
                </span>
              </div>
            </a>
          </li>
        </ul>
      </section>
      <section
        id="culture"
        className="flex flex-row gap-1000 px-8 mt-3000"
      >
        <div className="flex flex-col gap-600 basis-[50%]">
          <HeadingReveal
            as="h3"
            text={`Live your \nbest life`}
            className="font-display text-display-h3 uppercase leading-none"
          />
          <div>
            <TextReveal
              className="text-display-stat mb-300 pr-600"
              text="Work is important but so is your life outside of work. Davis Elen dedicates resources and support so you can stay healthy:"
            />
            <ul className="text-display-stat list-[square] list-inside pl-200">
              <li className="mb-300">Comprehensive health plan</li>
              <li className="mb-300">401(k) retirement plan</li>
              <li className="mb-300">Generous paid vacation and sick days</li>
              <li className="mb-300">Hybrid remote/in-office work environment</li>
              <li className="mb-300">Various wellness programs, including discounted gym membership</li>
              <li className="mb-300">Selective options, including pet insurance, supplemental life insurance, and more</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-1000 basis-[50%]">
          <img src="/images/careers-best-people.jpg" alt="The best people: Giancarlo Llacar, Alexander Bell, Jason Corey"
            className="rounded-md"
          />
          <div className="flex flex-col gap-600">
            <HeadingReveal
              as="h3"
              text={`Hang with the \nbest people`}
              className="font-display text-display-h3 uppercase leading-none"
            />
            <TextReveal
              className="text-display-stat pr-600"
              text="Davis Elen’s work and culture thrive on diversity and we’re proud to be an equal opportunity employer."
            />
            <TextReveal
              className="text-display-stat pr-600"
              text="All individuals seeking employment at Davis Elen are considered without regard to race, color, religion, national origin, age, sex, marital status, ancestry, physical or mental disability, veteran status, gender identity, sexual orientation, or any other legally protected characteristic."
            />
          </div>
        </div>
      </section>
    </main>
  );
}
