import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const IGNORED = new Set([
  "node_modules",
  "dist",
  ".git",
  "coverage",
  "playwright-report",
  "test-results",
]);
const EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".css",
  ".html",
  ".json",
  ".md",
  ".txt",
  ".yml",
  ".yaml",
  ".svg",
]);
const MOJIBAKE = [
  /\u00c3./u,
  /\u00c2./u,
  /\u00e2(?:\u20ac|\u2122)/u,
  /\u00ef\u00bb\u00bf/u,
  /\ufffd/u,
];

function collect(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, files);
    else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

const failures = [];
const files = collect(ROOT);
for (const file of files) {
  const buffer = fs.readFileSync(file);
  const relative = path.relative(ROOT, file);
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    failures.push(`${relative}: UTF-8 BOM detectado`);
    continue;
  }
  const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  if (MOJIBAKE.some((pattern) => pattern.test(text)))
    failures.push(`${relative}: mojibake detectado`);
}

if (failures.length) {
  console.error("FAIL: validación de encoding");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Encoding validado: ${files.length} archivos UTF-8 sin BOM ni mojibake conocido.`);
