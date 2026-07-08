import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildStressGridHtml } from "./stress-grid.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const stressHtmlPath = join(root, "index.html");

const START = "<!-- stress-grid:start -->";
const END = "<!-- stress-grid:end -->";

const html = readFileSync(stressHtmlPath, "utf8");
const startIdx = html.indexOf(START);
const endIdx = html.indexOf(END);

if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  console.error(
    "index.html must contain <!-- stress-grid:start --> and <!-- stress-grid:end --> markers"
  );
  process.exit(1);
}

const gridHtml = buildStressGridHtml();
const updated =
  html.slice(0, startIdx + START.length) +
  "\n" +
  gridHtml +
  "\n      " +
  html.slice(endIdx);

writeFileSync(stressHtmlPath, updated);
console.log("Generated stress grid in index.html");
