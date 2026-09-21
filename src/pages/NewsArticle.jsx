import { useParams, Link } from "react-router-dom";
import { articles } from "../data/news";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

function NewsArticle({ article }) {
  const renderOptions = {
    renderNode: {
      [BLOCKS.EMBEDDED_ENTRY]: (node) => {
        return <EmbeddedEntry node={node} />;
      },
    },
  };

  return (
    <article className="news-article px-400">
      <header>
        <h1 className="text-display-h2 font-display">{article.title}</h1>
        <img src={article.heroImage.src} alt={article.heroImage.alt} className="news-image" />
      </header>

      <div className="news-content">
        <div className="news-body text-pre-title *:mb-600">
          {documentToReactComponents(
            article.body,
            renderOptions
          )}
        </div>

        <a href={article.url}>Read more</a>
      </div>
    </article>
  );
}

export default function NewsArticlePage() {
  const { slug } = useParams();

  const article = articles.find(
    (article) => article.slug === slug
  );

  if (!article) {
    return (
      <main>
        <h1>Article not found</h1>
        <Link to="/news">Back to News</Link>
      </main>
    );
  }

  return <NewsArticle article={article} />;
}

function EmbeddedEntry({ node }) {
  const entry = node.data.target;

  if (entry.fields?.type === "vimeoVideo") {
    return (
      <VimeoEmbed
        videoId={entry.fields.videoId}
        hash={entry.fields.hash}
        title={entry.fields.title}
      />
    );
  }

  return null;
}

function VimeoEmbed({ videoId, hash, title }) {
  const src = new URL(
    `https://player.vimeo.com/video/${videoId}`
  );
  if (hash) {
    src.searchParams.set("h", hash);
  }

  return (
    <div className="video-wrapper">
      <div
        style={{
          padding: "62.5% 0 0 0",
          position: "relative",
        }}>
        <iframe
          src={src}
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          title="The Legacy of Davis Elen Advertising"
        />
      </div>
      <script src="https://player.vimeo.com/api/player.js"></script>
    </div>
  );
}