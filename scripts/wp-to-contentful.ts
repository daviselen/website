import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

const WP_BASE_URL = "https://daviselen-2021.flywheelsites.com";

const WORDPRESS_API =
  `${WP_BASE_URL}/wp-json/wp/v2`;

const OUTPUT_DIR = path.resolve(
  __dirname,
  "../src/data/news"
);

const IMAGE_DIR = path.resolve(
  __dirname,
  "../public/images"
);

const LOCALE = "en-US";

const ARTICLE_CONTENT_TYPE = "article";

const YOUTUBE_CONTENT_TYPE = "youtubeVideo";

const EXCLUDED_CATEGORY_SLUGS = [
  "work",
  "case-studies",
  "people",
];

// ------------------------------------------------------------
// Migration state
// ------------------------------------------------------------

const assets = new Map<string, any>();
const embeddedEntries = new Map<string, any>();
const mediaCache = new Map<string, any>();
const categoryCache = new Map<number, any>();

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log("Starting WordPress → Contentful migration...\n");

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(IMAGE_DIR, { recursive: true });

  const posts = await fetchAllPosts();

  console.log(`Found ${posts.length} posts.\n`);

  let successful = 0;
  let failed = 0;

  for (const [index, post] of posts.entries()) {
    console.log(
      `[${index + 1}/${posts.length}] ${post.slug}`
    );

    try {
      const article = await convertPost(post);

      const filename =
        `${safeFilename(post.slug)}.json`;

      await fs.writeFile(
        path.join(OUTPUT_DIR, filename),
        JSON.stringify(article, null, 2),
        "utf8"
      );

      successful++;

      console.log(`  ✓ ${filename}\n`);
    } catch (error: any) {
      failed++;

      console.error(
        `  ✗ ${error?.message || error}\n`
      );
    }
  }

  // ----------------------------------------------------------
  // Write a Contentful-style collection containing all
  // referenced assets and embedded entries.
  // ----------------------------------------------------------

  const manifest = {
    entries: [
      ...embeddedEntries.values(),
    ],

    assets: [
      ...assets.values(),
    ],
  };

  await fs.writeFile(
    path.join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log("--------------------------------");
  console.log("Migration complete");
  console.log(`Successful: ${successful}`);
  console.log(`Failed:     ${failed}`);
  console.log(`Assets:     ${assets.size}`);
  console.log(`Entries:    ${embeddedEntries.size}`);
  console.log("--------------------------------");
}

// ------------------------------------------------------------
// WordPress API
// ------------------------------------------------------------

async function fetchAllPosts() {
  const excludedIds =
    await fetchExcludedCategoryIds();

  const posts: any[] = [];

  let page = 1;

  while (true) {
    const url =
      `${WORDPRESS_API}/posts` +
      `?per_page=100` +
      `&page=${page}` +
      `&status=publish` +
      `&orderby=date` +
      `&order=asc`;

    console.log(
      `Fetching WordPress page ${page}...`
    );

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400 && page > 1) {
        break;
      }

      throw new Error(
        `WordPress API returned ${response.status}`
      );
    }

    const batch = await response.json();

    if (!batch.length) {
      break;
    }

    for (const post of batch) {
      const categoryIds =
        post.categories || [];

      const excluded =
        categoryIds.some(
          (id: number) =>
            excludedIds.has(id)
        );

      if (!excluded) {
        posts.push(post);
      }
    }

    const totalPages =
      Number(
        response.headers.get(
          "X-WP-TotalPages"
        ) || 1
      );

    if (page >= totalPages) {
      break;
    }

    page++;
  }

  return posts;
}

// ------------------------------------------------------------
// Post
// ------------------------------------------------------------

async function convertPost(post: any) {
  const categories =
    await convertCategories(
      post.categories || []
    );

  let heroImage = null;

  if (post.featured_media) {
    heroImage =
      await convertMedia(
        post.featured_media
      );
  }

  const $ =
    cheerio.load(
      post.content?.rendered || ""
    );

  const body =
    await convertDocument(
      $,
      $.root()
    );

  return {
    entries: [
      {
        sys: {
          type: "Entry",
          id: post.slug,
          contentType: {
            sys: {
              type: "Link",
              linkType: "ContentType",
              id: ARTICLE_CONTENT_TYPE,
            },
          },
        },

        fields: {
          slug: {
            [LOCALE]: post.slug,
          },

          title: {
            [LOCALE]:
              decodeHtml(
                post.title?.rendered || ""
              ),
          },

          publishedAt: {
            [LOCALE]: post.date,
          },

          categories: {
            [LOCALE]: categories,
          },

          heroImage: {
            [LOCALE]: heroImage,
          },

          body: {
            [LOCALE]: body,
          },
        },
      },
    ],
  };
}

