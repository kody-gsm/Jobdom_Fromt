import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";

const FSD_LAYERS = new Set(["app", "pages", "widgets", "features", "entities", "shared"]);
const SLICED_LAYERS = new Set(["pages", "widgets", "features", "entities"]);
const SEGMENTS = new Set(["ui", "model", "api", "lib", "config"]);
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const GENERIC_DUMP_FILES = new Set([
  "utils.ts", "utils.tsx", "helpers.ts", "helpers.tsx", "helper.ts", "common.ts", "misc.ts",
]);

const normalizePath = (path: string) => path.replaceAll("\\", "/");
const isKebabCase = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

export const validateFsdPath = (filePath: string): string[] => {
  const path = normalizePath(filePath);
  if (!path.startsWith("src/fsd/")) return [];

  const errors: string[] = [];
  const parts = path.split("/");
  const layer = parts[2];
  if (!FSD_LAYERS.has(layer)) return [`invalid FSD layer: ${layer}`];

  if (SLICED_LAYERS.has(layer)) {
    const slice = parts[3];
    if (!slice || !isKebabCase(slice)) errors.push(`slice must be kebab-case: ${slice ?? "<missing>"}`);

    const segmentOrFile = parts[4];
    if (segmentOrFile && segmentOrFile !== "index.ts" && segmentOrFile !== "index.tsx" && !SEGMENTS.has(segmentOrFile)) {
      errors.push(`invalid FSD segment: ${segmentOrFile}`);
    }
  }

  if (GENERIC_DUMP_FILES.has(basename(path))) errors.push(`generic dump file is forbidden: ${basename(path)}`);
  return errors;
};

export const validateFsdSource = (filePath: string, source: string): string[] => {
  const path = normalizePath(filePath);
  const errors: string[] = [];

  if (/\bconsole\.log\s*\(/.test(source)) {
    errors.push("console.log is forbidden in committed FSD code");
  }

  if (/\bfetch\s*\(/.test(source) && !path.includes("/api/")) {
    errors.push("direct fetch is only allowed inside an api segment");
  }

  if (/catch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(source)) {
    errors.push("empty catch block is forbidden");
  }

  return errors;
};

const findSourceFiles = (directory: string): string[] => {
  if (!existsSync(directory)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...findSourceFiles(fullPath));
    else if (SOURCE_EXTENSIONS.has(extname(entry.name))) files.push(normalizePath(fullPath));
  }
  return files;
};

const runCli = () => {
  const files = findSourceFiles("src/fsd");
  const violations: string[] = [];

  for (const file of files) {
    for (const error of validateFsdPath(file)) violations.push(`${file}: ${error}`);
    const source = readFileSync(file, "utf8");
    for (const error of validateFsdSource(file, source)) violations.push(`${file}: ${error}`);
  }

  console.log(`Jobdam Convention Check: ${files.length} FSD source files`);
  if (violations.length > 0) {
    for (const violation of violations) console.error(`✗ ${violation}`);
    process.exit(1);
  }
  console.log("✓ FSD code conventions valid");
};

if (process.argv[1]?.endsWith("convention-check.ts")) runCli();
