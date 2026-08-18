export const meta = {
  name: "figma-pull",
  description:
    "Pull one Figma frame into code: extract -> token map -> component reuse -> codegen -> assets -> self-audit -> lint/build -> visual verify -> report.",
  phases: [
    { title: "Extract", detail: "one node-level MCP pull, cached to disk" },
    { title: "Token Map", detail: "map Figma variables to tailwind.config.js tokens" },
    { title: "Component Reuse", detail: "grep for existing components before new markup" },
    { title: "Codegen", detail: "write/edit the section, apply tokens + FIGMA_WORKFLOW.md rules" },
    { title: "Assets", detail: "real asset export refs + fetch script, never silent placeholders" },
    { title: "Self-Audit", detail: "critic pass against all 11 FIGMA_WORKFLOW.md rules, bounded 1 retry" },
    { title: "Lint+Build", detail: "npm run lint && npm run build" },
    { title: "Visual Verify", detail: "pixelmatch vs baseline, or informational screenshot if missing" },
    { title: "Report", detail: "synthesize token map, reuse decisions, gate results, action items" },
  ],
};

// ---- args contract: { fileKey, nodeId, sectionName, forceRefresh? } ----
const { fileKey, nodeId, sectionName, forceRefresh } = args || {};
if (!fileKey || !nodeId || !sectionName) {
  throw new Error(
    "figma-pull requires args: { fileKey, nodeId, sectionName } (forceRefresh optional bool)"
  );
}

const cachePath = `./.zencoder/cache/figma/${nodeId.replace(/[:/]/g, "_")}.json`;

// ---- schemas (agent() opts.schema, JSON Schema) ----

const EXTRACT_SCHEMA = {
  type: "object",
  required: ["nodeId", "sectionName", "fromCache", "tokens", "text", "components", "assets"],
  properties: {
    nodeId: { type: "string" },
    sectionName: { type: "string" },
    fromCache: { type: "boolean", description: "true if short-circuited on a fresh cache hit" },
    referenceCode: { type: "string", description: "get_design_context reference React+Tailwind code, verbatim" },
    tokens: {
      type: "object",
      properties: {
        colors: { type: "array", items: { type: "object", properties: {
          figmaName: { type: "string" }, value: { type: "string" }, usage: { type: "string" } } } },
        sizes: { type: "array", items: { type: "object", properties: {
          figmaName: { type: "string" }, value: { type: "string" }, usage: { type: "string" } } } },
        spacing: { type: "array", items: { type: "object", properties: {
          figmaName: { type: "string" }, value: { type: "string" }, usage: { type: "string" } } } },
      },
    },
    text: { type: "array", items: { type: "object", properties: {
      node: { type: "string" }, content: { type: "string" } } } },
    components: { type: "array", items: { type: "object", properties: {
      figmaName: { type: "string" }, nodeId: { type: "string" }, description: { type: "string" } } } },
    assets: { type: "array", items: { type: "object", properties: {
      name: { type: "string" }, nodeId: { type: "string" }, type: { type: "string" },
      hasExportSettings: { type: "boolean" },
      decorative: { type: "boolean", description: "FIGMA_WORKFLOW.md #5 - complex diagram/mask group" } } } },
    mcpCallsUsed: { type: "number", description: "0 on cache hit, else the exact count spent (must be <=3)" },
  },
};

const TOKEN_MAP_SCHEMA = {
  type: "object",
  required: ["entries"],
  properties: {
    entries: {
      type: "array",
      items: {
        type: "object",
        required: ["figmaName", "value", "status"],
        properties: {
          figmaName: { type: "string" },
          value: { type: "string" },
          tailwindToken: { type: ["string", "null"] },
          status: { type: "string", enum: ["MATCHED", "NEW_TOKEN_NEEDED"] },
        },
      },
    },
  },
};

const COMPONENT_REUSE_SCHEMA = {
  type: "object",
  required: ["decisions"],
  properties: {
    decisions: {
      type: "array",
      items: {
        type: "object",
        required: ["figmaName", "decision"],
        properties: {
          figmaName: { type: "string" },
          decision: { type: "string", enum: ["REUSE_EXISTING", "NEW_COMPONENT"] },
          existingFile: { type: ["string", "null"] },
          rationale: { type: "string" },
        },
      },
    },
  },
};