// ------------------------------------------------------------
// Categories
// ------------------------------------------------------------

async function fetchExcludedCategoryIds() {
  const excluded = new Map<number, string>();

  for (
    const slug of EXCLUDED_CATEGORY_SLUGS
  ) {
    const response =
      await fetch(
        `${WORDPRESS_API}/categories?slug=${slug}`
      );

    if (!response.ok) {
      continue;
    }

    const categories =
      await response.json();

    for (const category of categories) {
      excluded.set(
        category.id,
        category.slug
      );
    }
  }

  return excluded;
}

async function convertCategories(
  ids: number[]
) {
  const output = [];

  for (const id of ids) {
    let category =
      categoryCache.get(id);

    if (!category) {
      const response =
        await fetch(
          `${WORDPRESS_API}/categories/${id}`
        );

      if (!response.ok) {
        continue;
      }

      const wpCategory =
        await response.json();

      category = {
        name: wpCategory.name,
        slug: wpCategory.slug,
      };

      categoryCache.set(
        id,
        category
      );
    }

    output.push(category);
  }

  return output;
}

// ------------------------------------------------------------
// Rich Text
// ------------------------------------------------------------

// ------------------------------------------------------------
// Rich Text / Block conversion
// ------------------------------------------------------------

async function convertDocument(
  $: cheerio.CheerioAPI,
  root: any
) {
  const content: any[] = [];

  for (const element of root.contents().toArray()) {
    content.push(
      ...await convertBlock($, element)
    );
  }

  return {
    nodeType: "document",
    data: {},
    content,
  };
}

async function convertBlock(
  $: cheerio.CheerioAPI,
  element: any
): Promise<any[]> {
  if (element.type === "text") {
    const value =
      cleanText(element.data || "");

    if (!value.trim()) {
      return [];
    }

    return [
      paragraph(
        textNode(value)
      ),
    ];
  }

  if (element.type !== "tag") {
    return [];
  }

  const tag =
    element.tagName?.toLowerCase();

  // ----------------------------------------------------------
  // Images
  // ----------------------------------------------------------

  if (tag === "img") {
    const asset =
      await convertImage(element);

    return asset
      ? [embeddedAsset(asset)]
      : [];
  }

  // ----------------------------------------------------------
  // Figures
  //
  // WordPress uses figures for:
  //
  // - images
  // - YouTube embeds
  // - Vimeo embeds
  //
  // Video captions are preserved as normal Rich Text
  // paragraphs after the embedded video entry.
  // ----------------------------------------------------------

  if (tag === "figure") {
    // Extract caption paragraphs using the existing helper
    const captionNodes = convertFigureCaption(element);
  
    const video = findVideoInFigure(element);
  
    if (video) {
      const videoBlocks = await convertVideoBlock(video);
      return [...videoBlocks, ...captionNodes];
    }
  
    // Otherwise this is an image figure.
    const image = findFirstElement(
      element,
      (child: any) =>
        child.type === "tag" &&
        child.tagName?.toLowerCase() === "img"
    );
  
    if (image) {
      const asset = await convertImage(image);
  
      return asset
        ? [embeddedAsset(asset), ...captionNodes]
        : captionNodes;
    }
  
    return captionNodes;
  }

  // ----------------------------------------------------------
  // Iframe
  // ----------------------------------------------------------

  if (tag === "iframe") {
    const src =
      element.attribs?.src;

    if (!src) {
      return [];
    }

    return convertVideo(src);
  }

  // ----------------------------------------------------------
  // Headings
  // ----------------------------------------------------------

  if (
    [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ].includes(tag)
  ) {
    return [
      {
        nodeType:
          `heading-${tag.substring(1)}`,

        data: {},

        content:
          convertInlineContent(element),
      },
    ];
  }

  // ----------------------------------------------------------
  // Paragraph
  // ----------------------------------------------------------

  if (tag === "p") {
    const content =
      convertInlineContent(element);

    if (!content.length) {
      return [];
    }

    return [
      paragraph(...content),
    ];
  }

  // ----------------------------------------------------------
  // Lists
  // ----------------------------------------------------------

  if (tag === "ul") {
    return [
      convertList(
        element,
        "unordered-list"
      ),
    ];
  }

  if (tag === "ol") {
    return [
      convertList(
        element,
        "ordered-list"
      ),
    ];
  }

  // ----------------------------------------------------------
  // Blockquote
  // ----------------------------------------------------------

  if (tag === "blockquote") {
    const content =
      convertInlineContent(element);

    if (!content.length) {
      return [];
    }

    return [
      {
        nodeType: "blockquote",
        data: {},
        content: [
          paragraph(...content),
        ],
      },
    ];
  }

  // ----------------------------------------------------------
  // Generic containers
  // ----------------------------------------------------------

  const result: any[] = [];

  for (
    const child of element.children || []
  ) {
    result.push(
      ...await convertBlock(
        $,
        child
      )
    );
  }

  return result;
}


