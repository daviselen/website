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
import { useRef } from "react";
import StyledButton from "../../design-system/components/Button";
import Card from "../../design-system/components/Card";
import HeadingReveal from "../../design-system/components/HeadingReveal";
import MastheadImage from "../../design-system/components/MastheadImage";
import { useStaggerReveal } from "../../design-system/animation";
import { newsHighlights } from "../../data/newsHighlights";
import { useArticleContent } from "./richText";

export default function NewsStory({ article }) {
  const gridRef = useRef(null);
  const content = useArticleContent(article);

  useStaggerReveal(gridRef, { amount: 0.333 });

  if (!content) {
    return null;
  }

  const { title, heroImageUrl, heroAlt, link, body } = content;
  const slug = article.entries[0].fields.slug?.["en-US"];
  const moreNews = newsHighlights
    .filter((item) => item.slug !== slug)
    .slice(0, 2);

  return (
    <article id="news-story" className="mb-1600 lg:mb-3000">
      {heroImageUrl && <MastheadImage src={heroImageUrl} alt={heroAlt} />}

      <div className="grid gap-800 px-2 lg:grid-cols-12 lg:gap-x-8 lg:px-8">
        <div className="flex flex-col items-start gap-800 lg:col-span-7 lg:gap-1800 lg:pr-700">
          <h1 className="font-display text-6xl uppercase leading-none md:text-8xl xl:text-display-h2">
            {title}
          </h1>
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

        <div className="text-2xl font-normal *:mb-600 last:*:mb-0 md:text-3xl xl:text-display-stat lg:col-span-5 lg:pr-400 xl:text-story-body">
          {body}
        </div>
      </div>

      {moreNews.length > 0 && (
        <section className="mt-1600 grid gap-1000 px-2 md:grid-cols-3 lg:mt-3000 lg:gap-8 lg:px-8">
          <HeadingReveal
            as="h2"
            text={`More \nNews`}
            className="font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h3"
          />
          <div
            ref={gridRef}
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