const CODEGEN_SCHEMA = {
  type: "object",
  required: ["filesChanged", "summary"],
  properties: {
    filesChanged: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    placeholdersLeft: { type: "array", items: { type: "string" }, description: "any undisclosed-placeholder risk, per FIGMA_WORKFLOW.md #4" },
  },
};

const ASSETS_SCHEMA = {
  type: "object",
  required: ["assetsFound", "fetchScriptPath"],
  properties: {
    assetsFound: { type: "boolean" },
    fetchScriptPath: { type: ["string", "null"] },
    expiryNote: { type: ["string", "null"] },
    mcpCallsUsed: { type: "number", description: "0 if no real assets, else exactly 1 (download_assets)" },
  },
};

const AUDIT_SCHEMA = {
  type: "object",
  required: ["pass", "findings"],
  properties: {
    pass: { type: "boolean" },
    findings: {
      type: "array",
      items: {
        type: "object",
        required: ["rule", "status"],
        properties: {
          rule: { type: "string", description: "e.g. '#7 sibling-check'" },
          status: { type: "string", enum: ["OK", "VIOLATION"] },
          detail: { type: "string" },
        },
      },
    },
  },
};

const LINT_BUILD_SCHEMA = {
  type: "object",
  required: ["lintPass", "buildPass"],
  properties: {
    lintPass: { type: "boolean" },
    buildPass: { type: "boolean" },
    unresolved: { type: "array", items: { type: "string" } },
  },
};

const VISUAL_VERIFY_SCHEMA = {
  type: "object",
  required: ["baselineExists"],
  properties: {
    baselineExists: { type: "boolean" },
    mismatchPct: { type: ["number", "null"] },
    gatePass: { type: ["boolean", "null"] },
    actionItem: { type: ["string", "null"], description: "baseline-needed instructions when missing" },
    mcpCallsUsed: { type: "number", description: "0 if baseline existed, else 0 or 1 (get_screenshot, informational only)" },
  },
};

// ---- Phase 1: Extract ----
phase("Extract");
const extracted = await agent(
  `You are the Extract phase of a Figma-pull pipeline for section "${sectionName}" ` +
    `(fileKey=${fileKey}, nodeId=${nodeId}).\n\n` +
    `Step 1 - cache check: run Bash to check if ${cachePath} exists.` +
    (forceRefresh ? " forceRefresh=true was passed, so ignore any existing cache and re-pull." : "") +
    ` If it exists${forceRefresh ? "" : " and forceRefresh is not set"}, read it, set fromCache=true, ` +
    `mcpCallsUsed=0, and return its contents matching the schema. Make ZERO MCP calls in this case.\n\n` +
    `Step 2 - otherwise, pull fresh (MCP budget: exactly 3 calls, no more): ` +
    `call get_design_context on node ${nodeId}, call get_variable_defs on the same node, ` +
    `call get_metadata (shallow) on the same node. Do this ONCE at the node level - never loop ` +
    `per child/sub-element; work from the returned subtree instead. ` +
    `Per FIGMA_WORKFLOW.md #2, name every color/size/spacing token after the real Figma variable/style ` +
    `name, never a bare arbitrary-value fallback number. Per FIGMA_WORKFLOW.md #5, if a group looks like ` +
    `a decorative/complex diagram (arrows, masks, many small vector pieces) rather than real layout, do ` +
    `NOT decompose it - mark it decorative:true in assets and note that Export Settings should be ` +
    `requested from the file owner instead of reproducing it piece-by-piece. ` +
    `Capture get_design_context's reference React+Tailwind code verbatim into referenceCode ` +
    `(it is the only artifact later phases have - they will not re-call MCP).\n\n` +
    `Step 3 - persist: mkdir -p the parent dir of ${cachePath} and write the full result object ` +
    `(matching the schema exactly) to ${cachePath} as JSON. Set mcpCallsUsed to the exact count you spent ` +
    `(must be 0 on cache hit, else 3). Then return the same object.`,
  { phase: "Extract", schema: EXTRACT_SCHEMA }
);

if (!extracted) {
  throw new Error("Extract phase failed to return a result; aborting pipeline.");
}
log(
  `Extract done (fromCache=${extracted.fromCache}, mcpCallsUsed=${extracted.mcpCallsUsed ?? "?"})`
);

