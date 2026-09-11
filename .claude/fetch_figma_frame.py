#!/usr/bin/env python3
"""
Pull a single named Figma frame's full node JSON + a rendered PNG in one
shot, given a personal access token. Replaces the old two-step manual
process (curl for JSON, separate Figma export for a screenshot).

Usage:
    FIGMA_TOKEN=figd_xxx python3 fetch_figma_frame.py <file_key> <frame_name>

Example:
    FIGMA_TOKEN=figd_xxx python3 fetch_figma_frame.py tnP43NMbcFkzFKMsdpukDn HP-26

Outputs, in the current directory:
    <frame_name>_node.json   — full node tree (text, fills, fonts, layout,
                                cornerRadius, autolayout props, variable
                                bindings, component instance refs, etc.)
    <frame_name>.png         — rendered PNG of the frame, for visual
                                cross-checking against the generated code

Only needs Python 3's standard library — no pip install required.
"""
import json
import os
import sys
import urllib.request

API_BASE = "https://api.figma.com/v1"


def api_get(path, token):
    # Explicit User-Agent matters here: urllib's default ("Python-urllib/3.x")
    # is a known bot signature that gets 403'd at Figma's Cloudflare edge
    # before the request ever reaches token/scope checks. curl doesn't hit
    # this because its own default UA isn't flagged the same way.
    req = urllib.request.Request(
        f"{API_BASE}{path}",
        headers={
            "X-Figma-Token": token,
            "User-Agent": "curl/8.4.0",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def find_node_by_name(node, name, path=""):
    """Depth-first search for a node with an exact name match."""
    if node.get("name") == name:
        return node
    for child in node.get("children", []) or []:
        found = find_node_by_name(child, name, path + "/" + node.get("name", ""))
        if found:
            return found
    return None


def main():
    if len(sys.argv) != 3:
        print("Usage: FIGMA_TOKEN=... python3 fetch_figma_frame.py <file_key> <frame_name>")
        sys.exit(1)

    file_key, frame_name = sys.argv[1], sys.argv[2]
    token = os.environ.get("FIGMA_TOKEN")
    if not token:
        print("Set FIGMA_TOKEN in your environment first.")
        sys.exit(1)

    print(f"Fetching shallow file tree for {file_key} (depth=2) to locate '{frame_name}'...")
    shallow = api_get(f"/files/{file_key}?depth=2", token)
    match = find_node_by_name(shallow["document"], frame_name)
    if not match:
        print(f"Couldn't find a node named '{frame_name}' within depth 2. "
              f"If it's nested deeper, increase the depth param below.")
        sys.exit(1)
    node_id = match["id"]
    print(f"Found '{frame_name}' → node id {node_id}")

    print("Fetching full node JSON...")
    node_data = api_get(f"/files/{file_key}/nodes?ids={node_id}", token)
    json_path = f"{frame_name}_node.json"
    with open(json_path, "w") as f:
        json.dump(node_data, f)
    print(f"  wrote {json_path} ({os.path.getsize(json_path):,} bytes)")

    print("Fetching rendered PNG...")
    image_meta = api_get(f"/images/{file_key}?ids={node_id}&format=png&scale=2", token)
    image_url = image_meta.get("images", {}).get(node_id)
    if not image_url:
        print(f"No image URL returned: {image_meta}")
        sys.exit(1)
    png_path = f"{frame_name}.png"
    # Same UA fix applies here — the image URL is served from a different
    # host (S3-style), but default urllib UA can still get blocked there too.
    img_req = urllib.request.Request(image_url, headers={"User-Agent": "curl/8.4.0"})
    with urllib.request.urlopen(img_req) as resp, open(png_path, "wb") as f:
        f.write(resp.read())
    print(f"  wrote {png_path} ({os.path.getsize(png_path):,} bytes)")

    print("\nDone. Upload both files.")


if __name__ == "__main__":
    main()
