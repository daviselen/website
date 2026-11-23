// Prints the signed Vimeo file link for each video ID, at the rendition the
// About page tiles use (540p, else the nearest height). Needs a Vimeo
// personal access token with the "Private" and "Video Files" scopes:
//
//   VIMEO_TOKEN=xxxx npm run vimeo:links -- <id> [<id> ...]
//
// Output is one `id<TAB>rendition<TAB>link` line per video.
const TARGET_HEIGHT = 540;
const token = process.env.VIMEO_TOKEN;
const ids = process.argv.slice(2);
if (!token || ids.length === 0) {
  console.error("usage: VIMEO_TOKEN=xxxx npm run vimeo:links -- <id> [<id> ...]");
  process.exit(1);
}

let failed = 0;
for (const id of ids) {
  const res = await fetch(`https://api.vimeo.com/videos/${id}?fields=name,files`, {
    headers: {
      Authorization: `bearer ${token}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
  });
  if (!res.ok) {
    console.error(`${id}\tHTTP ${res.status}\t${(await res.text()).slice(0, 200)}`);
    failed++;
    continue;
  }
  const { name, files = [] } = await res.json();
  const mp4s = files.filter((f) => f.type === "video/mp4" && f.height && f.link);
  if (mp4s.length === 0) {
    console.error(`${id}\tno mp4 file links (token missing the Video Files scope?)\t${name}`);
    failed++;
    continue;
  }
  const best = mp4s.reduce((a, b) =>
    Math.abs(b.height - TARGET_HEIGHT) < Math.abs(a.height - TARGET_HEIGHT) ? b : a,
  );
  console.log(`${id}\t${best.rendition ?? `${best.height}p`}\t${best.link}`);
}
process.exit(failed ? 1 : 0);
