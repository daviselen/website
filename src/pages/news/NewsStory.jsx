// NEWS STORY layout — Figma frame "NEWS STORY" (1824:5658), pulled via
// get_design_context on its Masthead (1824:5721), button (1827:45) and
// "Group 77" more-news row (1824:5789). Opted into per article with
// `layout: "story"`; see getArticleLayout in ./richText.jsx.
//
// Desktop (1792px inset) geometry from the frame:
//   - hero: 1792x720, plain rounded image, no overlaid heading — so
//     MastheadImage gets no `title`. Its own pb-1000 is the 80px hero→copy gap.
//   - title left (976px, Headings/H3 184/128) with the "View the work" button
//     under it; body copy right, starting ~1061px, 695px wide (40/50 Book).
//     On a 12-col/32px-gap grid that's cols 1–7 (less 56px) and 8–12 (less
//     32px), within a few px of the frame.
//   - "MORE NEWS" (144/106) in col 1 of a 3-up grid, two cards (576px, 6/5
//     image = Card size "med") in cols 2–3, 240px below the copy block and
//     240px above the footer rule.
// The frame shows no publish date, so none is rendered.
//
// Desktop only: the title + button column pins while the body copy scrolls.
// It's a ScrollTrigger pin, not CSS sticky, because ScrollSmoother wraps the
// page in a transformed, overflow-hidden scroller that sticky can't see past.
// Below lg the column stays in flow, as in the frame.
import { useRef } from "react";
import StyledButton from "../../design-system/components/Button";
import Card from "../../design-system/components/Card";
import HeadingReveal from "../../design-system/components/HeadingReveal";
import MastheadImage from "../../design-system/components/MastheadImage";
import {
  ScrollTrigger,
  gsap,
  useGSAP,
  useStaggerReveal,
} from "../../design-system/animation";
import { newsHighlights } from "../../data/newsHighlights";
import { useArticleContent } from "./richText";

// Clears the fixed NavBarAlt (96px at lg) with a little air.
const PIN_TOP = 120;

export default function NewsStory({ article }) {
  const gridRef = useRef(null);
  const cardsRef = useRef(null);
  const pinRef = useRef(null);
  const content = useArticleContent(article);

  useStaggerReveal(cardsRef, { amount: 0.333 });

  useGSAP(
    () => {
      gsap.matchMedia().add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: gridRef.current,
          start: `top top+=${PIN_TOP}`,
          // Release once the grid's bottom meets the pinned column's bottom,
          // so the column never hangs past the end of the copy. Measured
          // lazily so a late font or image height is picked up on refresh.
          end: () => `bottom top+=${PIN_TOP + pinRef.current.offsetHeight}`,
          pin: pinRef.current,
          pinSpacing: false,
        });
      });
    },
    { scope: gridRef },
  );

  if (!content) {
    return null;
  }

  const { title, description, heroImageUrl, heroAlt, link, body } = content;
  const fields = article.entries[0].fields;
  const slug = fields.slug?.["en-US"];
  const metaTitle = fields.metaTitle?.["en-US"] ?? null;
  const jsonLd = fields.jsonLd?.["en-US"] ?? null;
  const moreNews = newsHighlights
    .filter((item) => item.slug !== slug)
    .slice(0, 2);

  return (
    <article id="news-story" className="mb-1600 lg:mb-3000">
      <title>{metaTitle ?? title}</title>
      {description && <meta name="description" content={description} />}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, "\\u003c")}
        </script>
      )}
      {heroImageUrl && <MastheadImage src={heroImageUrl} alt={heroAlt} />}

      <div
        ref={gridRef}
        className="grid gap-800 px-2 lg:grid-cols-12 lg:gap-x-8 lg:px-8"
      >
        <div
          ref={pinRef}
          className="flex flex-col items-start gap-800 lg:col-span-6 xl:col-span-7 lg:gap-1800 lg:self-start lg:pr-700"
        >
          <HeadingReveal
            as="h1"
            className="font-display text-6xl uppercase leading-none md:text-8xl xl:text-display-h3"
            text={title}
          ></HeadingReveal>
          {link && (
            <StyledButton
              as="a"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              variant="solid"
              size="big"
            >
              View the work
            </StyledButton>
          )}
        </div>

        <div className="font-normal *:mb-600 last:*:mb-0 md:text-3xl xl:text-pre-title lg:col-span-6 xl:col-span-5 news-body *:ul:list-outside text-pre-title *:max-w-prose *:marker:text-primary-300 [&_h2]:mt-1000 [&_h2]:font-display [&_h2]:text-display-h4 [&_h2]:first:mt-0 [&_h2]:first:text-display-h5 [&_h3]:mt-800 [&_h3]:font-display [&_h3]:text-display-h5 [&_li]:mb-300 [&_ul]:list-outside [&_ul]:list-[square] [&_ul]:pl-600 [&_ul]:text-lg md:[&_ul]:text-xl lg:[&_ul]:text-pre-title">
          {body}
        </div>
      </div>

      {moreNews.length > 0 && (
        <section className="mt-1600 grid gap-1000 px-2 md:grid-cols-3 lg:mt-3000 lg:gap-8 lg:px-8">
          <HeadingReveal
            as="h2"
            text={`More \nNews`}
            className="font-display text-7xl uppercase leading-none md:text-8xl lg:text-display-h4 xl:text-display-h3"
          />
          <div
            ref={cardsRef}
            className="grid gap-1000 md:col-span-2 md:grid-cols-2 lg:gap-8"
          >
            {moreNews.map((item) => (
              <Card key={item.heading} {...item} size="med" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