// ------------------------------------------------------------
// Find video inside a WordPress figure
// ------------------------------------------------------------

type VideoFigure = {
  src: string;
  caption: any[];
};

// ------------------------------------------------------------
// Find the figure caption
// ------------------------------------------------------------

function findFigureCaption(
  element: any
): any[] {
  const caption =
    findFirstElement(
      element,
      (child: any) =>
        child.type === "tag" &&
        child.tagName?.toLowerCase() === "figcaption"
    );

  if (!caption) {
    return [];
  }

  return convertInlineContent(
    caption
  );
}

// ------------------------------------------------------------
// Extract plain text from an element
// ------------------------------------------------------------

function extractText(
  element: any
): string {
  if (element.type === "text") {
    return element.data || "";
  }

  return (
    element.children || []
  )
    .map((child: any) =>
      extractText(child)
    )
    .join("");
}

function findVideoInFigure(
  figure: any
): string | null {
  const iframe = findFirstElement(
    figure,
    (element: any) =>
      element.type === "tag" &&
      element.tagName?.toLowerCase() === "iframe"
  );

  if (iframe?.attribs?.src) {
    return iframe.attribs.src;
  }

  // Fallback to text URL extraction...
  const text = getElementText(figure);
  const match = text.match(
    /https?:\/\/(?:www\.)?(?:vimeo\.com|player\.vimeo\.com)\/[^\s<]+/i
  );

  return match?.[0] || null;
}

async function convertVideoBlock(
  videoSrc: string
): Promise<any[]> {
  const videoId = parseVimeoId(videoSrc);

  if (!videoId) {
    return convertVideo(videoSrc);
  }

  const id = `vimeo-${videoId}`;

  if (!embeddedEntries.has(id)) {
    embeddedEntries.set(
      id,
      {
        sys: {
          type: "Entry",
          id,

          contentType: {
            sys: {
              type: "Link",
              linkType: "ContentType",
              id: "vimeoVideo",
            },
          },
        },

        fields: {
          title: {
            [LOCALE]: `Vimeo video ${videoId}`,
          },

          videoId: {
            [LOCALE]: videoId,
          },
        },
      }
    );
  }

  return [
    {
      nodeType: "embedded-entry-block",

      data: {
        target: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id,
          },
        },
      },

      content: [],
    },
  ];
}

function parseVimeoId(
  src: string
): string | null {
  try {
    const url = new URL(src);

    if (
      url.hostname === "vimeo.com" ||
      url.hostname === "www.vimeo.com"
    ) {
      const parts =
        url.pathname
          .split("/")
          .filter(Boolean);

      const id = parts[0];

      return id && /^\d+$/.test(id)
        ? id
        : null;
    }

    if (
      url.hostname === "player.vimeo.com"
    ) {
      const match =
        url.pathname.match(
          /^\/video\/(\d+)/
        );

      return match?.[1] || null;
    }
  } catch (error) {
    console.warn(`Malformed Vimeo URL, skipping: ${src}`, error);
  }

  return null;
}

// ------------------------------------------------------------
// Recursively collect every <img> descendant
// ------------------------------------------------------------

function collectImages(
  element: any
): any[] {
  const images: any[] = [];

  if (
    element?.type === "tag" &&
    element.tagName?.toLowerCase() === "img"
  ) {
    images.push(element);
    return images;
  }

  for (
    const child of element?.children || []
  ) {
    images.push(
      ...collectImages(child)
    );
  }

  return images;
}

