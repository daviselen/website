import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadArticle } from "../data/news/index";
import MastheadImage from "../design-system/components/MastheadImage";
import NotFound from "./NotFound";
import {
  STORY_LAYOUT,
  getArticleLayout,
  useArticleContent,
} from "./news/richText";
import NewsStory from "./news/NewsStory";

// Archive layout: every migrated 2017–2023 article, and any article without
// `layout: "story"`. Kept byte-for-byte as it was before NEWS STORY existed.
function NewsArticleArchive({ article }) {
  const content = useArticleContent(article);

  if (!content) {
    return null;
  }

  const { title, publishedAt, pubDate, category, heroImageUrl, heroAlt, body } =
    content;

  return (
    <article className="news-article flex flex-col gap-1000">
      <header>
        {heroImageUrl && (
          <MastheadImage src={heroImageUrl} alt={heroAlt} title={category} />
        )}
        <div className="flex max-w-prose flex-col gap-200 px-300 lg:px-8 text-fluid-sm md:text-xl lg:text-pre-title">
          {pubDate && (
            <time className="font-display tracking-wide" dateTime={publishedAt}>
              {pubDate.toLocaleDateString("en-US", { dateStyle: "long" })}
            </time>
          )}
          <h1 className="font-display text-fluid-2xl uppercase leading-none md:text-8xl xl:text-display-h3">{title}</h1>
        </div>
      </header>

      <div className="news-content">
        <div className="news-body *:ul:list-outside px-300 lg:px-8 text-fluid-sm md:text-xl lg:text-pre-title *:mb-600 *:max-w-prose *:marker:text-primary-300 light:*:marker:text-primary-800 [&_h2]:mt-1000 [&_h2]:font-display [&_h2]:text-fluid-xl md:[&_h2]:text-display-h4 [&_h2]:first:mt-0 [&_h2]:first:text-fluid-lg md:[&_h2]:first:text-display-h5 [&_h3]:mt-800 [&_h3]:font-display [&_h3]:text-fluid-lg md:[&_h3]:text-display-h5 [&_li]:mb-300 [&_ul]:list-outside [&_ul]:list-[square] [&_ul]:pl-600 [&_ul]:text-fluid-sm md:[&_ul]:text-xl lg:[&_ul]:text-pre-title">
          {body}
        </div>
      </div>
    </article>
  );
}

export default function NewsArticlePage() {
  const { slug } = useParams();

  // `undefined` while the article chunk loads, `null` when the slug has no file.
  const [loaded, setLoaded] = useState({});
  useEffect(() => {
    let current = true;
    loadArticle(slug).then((article) => {
      if (current) setLoaded({ slug, article });
    });
    return () => {
      current = false;
    };
  }, [slug]);

  // Holds the page open while the chunk loads so the footer doesn't jump up.
  if (loaded.slug !== slug) return <div className="min-h-screen" aria-hidden />;
  const article = loaded.article;

  if (!article) {
    return <NotFound />;
  }

  // Keyed by slug: moving between articles (e.g. via "More News") reuses this
  // instance, and MastheadImage's reveal only runs on its first load, so the
  // next article's image would otherwise appear without animating.
  return getArticleLayout(article) === STORY_LAYOUT ? (
    <NewsStory key={slug} article={article} />
  ) : (
    <NewsArticleArchive key={slug} article={article} />
  );
}