// ---- Phase 2: Token Map ----
phase("Token Map");
const tokenMap = await agent(
  `You are the Token Map phase. Read ${cachePath} (the cached Extract output - do NOT call any Figma ` +
    `MCP tool in this phase, zero further MCP calls allowed) plus ./tailwind.config.js and ./DESIGN.md. ` +
    `For every entry in tokens.colors/sizes/spacing from the cache, find whether an existing Tailwind ` +
    `token already represents it (match by the *real* Figma variable/style name in ${cachePath}, per ` +
    `FIGMA_WORKFLOW.md #2 - never accept a bare fallback number as a match). If a real match exists, set ` +
    `tailwindToken to its name and status MATCHED. If none exists, set tailwindToken null and status ` +
    `NEW_TOKEN_NEEDED, keeping the exact Figma variable name in figmaName so a human can add it to ` +
    `tailwind.config.js/DESIGN.md later. Also check headline font-size/line-height entries against ` +
    `FIGMA_WORKFLOW.md #6 (this repo's big headlines go up to 360px, above Tailwind's default text-9xl - ` +
    `named fontSize tokens like display-h2 are expected, not the closest default class).`,
  { phase: "Token Map", schema: TOKEN_MAP_SCHEMA }
);
log(`Token Map done (${tokenMap?.entries?.length ?? 0} entries)`);

// ---- Phase 3: Component Reuse ----
phase("Component Reuse");
const reuse = await agent(
  `You are the Component Reuse phase. Read ${cachePath} (zero further MCP calls - do not call ` +
    `get_code_connect_suggestions or any other Figma tool here, this phase is grep-only per the MCP ` +
    `budget). For every entry in its components[] array, grep ./src/design-system/components/*.jsx and ` +
    `./src/sections/*.jsx for an existing match (FIGMA_WORKFLOW.md #3 - e.g. Card.jsx/DeLogo.jsx exist ` +
    `because multiple sections reuse the same Figma component). If a match exists, decide REUSE_EXISTING ` +
    `and name the existingFile; otherwise NEW_COMPONENT. Note in rationale if the same figmaName appears ` +
    `used by more than one part of this frame (a signal a NEW_COMPONENT should be written once and ` +
    `reused, not duplicated).`,
  { phase: "Component Reuse", schema: COMPONENT_REUSE_SCHEMA }
);
log(`Component Reuse done (${reuse?.decisions?.length ?? 0} decisions)`);

// ---- Phase 4: Codegen (with bounded 1-retry after Self-Audit) ----
phase("Codegen");
const codegenPrompt = (auditFindings) =>
  `You are the Codegen phase for section "${sectionName}". Read ${cachePath} for the cached Extract ` +
    `output (referenceCode, tokens, text, components, assets - zero further MCP calls) plus the Token ` +
    `Map and Component Reuse decisions below. Write/edit the target file(s): if any decision is ` +
    `NEW_COMPONENT, create it under ./src/design-system/components/; otherwise edit/create ` +
    `./src/sections/${sectionName}.jsx (or the appropriate existing section file). Apply:\n` +
    `- the token map (real token names, never raw fallback numbers - #2)\n` +
    `- type-scale + text-box-trim rules, adding named fontSize tokens to tailwind.config.js if ` +
    `NEW_TOKEN_NEEDED entries require it (#6)\n` +
    `- check the SPECIFIC node's reference code for each element rather than copying a sibling's pattern ` +
    `(#7)\n` +
    `- for any element with its own background/border, reproduce Figma's inset as margin/width, not ` +
    `padding, unless that element's own bg/border is genuinely meant to span edge-to-edge (#8)\n` +
    `- if this section involves a staggered/masonry-style multi-column layout, use CSS multi-column ` +
    `(columns) with explicit break-before-column on the right item, not CSS Grid or flex-wrap (both are ` +
    `row-based and cannot do column-independent flow), and never a hand-computed -mt-[Npx] offset (#9)\n` +
    `Token Map:\n${JSON.stringify(tokenMap)}\n\nComponent Reuse decisions:\n${JSON.stringify(reuse)}\n\n` +
    (auditFindings
      ? `A prior Self-Audit pass found violations - fix ONLY these flagged items, do not otherwise ` +
        `rewrite what already passed:\n${JSON.stringify(auditFindings)}\n\n`
      : "") +
    `Return the files you changed and a summary. If any real asset from ${cachePath} isn't available yet, ` +
    `leave an explicitly commented placeholder (never an unlabeled colored <div>, per #4) and list it in ` +
    `placeholdersLeft.`;

