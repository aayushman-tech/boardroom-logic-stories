#!/usr/bin/env node
// validate.js - validates every story in this repo against the schema + publication rules.
// Usage:
//   node tools/validate.js                 # full repo: index.json + all published stories
//   node tools/validate.js --single <path> # validate one story file in isolation
//   node tools/validate.js --allow-short   # skip length rules (sample/demo stories only)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { validateStory, validateManifestEntry } from "./validator-core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const allowShort = args.includes("--allow-short");
const singleIdx = args.indexOf("--single");
const singlePath = singleIdx >= 0 ? args[singleIdx + 1] : null;

const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, "schema", "story.schema.json"), "utf8"));

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const indent = "  ";

if (singlePath) {
  const file = path.resolve(singlePath);
  const raw = fs.readFileSync(file, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`FAIL: ${file} is not valid JSON: ${e.message}`);
    process.exit(1);
  }
  const result = validateStory(data, { allowShort, schema });
  printStoryReport(file, result);
  process.exit(result.ok ? 0 : 1);
}

// ---- full repo validation ----
let failed = false;

// demo (expected present, validated with allow-short semantics)
const demoPath = path.join(repoRoot, "examples", "demo.json");
if (fs.existsSync(demoPath)) {
  const demoData = JSON.parse(fs.readFileSync(demoPath, "utf8"));
  const demoResult = validateStory(demoData, { allowShort: true, schema });
  printStoryReport(path.relative(repoRoot, demoPath), demoResult);
  if (!demoResult.ok) failed = true;
} else {
  console.error("FAIL: examples/demo.json is missing");
  failed = true;
}

// manifest
const manifestPath = path.join(repoRoot, "index.json");
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.schemaVersion !== 1) throw new Error("schemaVersion must be 1");
  if (!Array.isArray(manifest.stories)) throw new Error("stories must be an array");
  console.log(`OK  index.json parses (schemaVersion 1, ${manifest.stories.length} stories)`);
} catch (e) {
  console.error(`FAIL: index.json: ${e.message}`);
  process.exit(1);
}

// sorted newest first?
const dates = manifest.stories.map((s) => s.publishDate);
const sorted = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
if (JSON.stringify(dates) !== JSON.stringify(sorted)) {
  console.error("FAIL: index.json stories must be sorted newest first by publishDate");
  failed = true;
}

// each published story
for (const entry of manifest.stories) {
  const file = path.join(repoRoot, entry.file);
  if (!fs.existsSync(file)) {
    console.error(`FAIL: ${entry.id}: file ${entry.file} does not exist`);
    failed = true;
    continue;
  }
  const actualHash = sha256File(file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`FAIL: ${entry.id}: not valid JSON (${e.message})`);
    failed = true;
    continue;
  }
  const result = validateStory(data, { allowShort: false, schema });
  const entryCheck = validateManifestEntry(entry, data, manifest, { sha256: actualHash });
  // published stories must have manifest-visible metrics consistent with real computation
  if (result.metrics && typeof result.metrics.estimatedMinutes === "number" &&
      result.metrics.estimatedMinutes !== entry.estimatedMinutes) {
    entryCheck.problems.push(`estimatedMinutes ${entry.estimatedMinutes} != computed ${result.metrics.estimatedMinutes}`);
  }
  const problems = [...result.errors, ...entryCheck.problems];
  if (!result.ok || entryCheck.ok === false) {
    console.error(`FAIL: ${entry.id}`);
    console.error(`${indent}hash: ${entry.sha256 === actualHash ? "ok" : `mismatch (manifest ${entry.sha256}, actual ${actualHash})`}`);
    for (const e of problems) console.error(`${indent}- ${e}`);
    if (result.warnings.length) for (const w of result.warnings) console.error(`${indent}~ ${w}`);
    failed = true;
  } else {
    console.log(`OK  ${entry.id} (${result.metrics.shortestPathScenes} scenes on shortest path, ${result.metrics.shortestPathWords} words, ~${result.metrics.estimatedMinutes} min, ${result.distinctEndingKinds.length} ending kinds)`);
    if (result.warnings.length) for (const w of result.warnings) console.error(`${indent}~ ${w}`);
  }
}

// also warn about any story file not referenced in the manifest
const storiesDir = path.join(repoRoot, "stories");
if (fs.existsSync(storiesDir)) {
  const referenced = new Set(manifest.stories.map((s) => s.file));
  for (const f of fs.readdirSync(storiesDir)) {
    if (!f.endsWith(".json")) continue;
    const rel = `stories/${f}`;
    if (!referenced.has(rel)) {
      console.error(`WARN: stories/${f} exists but is not listed in index.json`);
    }
  }
}

console.log(failed ? "\nVALIDATION FAILED" : "\nALL VALID");
process.exit(failed ? 1 : 0);

function printStoryReport(label, result) {
  if (result.ok) {
    const m = result.metrics || {};
    console.log(`OK  ${label} (shortest path: ${m.shortestPathScenes} scenes, ${m.shortestPathDecisions} decisions, ${m.shortestPathWords} words, ~${m.estimatedMinutes} min, endings: kind kinds ${result.distinctEndingKinds.join(", ")})`);
    for (const w of result.warnings) console.error(`${indent}~ ${w}`);
  } else {
    console.error(`FAIL: ${label}`);
    for (const e of result.errors) console.error(`${indent}- ${e}`);
    for (const w of result.warnings) console.error(`${indent}~ ${w}`);
  }
}
