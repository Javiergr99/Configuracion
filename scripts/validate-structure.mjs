import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = join(root, "src");
const supportedExtensions = [".ts", ".tsx"];
const missingImports = [];
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry);

    if (statSync(absolutePath).isDirectory()) {
      walk(absolutePath);
      continue;
    }

    if (supportedExtensions.includes(extname(absolutePath))) {
      files.push(absolutePath);
    }
  }
}

function resolvesAlias(specifier) {
  const relativeSpecifier = specifier.slice(2);

  return [
    join(sourceRoot, `${relativeSpecifier}.ts`),
    join(sourceRoot, `${relativeSpecifier}.tsx`),
    join(sourceRoot, relativeSpecifier, "index.ts"),
    join(sourceRoot, relativeSpecifier, "index.tsx"),
  ].some(existsSync);
}

walk(sourceRoot);

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const aliases = content.matchAll(/from\s+["'](@\/[^"']+)["']/g);

  for (const match of aliases) {
    const specifier = match[1];

    if (specifier && !resolvesAlias(specifier)) {
      missingImports.push(`${relative(root, file)} -> ${specifier}`);
    }
  }
}

if (missingImports.length > 0) {
  console.error("Se encontraron importaciones locales sin resolver:");

  for (const item of missingImports) {
    console.error(`- ${item}`);
  }

  process.exit(1);
}

console.log(
  `Estructura validada: ${files.length} archivos TypeScript y ninguna importacion local faltante.`,
);