// ------------------------------------------------------------
// Inline content
// ------------------------------------------------------------

function convertInlineContent(
  element: any,
  marks: any[] = []
): any[] {
  const output: any[] = [];

  for (
    const child of element.children || []
  ) {
    if (child.type === "text") {
      const value =
        cleanText(child.data || "");

      if (value) {
        output.push(
          textNode(
            value,
            marks
          )
        );
      }

      continue;
    }

    if (child.type !== "tag") {
      continue;
    }

    const tag =
      child.tagName?.toLowerCase();

    if (
      tag === "strong" ||
      tag === "b"
    ) {
      output.push(
        ...convertInlineContent(
          child,
          [
            ...marks,
            { type: "bold" },
          ]
        )
      );

      continue;
    }

    if (
      tag === "em" ||
      tag === "i"
    ) {
      output.push(
        ...convertInlineContent(
          child,
          [
            ...marks,
            { type: "italic" },
          ]
        )
      );

      continue;
    }

    if (tag === "u") {
      output.push(
        ...convertInlineContent(
          child,
          [
            ...marks,
            { type: "underline" },
          ]
        )
      );

      continue;
    }

    if (tag === "br") {
      output.push(
        textNode("\n", marks)
      );

      continue;
    }

    if (tag === "a") {
      output.push({
        nodeType: "hyperlink",

        data: {
          uri:
            child.attribs?.href || "",
        },

        content:
          convertInlineContent(
            child,
            marks
          ),
      });

      continue;
    }

    output.push(
      ...convertInlineContent(
        child,
        marks
      )
    );
  }

  return output;
}

// ------------------------------------------------------------
// Lists
// ------------------------------------------------------------

function convertList(
  element: any,
  nodeType: string
) {
  const content = [];

  for (
    const child of element.children || []
  ) {
    if (
      child.type !== "tag" ||
      child.tagName?.toLowerCase() !== "li"
    ) {
      continue;
    }

    content.push({
      nodeType: "list-item",
      data: {},
      content: [
        paragraph(
          ...convertInlineContent(child)
        ),
      ],
    });
  }

  return {
    nodeType,
    data: {},
    content,
  };
}

// ------------------------------------------------------------
// Images
// ------------------------------------------------------------

