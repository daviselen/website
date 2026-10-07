import { useParams } from "react-router-dom";
import { articles } from "../data/news/index";
import MastheadImage from "../design-system/components/MastheadImage";
import NotFound from "./NotFound";
import {
  LOCALE,
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
        <div className="flex max-w-prose flex-col gap-200 px-400 text-pre-title">
          {pubDate && (
            <time className="font-display tracking-wide" dateTime={publishedAt}>
              {pubDate.toLocaleDateString("en-US", { dateStyle: "long" })}
            </time>
          )}
          <h1 className="font-display text-display-h3 uppercase">{title}</h1>
        </div>
      </header>

      <div className="news-content">
        <div className="news-body *:ul:list-outside px-400 text-pre-title *:mb-600 *:max-w-prose *:marker:text-primary-300 [&_h2]:mt-1000 [&_h2]:font-display [&_h2]:text-display-h4 [&_h2]:first:mt-0 [&_h2]:first:text-display-h5 [&_h3]:mt-800 [&_h3]:font-display [&_h3]:text-display-h5 [&_li]:mb-300 [&_ul]:list-outside [&_ul]:list-[square] [&_ul]:pl-600 [&_ul]:text-lg md:[&_ul]:text-xl lg:[&_ul]:text-pre-title">
          {body}
        </div>
      </div>
    </article>
  );
}

export default function NewsArticlePage() {
  const { slug } = useParams();

  const article = articles.find(
    (article) => article.entries?.[0]?.fields?.slug?.[LOCALE] === slug,
  );

  if (!article) {
    return <NotFound />;
  }

  return getArticleLayout(article) === STORY_LAYOUT ? (
    <NewsStory article={article} />
  ) : (
    <NewsArticleArchive article={article} />
  );
}
