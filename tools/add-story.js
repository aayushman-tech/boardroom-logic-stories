#!/usr/bin/env node
// add-story.js - validate a new story, copy it into stories/, hash it, update index.json.
// Usage:
//   npm run add-story -- path/to/story.json [--force]

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { validateStory } from "./validator-core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const force = args.includes("--force");
const fileArg = args.find((a) => !a.startsWith("--"));

if (!fileArg) {
  console.error("Usage: npm run add-story -- path/to/story.json [--force]");
  process.exit(1);
}

const srcFile = path.resolve(fileArg);
if (!fs.existsSync(srcFile)) {
  console.error(`No such file: ${srcFile}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(srcFile, "utf8"));
} catch (e) {
  console.error(`${srcFile} is not valid JSON: ${e.message}`);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, "schema", "story.schema.json"), "utf8"));
const result = validateStory(data, { allowShort: false, schema });

console.log(`Validating ${path.basename(srcFile)} ...`);
if (!result.ok) {
  console.error("\nVALIDATION FAILED - the story was NOT added. Fix these and try again:");
  for (const e of result.errors) console.error(`  - ${e}`);
  for (const w of result.warnings) console.warn(`  ~ (warning) ${w}`);
  console.error("\nHint: run `npm run validate -- --single " + srcFile + "` for a full report, or");
  console.error("check STORY_FORMAT.md (shortest path >= 32 scenes, >= 20 decisions, >= 3600 words).");
  process.exit(1);
}
for (const w of result.warnings) console.warn(`  ~ (warning) ${w}`);

const m = result.metrics;
const filename = `${data.id}.json`;
const destFile = path.join(repoRoot, "stories", filename);
if (fs.existsSync(destFile) && !force && srcFile !== destFile) {
  console.error(`\n${filename} already exists in stories/. Re-running for an update:`);
  console.error(`  npm run add-story -- ${srcFile} --force`);
  process.exit(1);
}

fs.mkdirSync(path.join(repoRoot, "stories"), { recursive: true });
fs.writeFileSync(destFile, JSON.stringify(data, null, 1) + "\n", "utf8");

// hash the stored file
const sha256 = crypto.createHash("sha256").update(fs.readFileSync(destFile)).digest("hex");

const manifestPath = path.join(repoRoot, "index.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.schemaVersion = 2;
manifest.minAppVersion = "1.1.0";

const entry = {
  id: data.id,
  title: data.title,
  subtitle: data.subtitle,
  publishDate: data.publishDate,
  estimatedMinutes: m.estimatedMinutes,
  tags: [...(data.tags || [])],
  file: `stories/${filename}`,
  sha256,
};

const others = (manifest.stories || []).filter((s) => s.id !== data.id);
others.push(entry);
others.sort((a, b) => (a.publishDate < b.publishDate ? 1 : a.publishDate > b.publishDate ? -1 : 0));
manifest.stories = others;
manifest.updated = new Date().toISOString();
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + "\n", "utf8");

console.log(`\nAdded: ${filename}`);
console.log(`  title:       ${data.title}`);
console.log(`  published:   ${data.publishDate}`);
console.log(`  tags:        ${data.tags.join(", ")}`);
console.log(`  sha256:      ${sha256}`);
console.log(`  est. length: ${m.estimatedMinutes} minutes (${m.shortestPathScenes} scenes, ${m.shortestPathWords} words on shortest win path)`);
console.log(`  index.json:  updated (now ${others.length} stories, sorted newest first)`);

console.log("\nRe-validating the whole repo...");
const re = spawnSync(process.execPath, [path.join(repoRoot, "tools", "validate.js")], {
  stdio: "inherit",
  cwd: repoRoot,
});
process.exit(re.status ?? 1);
