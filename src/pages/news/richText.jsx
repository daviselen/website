import { Children, useMemo } from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import manifest from "../../data/news/manifest.json";

// Shared by every article layout (archive and NEWS STORY): field extraction,
// asset resolution and the rich-text body renderer. A layout only owns its
// page shell, so a new-layout article can use any embed an archive one does.

export const LOCALE = "en-US";

// Which shell an article renders with. Opt-in per article via
// `fields.layout["en-US"]`; anything else (including no field, i.e. every
// migrated archive article) falls back to the archive layout.
export const STORY_LAYOUT = "story";

export function getArticleLayout(article) {
  return article?.entries?.[0]?.fields?.layout?.[LOCALE] === STORY_LAYOUT
    ? STORY_LAYOUT
    : "archive";
}

// Module scope: the manifest is a static import, so the lookup map and the
// render options it feeds never change between renders.
const assetMap = new Map(
  (manifest.assets || []).map((asset) => [asset.sys?.id, asset]),
);

function resolveAssetReference(reference) {
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

function getAssetAlt(asset) {
  return (
    asset?.fields?.description?.[LOCALE] || asset?.fields?.title?.[LOCALE] || ""
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

// ------------------------------------------------------------
// Render options
// ------------------------------------------------------------

const renderOptions = {
  preserveWhitespace: true,

  renderText: (text) =>
    text
      .split("\n")
      .flatMap((line, i) => (i > 0 ? [<br key={`br-${i}`} />, line] : [line])),

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
        <EmbeddedEntry node={node} embeddedEntries={manifest.entries || []} />
      );
    },

    [BLOCKS.PARAGRAPH]: (node, children) => <p>{Children.toArray(children)}</p>,

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
          className="text-foreground inline-flex items-center font-normal hover:underline"
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
              className="ms-2 size-4 rtl:rotate-[270deg]"
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

      const asset = resolveAssetReference(target);

      if (!asset) {
        console.warn(`Missing asset: ${target?.sys?.id}`);

        return null;
      }

      const imageUrl = getAssetImageUrl(asset);

      if (!imageUrl) {
        return null;
      }

      return (
        <img
          src={imageUrl}
          alt={getAssetAlt(asset)}
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
      <pre className="bg-surface-subtle text-foreground my-600 overflow-x-auto whitespace-pre-wrap rounded-md p-600 font-mono leading-relaxed">
        {Children.toArray(children)}
      </pre>
    ),
  },
};

// ------------------------------------------------------------
// Article content
// ------------------------------------------------------------

// Everything a layout needs, already resolved: plain strings, a Date, the
// external link, the
// hero image URL/alt and the rendered body. Returns null when the article has
// no entry or no body, matching what the page renders in that case (nothing).
export function useArticleContent(article) {
  const entry = article?.entries?.[0];
  const body = entry?.fields?.body?.[LOCALE];

  const renderedBody = useMemo(
    () => (body ? documentToReactComponents(body, renderOptions) : null),
    [body],
  );

  if (!entry || !body) {
    return null;
  }

  const fields = entry.fields;
  const publishedAt = fields.publishedAt?.[LOCALE];
  const categories = fields.categories?.[LOCALE] || [];
  const heroAsset = resolveAssetReference(fields.heroImage?.[LOCALE]);

  return {
    title: fields.title?.[LOCALE] || "",
    description: fields.description?.[LOCALE] || "",
    // External URL for the work itself (NEWS STORY's "View the work" button).
    link: fields.link?.[LOCALE] || "",
    publishedAt,
    pubDate: publishedAt ? new Date(publishedAt) : null,
    categories,
    category: categories[0]?.name,
    heroImageUrl: getAssetImageUrl(heroAsset),
    heroAlt: getAssetAlt(heroAsset),
    body: renderedBody,
  };
}

// ------------------------------------------------------------
// Embedded entries (video)
// ------------------------------------------------------------

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

  const fields = Object.fromEntries(
    Object.entries(rawFields).map(([key, value]) => {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        LOCALE in value
      ) {
        return [key, value[LOCALE]];
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
        title={fields.title || `YouTube video ${videoId}`}
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