async function convertImage(
  element: any
) {
  const src =
    element.attribs?.src ||
    element.attribs?.["data-src"] ||
    element.attribs?.["data-lazy-src"];

  if (!src) return null;

  let absoluteUrl: string;

  try {
    absoluteUrl = new URL(src, WP_BASE_URL).toString();
  } catch {
    console.warn(`    ⚠ Invalid image URL: ${src}`);
    return null;
  }

  if (mediaCache.has(absoluteUrl)) {
    return mediaCache.get(absoluteUrl);
  }

  try {
    const response = await fetch(absoluteUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const url = new URL(absoluteUrl);

    // 1. Extract YYYY/MM from WP upload path (e.g., /wp-content/uploads/2023/05/image.jpg)
    let folderName = "misc"; // Fallback for images outside the standard uploads folder
    const dateMatch = url.pathname.match(/\/(\d{4})\/(\d{2})\//);
    if (dateMatch) {
      folderName = `${dateMatch[1]}/${dateMatch[2]}`;
    }

    const originalFilename = path.basename(url.pathname) || "image.jpg";
    const extension = path.extname(originalFilename) || ".jpg";
    const baseName = path.basename(originalFilename, extension);

    const filename = `${safeFilename(baseName)}-${hashString(
      absoluteUrl
    )}${extension.toLowerCase()}`;

    // 2. Create the YYYY/MM directory structure
    const targetDir = path.join(IMAGE_DIR, folderName);
    await fs.mkdir(targetDir, { recursive: true });

    const outputPath = path.join(targetDir, filename);
    await fs.writeFile(outputPath, buffer);

    const assetId = `asset-${hashString(absoluteUrl)}`;
    const alt = element.attribs?.alt || "";
    const contentType =
      response.headers.get("content-type") || guessContentType(filename);

    const asset = {
      sys: {
        type: "Asset",
        id: assetId,
      },
      fields: {
        title: {
          [LOCALE]: alt || baseName || filename,
        },
        description: {
          [LOCALE]: alt,
        },
        file: {
          [LOCALE]: {
            fileName: filename,
            contentType,
            // 3. Update the Contentful upload path reference
            upload: `../images/${folderName}/${filename}`,
          },
        },
      },
    };

    assets.set(assetId, asset);

    const reference = {
      sys: {
        type: "Link",
        linkType: "Asset",
        id: assetId,
      },
    };

    mediaCache.set(absoluteUrl, reference);
    return reference;
  } catch (error: any) {
    console.warn(`⚠ Image failed: ${absoluteUrl}`);
    console.warn(`${error?.message || error}`);
    return null;
  }
}

// ------------------------------------------------------------
// Featured media
// ------------------------------------------------------------

async function convertMedia(
  mediaId: number
) {
  const cacheKey =
    `wp-media-${mediaId}`;

  if (
    mediaCache.has(cacheKey)
  ) {
    return mediaCache.get(
      cacheKey
    );
  }

  const response =
    await fetch(
      `${WORDPRESS_API}/media/${mediaId}`
    );

  if (!response.ok) {
    console.warn(
      `    ⚠ Could not fetch media ${mediaId}`
    );

    return null;
  }

  const media =
    await response.json();

  const $ =
    cheerio.load(
      `<img src="${escapeHtmlAttribute(
        media.source_url
      )}" alt="${escapeHtmlAttribute(
        media.alt_text || ""
      )}">`
    );

  const image =
    $("img").get(0);

  const reference =
    await convertImage(image);

  mediaCache.set(
    cacheKey,
    reference
  );

  return reference;
}

// ------------------------------------------------------------
// Videos
// ------------------------------------------------------------

function convertVideo(
  src?: string
) {
  if (!src) {
    return [];
  }

  const youtubeId =
    parseYouTubeId(src);

  if (youtubeId) {
    const id =
      `youtube-${youtubeId}`;

    if (
      !embeddedEntries.has(id)
    ) {
      embeddedEntries.set(
        id,
        {
          sys: {
            type: "Entry",
            id,

            contentType: {
              sys: {
                type: "Link",
                linkType: "ContentType",
                id: YOUTUBE_CONTENT_TYPE,
              },
            },
          },

          fields: {
            title: {
              [LOCALE]:
                `YouTube video ${youtubeId}`,
            },

            videoId: {
              [LOCALE]:
                youtubeId,
            },
          },
        }
      );
    }

    return [
      {
        nodeType:
          "embedded-entry-block",

        data: {
          target: {
            sys: {
              type: "Link",
              linkType: "Entry",
              id,
            },
          },
        },

        content: [],
      },
    ];
  }

  return [];
}

function parseYouTubeId(
  src: string
) {
  try {
    const url =
      new URL(src);

    if (
      url.hostname.includes(
        "youtube.com"
      )
    ) {
      if (
        url.pathname === "/embed/" ||
        url.pathname.startsWith("/embed/")
      ) {
        return url.pathname
          .split("/")
          .filter(Boolean)[1];
      }

      const id =
        url.searchParams.get("v");

      if (id) {
        return id;
      }
    }

    if (url.hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0];
    }

    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/")[2];
    }
  } catch (error) {
    console.warn(`Malformed YouTube URL, skipping: ${src}`, error);
  }

  return null;
}

// ------------------------------------------------------------
// Rich Text helpers
// ------------------------------------------------------------

function paragraph(
  ...content: any[]
) {
  return {
    nodeType: "paragraph",
    data: {},
    content,
  };
}

function textNode(
  value: string,
  marks: any[] = []
) {
  return {
    nodeType: "text",
    value,
    marks,
    data: {},
  };
}

function embeddedAsset(
  asset: any
) {
  return {
    nodeType:
      "embedded-asset-block",

    data: {
      target: asset,
    },

    content: [],
  };
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function cleanText(
  value: string
) {
  const decoded = cheerio.load(`<span>${value}</span>`).text();
  return decoded
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

function decodeHtml(
  value: string
) {
  return cheerio
    .load(
      `<span>${value}</span>`
    )
    .text()
    .trim();
}

function safeFilename(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9._-]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      "");
}

function hashString(
  value: string
) {
  return crypto.createHash("md5").update(value).digest("hex").slice(0, 12);
}