let codegen = await agent(codegenPrompt(null), { phase: "Codegen", schema: CODEGEN_SCHEMA });
log(`Codegen done: ${codegen?.summary ?? "(no summary returned)"}`);

// ---- Phase 5: Assets ----
phase("Assets");
const assets = await agent(
  `You are the Assets phase. Read ${cachePath}'s assets[] array (zero further MCP calls unless real, ` +
    `non-decorative assets exist). If assets[] is empty or every entry is decorative:true (per Extract's ` +
    `#5 handling - those need Export Settings from the file owner, not an automated pull), set ` +
    `assetsFound=false, fetchScriptPath=null, mcpCallsUsed=0 and stop. Otherwise call download_assets ` +
    `ONCE for the whole node's real assets (never per-layer, and never re-call get_design_context/` +
    `get_variable_defs/get_metadata here - those are Extract-only). Write one fetch script mirroring ` +
    `./.claude/fetch_figma_frame.py's existing pattern (e.g. ` +
    `./.zencoder/cache/figma/fetch_${sectionName}_assets.py) containing every exported URL, and set ` +
    `expiryNote to an explicit "URLs expire in ~7 days, run this soon" reminder (#4). Set mcpCallsUsed ` +
    `accordingly (0 or 1).`,
  { phase: "Assets", schema: ASSETS_SCHEMA }
);
log(`Assets done (assetsFound=${assets?.assetsFound})`);

// ---- Phase 6: Self-Audit (bounded 1 retry into Codegen) ----
phase("Self-Audit");
let audit = await agent(
  `You are the Self-Audit phase - a critic, independent from Codegen. Run \`git diff\` to see exactly ` +
    `what Codegen changed, and read ./FIGMA_WORKFLOW.md verbatim in full. Check the diff against every ` +
    `one of its 11 rules, explicitly including #9 (masonry/column-independent flow - CSS Grid/flex-wrap ` +
    `misuse) and #10 (you can only see tool output/JSON/screenshots, never the live Figma file - flag any ` +
    `claim of "real per-item variation" made with more confidence than the underlying data supports). ` +
    `Also cross-check against ${cachePath} for token fidelity (#2) and against the Component Reuse ` +
    `decisions for duplication (#3). Return pass=true only if there are zero VIOLATION findings.`,
  { phase: "Self-Audit", schema: AUDIT_SCHEMA }
);
log(`Self-Audit done (pass=${audit?.pass})`);

if (audit && audit.pass === false) {
  const violations = audit.findings.filter((f) => f.status === "VIOLATION");
  log(`Self-Audit found ${violations.length} violation(s); re-running Codegen once (bounded retry).`);
  codegen = await agent(codegenPrompt(violations), { phase: "Self-Audit", schema: CODEGEN_SCHEMA });
  audit = await agent(
    `You are the Self-Audit phase, second and FINAL pass (retry is bounded to 1 - do not request ` +
      `another). Re-run \`git diff\` and re-check only the previously flagged items against ` +
      `./FIGMA_WORKFLOW.md: ${JSON.stringify(violations)}. Return the full findings list again (including ` +
      `any items that still fail).`,
    { phase: "Self-Audit", schema: AUDIT_SCHEMA }
  );
  log(`Self-Audit retry done (pass=${audit?.pass})`);
}

// ---- Phase 7: Lint + Build ----
phase("Lint+Build");
const lintBuild = await agent(
  `You are the Lint+Build phase. Run \`npm run lint\` then \`npm run build\` via Bash. If lint reports ` +
    `errors introduced by Codegen's changes, fix them directly (new files are held to full 'error' ` +
    `severity per eslint.config.js's override list - do not downgrade severity to make this pass). If ` +
    `you cannot resolve something, list it in unresolved rather than silently suppressing it. Report ` +
    `lintPass/buildPass as the final state after your fixes.`,
  { phase: "Lint+Build", schema: LINT_BUILD_SCHEMA }
);
log(`Lint+Build done (lintPass=${lintBuild?.lintPass}, buildPass=${lintBuild?.buildPass})`);

