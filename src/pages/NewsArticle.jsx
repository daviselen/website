import { Children, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { articles } from "../data/news/index";
import manifest from "../data/news/manifest.json";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import MastheadImage from "../design-system/components/MastheadImage";
import NotFound from "./NotFound";

const LOCALE = "en-US";

// Module scope, not closures inside NewsArticle: both are pure functions of
// their arguments, and keeping them here means the renderOptions useMemo
// below only has to depend on `assetMap` — a function redeclared fresh every
// render would otherwise force renderOptions to either miss a real
// dependency or forgo memoizing at all.

function resolveAssetReference(reference, assetMap) {
  const assetId = reference?.sys?.id;

  if (!assetId) {
    return null;
  }

  return assetMap.get(assetId) || null;
}

function getAssetImageUrl(asset) {
  if (!asset) {
    return null;
  }

  const file = asset.fields?.file?.[LOCALE];

  if (!file) {
    return null;
  }

  // Migrated local asset
  if (file.upload) {
    return resolveLocalImageUrl(file.upload);
  }

  // Future/real Contentful asset
  if (file.url) {
    return file.url.startsWith("//") ? `https:${file.url}` : file.url;
  }

  return null;
}

function NewsArticle({ article, manifest }) {
  // ----------------------------------------------------------
  // Build lookup maps from manifest
  // ----------------------------------------------------------
  // Hoisted above the entry/body early-returns below, and memoized on
  // `manifest` alone — this whole block (through renderOptions) only ever
  // closes over `manifest`, never `article`, so rebuilding a fresh Map and
  // reconstructing the entire renderOptions config (every renderNode
  // handler, fresh each time) on every incidental re-render was pure waste.

  const assetMap = useMemo(
    () => new Map((manifest?.assets || []).map((asset) => [asset.sys?.id, asset])),
    [manifest],
  );

  // ----------------------------------------------------------
  // Render options
  // ----------------------------------------------------------

  const renderOptions = useMemo(
    () => ({
      preserveWhitespace: true,

      renderText: (text) =>
        text
          .split("\n")
          .flatMap((line, i) =>
            i > 0 ? [<br key={`br-${i}`} />, line] : [line],
          ),

      renderMark: {
        center: (text) => <span className="block text-center">{text}</span>,
      },

      renderNode: {
        // ------------------------------------------------------
        // Embedded entry
        // ------------------------------------------------------

        [BLOCKS.EMBEDDED_ENTRY]: (node) => {
          const target = node?.data?.target;

          const id = target?.sys?.id;

          if (!id) {
            console.warn("Embedded entry has no ID:", node);

            return null;
          }

          return (
            <EmbeddedEntry
              node={node}
              embeddedEntries={manifest?.entries || []}
            />
          );
        },

        [BLOCKS.PARAGRAPH]: (node, children) => (
          <p>{Children.toArray(children)}</p>
        ),

        // ------------------------------------------------------
        // Hyperlinks
        // ------------------------------------------------------

        [INLINES.HYPERLINK]: (node, children) => {
          const uri = node?.data?.uri || "";

          // uri comes straight from migrated content with no scheme check —
          // allowlist before it ever reaches href, so a javascript: URI (or
          // anything else) in a malicious/compromised content source can't
          // execute on click.
          const isSafeHref = /^(https?:|mailto:|tel:|\/)/i.test(uri);
          const href = isSafeHref ? uri : "#";

          const isExternal = /^https?:\/\//i.test(uri);

          return (
            <a
              href={href}
              className="inline-flex items-center font-normal text-foreground hover:underline"
              {...(isExternal
                ? {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                : {})}
            >
              {Children.toArray(children)}

              {isExternal && (
                <svg
                  className="w-4 h-4 ms-2 rtl:rotate-[270deg]"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"
                  />
                </svg>
              )}
            </a>
          );
        },

        // ------------------------------------------------------
        // Embedded asset
        // ------------------------------------------------------

        [BLOCKS.EMBEDDED_ASSET]: (node) => {
          const target = node?.data?.target;

          const asset = resolveAssetReference(target, assetMap);

          if (!asset) {
            console.warn(`Missing asset: ${target?.sys?.id}`);

            return null;
          }

          const imageUrl = getAssetImageUrl(asset);

          if (!imageUrl) {
            return null;
          }

          const assetFields = asset.fields || {};

          const alt =
            assetFields.description?.[LOCALE] ||
            assetFields.title?.[LOCALE] ||
            "";

          return (
            <img
              src={imageUrl}
              alt={alt}
              className="rounded-md"
              loading="lazy"
            />
          );
        },

        // ------------------------------------------------------
        // Tables
        // ------------------------------------------------------

        [BLOCKS.TABLE]: (node, children) => (
          <table>
            <tbody>{Children.toArray(children)}</tbody>
          </table>
        ),

        [BLOCKS.TABLE_ROW]: (node, children) => (
          <tr>{Children.toArray(children)}</tr>
        ),

        [BLOCKS.TABLE_CELL]: (node, children) => (
          <td>{Children.toArray(children)}</td>
        ),

        [BLOCKS.TABLE_HEADER_CELL]: (node, children) => (
          <th>{Children.toArray(children)}</th>
        ),

        pre: (node, children) => (
          <pre className="my-600 overflow-x-auto rounded-md bg-surface-subtle p-600 font-mono leading-relaxed whitespace-pre-wrap text-foreground">
            {Children.toArray(children)}
          </pre>
        ),
      },
    }),
    [assetMap, manifest],
  );

  // ----------------------------------------------------------
  // Entry / field extraction — depends on `article`, unlike everything
  // above, so it stays unmemoized below the manifest-only block.
  // ----------------------------------------------------------

  const entry = article?.entries?.[0];

  if (!entry) {
    return null;
  }

  const fields = entry.fields || {};

  const title = fields.title?.[LOCALE] || "";

  const publishedAt = fields.publishedAt?.[LOCALE];

  const category = fields.categories?.[LOCALE]?.[0]?.name;

  const body = fields.body?.[LOCALE];

  if (!body) {
    return null;
  }

  const heroReference = fields.heroImage?.[LOCALE];

  const heroAsset = resolveAssetReference(heroReference, assetMap);

  const heroImageUrl = getAssetImageUrl(heroAsset);

  const heroAlt =
    heroAsset?.fields?.description?.[LOCALE] ||
    heroAsset?.fields?.title?.[LOCALE] ||
    "";

  const pubDate = publishedAt ? new Date(publishedAt) : null;

  return (
    <article className="news-article flex flex-col gap-1000">
      <header>
        {heroImageUrl && (
          <MastheadImage src={heroImageUrl} alt={heroAlt} title={category} />
        )}
        <div className="flex flex-col gap-200 px-400 text-pre-title max-w-prose">
          {pubDate && (
            <time className="font-display tracking-wide" dateTime={publishedAt}>
              {pubDate.toLocaleDateString("en-US", { dateStyle: "long" })}
            </time>
          )}
          <h1 className="text-display-h3 font-display uppercase">{title}</h1>
        </div>
      </header>

      <div className="news-content">
        <div className="news-body text-pre-title px-400 *:mb-600 *:max-w-prose *:ul:list-outside *:marker:text-primary-300 [&_ul]:list-outside [&_ul]:list-[square] [&_ul]:pl-600 [&_ul]:text-lg md:[&_ul]:text-xl lg:[&_ul]:text-pre-title [&_li]:mb-300 [&_h2]:text-display-h4 [&_h2]:font-display [&_h2]:mt-1000 [&_h2]:first:mt-0 [&_h2]:first:text-display-h5 [&_h3]:text-display-h5 [&_h3]:font-display [&_h3]:mt-800">
          {documentToReactComponents(body, renderOptions)}
        </div>
      </div>
    </article>
  );
}

// ------------------------------------------------------------
// Local image URL
// ------------------------------------------------------------
//
// Migrator:
//   upload: "../images/foo.jpg"
//
// Website:
//   public/images/foo.jpg
//
// Therefore the browser URL is:
//   /images/foo.jpg
// ------------------------------------------------------------

function resolveLocalImageUrl(upload) {
  if (!upload) {
    return null;
  }

  // Strip leading relative path prefixes (e.g., "../images/" or "images/")
  const cleanPath = upload.replace(/^(\.\.\/|\.\/)*images\//, "");

  if (!cleanPath) {
    return null;
  }

  // Encode each segment (filename, directories) while preserving the forward slashes
  const encodedPath = cleanPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/images/${encodedPath}`;
}

export default function NewsArticlePage() {
  const { slug } = useParams();

  const article = articles.find(
    (article) => article.entries?.[0]?.fields?.slug?.["en-US"] === slug,
  );

  if (!article) {
    return <NotFound />;
  }

  return <NewsArticle article={article} manifest={manifest} />;
}

// 1. Create a helper function or component to render the entry
function EmbeddedEntry({ node, embeddedEntries = [] }) {
  const target = node?.data?.target;
  const entryId = target?.sys?.id;

  if (!entryId) {
    console.warn("Embedded entry has no ID.");
    return null;
  }

  // ----------------------------------------------------------
  // Resolve the entry from manifest.json
  // ----------------------------------------------------------

  let entry = target;

  if (!entry?.fields) {
    entry = embeddedEntries.find(
      (embeddedEntry) =>
        embeddedEntry?.sys?.id === entryId || embeddedEntry?.id === entryId,
    );
  }

  if (!entry) {
    console.warn(`Embedded entry not found for id: ${entryId}`);

    return null;
  }

  // ----------------------------------------------------------
  // Resolve localized fields
  // ----------------------------------------------------------

  const rawFields = entry.fields || {};

  const locale = "en-US";

  const fields = Object.fromEntries(
    Object.entries(rawFields).map(([key, value]) => {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        locale in value
      ) {
        return [key, value[locale]];
      }

      return [key, value];
    }),
  );

  // ----------------------------------------------------------
  // Content type
  // ----------------------------------------------------------

  const contentType =
    entry?.sys?.contentType?.sys?.id ||
    entry?.sys?.contentType?.id ||
    entry?.contentType ||
    fields.type;

  // ----------------------------------------------------------
  // YouTube
  // ----------------------------------------------------------

  if (contentType === "youtubeVideo") {
    const videoId = fields.videoId || fields.youtubeId;

    if (!videoId) {
      console.warn(`YouTube entry ${entryId} has no video ID`);

      return null;
    }

    return (
      <YouTubeEmbed
        videoId={videoId}
        src={fields.embedUrl || `https://www.youtube.com/embed/${videoId}`}
        title={fields.title || `YouTube video ${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // ----------------------------------------------------------
  // Vimeo
  // ----------------------------------------------------------

  if (contentType === "vimeoVideo") {
    const videoId = fields.videoId;

    if (!videoId) {
      console.warn(`Vimeo entry ${entryId} has no video ID`);

      return null;
    }

    return (
      <VimeoEmbed
        videoId={videoId}
        hash={fields.hash}
        title={fields.title || `Vimeo video ${videoId}`}
      />
    );
  }

  console.warn(
    `Unsupported embedded entry type "${contentType}" for ${entryId}`,
  );

  return null;
}

function VimeoEmbed({ videoId, hash, title }) {
  const src = new URL(`https://player.vimeo.com/video/${videoId}`);
  if (hash) {
    src.searchParams.set("h", hash);
  }

  return (
    <div className="video-wrapper">
      <div
        style={{
          padding: "56.25% 0 0 0",
          position: "relative",
        }}
      >
        <iframe
          src={src}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          title={title}
        />
      </div>
      <script src="https://player.vimeo.com/api/player.js"></script>
    </div>
  );
}

function YouTubeEmbed({ videoId, title }) {
  const src = new URL(
    `https://www.youtube.com/embed/${videoId}?feature=oembed`,
  );

  return (
    <div className="video-wrapper">
      <div
        style={{
          padding: "56.25% 0 0 0",
          position: "relative",
        }}
      >
        <iframe
          title={title}
          src={src}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullscreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}