function guessContentType(
  filename: string
) {
  const ext =
    path.extname(filename)
      .toLowerCase();

  switch (ext) {
    case ".png":
      return "image/png";

    case ".webp":
      return "image/webp";

    case ".gif":
      return "image/gif";

    case ".svg":
      return "image/svg+xml";

    case ".avif":
      return "image/avif";

    default:
      return "image/jpeg";
  }
}

function escapeHtmlAttribute(
  value: string
) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

// ------------------------------------------------------------
// Find an element recursively
// ------------------------------------------------------------

function findFirstElement(
  element: any,
  predicate: (element: any) => boolean
): any | null {
  if (predicate(element)) {
    return element;
  }

  for (const child of element.children || []) {
    const result: any | null =
      findFirstElement(child, predicate);

    if (result) {
      return result;
    }
  }

  return null;
}

// ------------------------------------------------------------
// Get text recursively
// ------------------------------------------------------------

function getElementText(
  element: any
): string {
  if (element.type === "text") {
    return element.data || "";
  }

  return (
    element.children || []
  )
    .map((child: any) =>
      getElementText(child)
    )
    .join("");
}

// ------------------------------------------------------------
// Figure caption
//
// WordPress:
//
// <figcaption>
//   "COFFEE FRESH START"<br>
//   <strong>McDonald's</strong><br>
//   2022 Silver Telly Winner...
// </figcaption>
//
// Becomes:
//
// paragraph("“COFFEE FRESH START”")
// paragraph(bold("McDonald's"))
// paragraph("2022 Silver Telly Winner...")
// ------------------------------------------------------------

function convertFigureCaption(
  figure: any
): any[] {
  const caption =
    findFirstElement(
      figure,
      (node) =>
        node.type === "tag" &&
        node.tagName?.toLowerCase() === "figcaption"
    );

  if (!caption) {
    return [];
  }

  const paragraphs: any[] = [];

  let currentContent: any[] = [];

  function flush() {
    if (!currentContent.length) {
      return;
    }

    const hasContent =
      currentContent.some(
        (node) =>
          node.nodeType === "text" &&
          node.value?.trim()
      );

    if (hasContent) {
      paragraphs.push(
        paragraph(
          ...currentContent
        )
      );
    }

    currentContent = [];
  }

  function walk(node: any) {
    if (node.type === "text") {
      const value =
        cleanText(
          node.data || ""
        );

      if (value) {
        currentContent.push(
          textNode(
            value
          )
        );
      }

      return;
    }

    if (node.type !== "tag") {
      return;
    }

    const tag =
      node.tagName?.toLowerCase();

    // <br> means a new paragraph
    // in these WP captions.
    if (tag === "br") {
      flush();
      return;
    }

    // Preserve bold/italic/etc.
    let marks: any[] = [];

    if (
      tag === "strong" ||
      tag === "b"
    ) {
      marks = [
        { type: "bold" },
      ];
    }

    if (
      tag === "em" ||
      tag === "i"
    ) {
      marks = [
        { type: "italic" },
      ];
    }

    for (
      const child of node.children || []
    ) {
      if (child.type === "text") {
        const value =
          cleanText(
            child.data || ""
          );

        if (value) {
          currentContent.push(
            textNode(
              value,
              marks
            )
          );
        }
      } else {
        walkWithMarks(
          child,
          marks
        );
      }
    }
  }

  function walkWithMarks(
    node: any,
    inheritedMarks: any[] = []
  ) {
    if (node.type === "text") {
      const value =
        cleanText(
          node.data || ""
        );

      if (value) {
        currentContent.push(
          textNode(
            value,
            inheritedMarks
          )
        );
      }

      return;
    }

    if (node.type !== "tag") {
      return;
    }

    const tag =
      node.tagName?.toLowerCase();

    if (tag === "br") {
      flush();
      return;
    }

    let marks =
      [...inheritedMarks];

    if (
      tag === "strong" ||
      tag === "b"
    ) {
      marks.push({
        type: "bold",
      });
    }

    if (
      tag === "em" ||
      tag === "i"
    ) {
      marks.push({
        type: "italic",
      });
    }

    for (
      const child of node.children || []
    ) {
      walkWithMarks(
        child,
        marks
      );
    }
  }

  for (
    const child of caption.children || []
  ) {
    walkWithMarks(
      child
    );
  }

  flush();

  return paragraphs;
}

// ------------------------------------------------------------

main().catch((error) => {
  console.error(
    "\nMigration failed:"
  );

  console.error(error);

  process.exit(1);
});