// ---- Phase 8: Visual Verify ----
phase("Visual Verify");
const visualVerify = await agent(
  `You are the Visual Verify phase for section "${sectionName}". Run ` +
    `\`test -f ./tests/visual/design/${sectionName}.png\` via Bash.\n\n` +
    `If it EXISTS: run \`npx playwright test design-diff --grep ${sectionName}\`, read the emitted ` +
    `"design distance: N% pixels off" line, set mismatchPct=N and gatePass=(N<=3.5) matching the spec's ` +
    `own hard assertion in ./tests/visual/design-diff.spec.js. Do NOT suppress a failing run - report it ` +
    `as a genuine gate failure. mcpCallsUsed=0 in this branch.\n\n` +
    `If MISSING: do not fail the pipeline. Call get_screenshot({ nodeId: "${nodeId}", ` +
    `enableBase64Response: true }) once for a best-effort informational visual reference (explicitly ` +
    `label it in your findings as "not a committed baseline, for eyeballing only" - this is the pipeline's ` +
    `own +1 optional MCP call allowance). Set baselineExists=false, mismatchPct=null, gatePass=null, ` +
    `mcpCallsUsed=1, and set actionItem to the exact export/commit instructions from ` +
    `./tests/visual/design/README.md (export the section frame @1x at 1792px, crop to exact frame ` +
    `bounds, commit to ./tests/visual/design/${sectionName}.png) - note that design-diff.spec.js's own ` +
    `test.skip message already states this same requirement, so it will also surface in CI/Playwright ` +
    `reports, not only here.\n\n` +
    `Also do #11's final check: since you cannot literally see the file, treat this screenshot/pixelmatch ` +
    `output as the closest available substitute for "verify before calling it done" and say so.`,
  { phase: "Visual Verify", schema: VISUAL_VERIFY_SCHEMA }
);
log(
  `Visual Verify done (baselineExists=${visualVerify?.baselineExists}, ` +
    `gatePass=${visualVerify?.gatePass})`
);

// ---- Phase 9: Report ----
phase("Report");
const report = await agent(
  `You are the Report phase. Write a concise markdown report to ` +
    `./.zencoder/cache/figma/${nodeId.replace(/[:/]/g, "_")}-report.md summarizing this figma-pull run ` +
    `for section "${sectionName}" (nodeId=${nodeId}, fileKey=${fileKey}), then return the same markdown ` +
    `text as your final answer verbatim (the caller relays it directly to the user). Include:\n\n` +
    `1. Token map: every entry, calling out NEW_TOKEN_NEEDED ones with the exact Figma variable name a ` +
    `human must add to ./tailwind.config.js/./DESIGN.md.\n` +
    `   Data: ${JSON.stringify(tokenMap)}\n` +
    `2. Component reuse decisions.\n   Data: ${JSON.stringify(reuse)}\n` +
    `3. Codegen summary + files changed + any placeholders left.\n   Data: ${JSON.stringify(codegen)}\n` +
    `4. Assets: whether real assets were found, the fetch script path if any, and the ~7-day expiry ` +
    `reminder if applicable.\n   Data: ${JSON.stringify(assets)}\n` +
    `5. Self-Audit result (pass/fail, and any findings that survived the bounded retry).\n   Data: ` +
    `${JSON.stringify(audit)}\n` +
    `6. Lint+Build status, including anything left unresolved.\n   Data: ${JSON.stringify(lintBuild)}\n` +
    `7. Visual Verify result: mismatch % + gate pass/fail if a baseline existed, or the baseline-needed ` +
    `action item if not.\n   Data: ${JSON.stringify(visualVerify)}\n` +
    `8. MCP budget actually spent this run (should be 0 on a cache hit, else 3 for Extract + up to 1 for ` +
    `Assets + up to 1 for Visual Verify) - Extract reported mcpCallsUsed=${extracted?.mcpCallsUsed}, ` +
    `Assets reported ${assets?.mcpCallsUsed}, Visual Verify reported ${visualVerify?.mcpCallsUsed}.`,
  { phase: "Report" }
);

return {
  sectionName,
  nodeId,
  cachePath,
  tokenMap,
  reuse,
  codegen,
  assets,
  audit,
  lintBuild,
  visualVerify,
  report,
};
