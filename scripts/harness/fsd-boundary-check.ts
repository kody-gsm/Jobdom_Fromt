import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const LAYERS = ["shared", "entities", "features", "widgets", "pages", "app"] as const;
type FsdLayer = (typeof LAYERS)[number];

const SLICED_LAYERS = new Set<FsdLayer>(["entities", "features", "widgets", "pages"]);
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const normalizePath = (path: string) => path.replaceAll("\\", "/");

const getSourceLocation = (sourceFile: string) => {
  const parts = normalizePath(sourceFile).split("/");
  if (parts[0] !== "src" || parts[1] !== "fsd") return null;
  const layer = parts[2] as FsdLayer;
  if (!LAYERS.includes(layer)) return null;
  return {
    layer,
    slice: SLICED_LAYERS.has(layer) ? parts[3] : undefined,
  };
};

const getTargetLocation = (specifier: string) => {
  if (!specifier.startsWith("@fsd/")) return null;
  const parts = specifier.slice("@fsd/".length).split("/");
  const layer = parts[0] as FsdLayer;
  if (!LAYERS.includes(layer)) return { invalidLayer: parts[0], parts } as const;
  return {
    layer,
    slice: SLICED_LAYERS.has(layer) ? parts[1] : undefined,
    parts,
  };
};

export const validateFsdImport = (sourceFile: string, specifier: string): string[] => {
  if (specifier.startsWith(".")) return [];

  const source = getSourceLocation(sourceFile);
  const target = getTargetLocation(specifier);
  if (!source || !target) return [];
  if ("invalidLayer" in target) return [`invalid FSD target layer: ${target.invalidLayer}`];

  const sourceRank = LAYERS.indexOf(source.layer);
  const targetRank = LAYERS.indexOf(target.layer);
  if (targetRank > sourceRank) {
    return [`higher layer import is forbidden: ${source.layer} -> ${target.layer}`];
  }

  if (
    source.layer === target.layer &&
    SLICED_LAYERS.has(source.layer) &&
    source.slice &&
    target.slice &&
    source.slice !== target.slice
  ) {
    return [`same-layer cross-slice import is forbidden: ${source.slice} -> ${target.slice}`];
  }

  const crossesSliceBoundary = source.layer !== target.layer || source.slice !== target.slice;
  if (SLICED_LAYERS.has(target.layer) && crossesSliceBoundary && target.parts.length > 2) {
    return [`use the slice public API instead of a deep import: ${specifier}`];
  }

  if (!SLICED_LAYERS.has(target.layer) && target.parts.length > 2) {
    return [`use the layer segment public API instead of a deep import: ${specifier}`];
  }

  return [];
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

const getImportSpecifiers = (source: string) => {
  const specifiers: string[] = [];
  const patterns = [
    /\bfrom\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.push(match[1]);
  }
  return specifiers;
};

const runCli = () => {
  const files = findSourceFiles("src/fsd");
  const violations: string[] = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const specifier of getImportSpecifiers(source)) {
      for (const error of validateFsdImport(file, specifier)) {
        violations.push(`${file}: ${error}`);
      }
    }
  }

  console.log(`Jobdam FSD Boundary Check: ${files.length} source files`);
  if (violations.length > 0) {
    for (const violation of violations) console.error(`✗ ${violation}`);
    process.exit(1);
  }
  console.log("✓ FSD boundaries valid");
};

if (process.argv[1]?.endsWith("fsd-boundary-check.ts")) runCli();
