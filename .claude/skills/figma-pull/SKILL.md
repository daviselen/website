---
name: figma-pull
description: >
  Pull one Figma frame/section into code. Parses a frame name, section name,
  or node id from the invocation, preflights Figma MCP reachability, then
  dispatches the figma-pull Workflow (extract -> token map -> component
  reuse -> codegen -> assets -> self-audit -> lint/build -> visual verify ->
  report) and relays its report. Use when the user says "/figma-pull",
  "pull this frame", "pull <section> from Figma", or gives a figma.com URL /
  node id for a DE5 section that needs to become code.
---

# figma-pull

Thin entry point. All pipeline logic (9 phases) lives in the
`./.claude/workflows/figma-pull.js` Workflow — this skill only parses input,
preflights MCP, dispatches, and relays the result. Do not reimplement any
phase here.

## 1. Parse input

Accept any of, from the user's invocation:

- A frame/section name (e.g. `HumanAI`, `humanai`) — used as `sectionName`.
- A Figma node id (e.g. `1715:634`).
- A `figma.com/...?node-id=...` URL — extract `fileKey` (the path segment
  after `/design/` or `/file/`) and node id (from `node-id=`, converting
  `1715-634` -> `1715:634`).

Resolve all three of `fileKey`, `nodeId`, `sectionName` before dispatch:

- If the user gave only a node id or URL, ask them (or infer from the
  section's existing file/screenshot naming, e.g. `./src/sections/*.jsx`,
  `./tests/visual/design/*.png`) what `sectionName` to use — it must match
  the `<name>.png` <-> `<Name>.jsx` <-> `#<name>` convention in
  `./tests/visual/design/README.md`.
- If the user gave only a section name with no node id, ask for the Figma
  node id or URL — this skill does not guess node ids.
- Default `fileKey` to the project's known DE5 file key if the user's
  invocation and recent conversation don't otherwise specify one; otherwise
  ask.

If required info is missing and can't be inferred, ask the user directly
rather than guessing.

## 2. MCP-reachability preflight (FIGMA_WORKFLOW.md #1)

Before dispatching the Workflow, call `get_metadata` on the resolved
`nodeId` (shallow) as a reachability probe:

- **Succeeds:** proceed to dispatch (step 3). The Workflow's own Extract
  phase will do the real pull — this call is only a preflight probe and
  does not count against Extract's ≤3-MCP-calls budget.
- **Fails / errors / disconnects:** do NOT retry silently and do NOT treat
  a fallback as equivalent. Tell the user explicitly that Figma MCP is
  unreachable right now, and fall back to the REST path per
  `./.claude/fetch_figma_frame.py`'s existing pattern (shallow tree first
  to resolve the node id, then one `nodes?ids=` pull for just that frame —
  never the full canvas). Report the fallback's output to the user as a
  manual/degraded pull, and point them at `./FIGMA_WORKFLOW.md` for the
  full manual checklist to apply by hand, since the automated pipeline's
  later phases (Token Map, Component Reuse, Self-Audit, etc.) are not run
  in this fallback path.

## 3. Dispatch the Workflow

On a successful preflight, invoke:

```js
Workflow({
  name: "figma-pull",
  args: { fileKey, nodeId, sectionName /*, forceRefresh: true if the user asked to re-pull ignoring cache */ },
})
```

## 4. Relay the report

The Workflow's final return value's `report` field (markdown, phase 9) is
the user-facing answer — relay it verbatim as this skill's response. Do not
summarize away its `NEW_TOKEN_NEEDED` entries, lint/build failures, or
visual-verify/baseline-needed action items — those are exactly what the
user needs to act on next.
