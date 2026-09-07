import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const LAYERS = ["shared", "entities", "features", "widgets", "pages", "app"] as const;
type FsdLayer = (typeof LAYERS)[number];

const SLICED_LAYERS = new Set<FsdLayer>(["entities", "features", "widgets", "pages"]);
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const normalizePath = (path: string) => path.replaceAll("\\", "/");

const FSD_EXCLUDED_PREFIXES = [
  "src/fsd/pages/teacher/",
  "src/fsd/pages/teacher-forms/",
  "src/fsd/pages/teacher-form-submissions/",
  "src/fsd/pages/teacher-recruit/",
  "src/fsd/features/manage-recruit/",
] as const;

export const shouldCheckFsdSource = (sourceFile: string) => {
  const normalized = normalizePath(sourceFile);
  return !FSD_EXCLUDED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};

const getSourceLocation = (sourceFile: string) => {
  const parts = normalizePath(sourceFile).split("/");
  if (parts[0] !== "src" || parts[1] !== "fsd") return null;
  const layer = parts[2] as FsdLayer;
  if (!LAYERS.includes(layer)) return null;
  return {
    layer,
    slice: SLICED_LAYERS.has(layer) ? parts[3] : undefined,
    segment: SLICED_LAYERS.has(layer) ? undefined : parts[3],
  };
};

const getTargetLocation = (sourceFile: string, specifier: string) => {
  let parts: string[];
  if (specifier.startsWith("@fsd/")) {
    parts = specifier.slice("@fsd/".length).split("/");
  } else if (specifier.startsWith(".")) {
    const targetPath = normalizePath(relative(process.cwd(), resolve(dirname(sourceFile), specifier)));
    const targetParts = targetPath.split("/");
    if (targetParts[0] !== "src" || targetParts[1] !== "fsd") return null;
    parts = targetParts.slice(2);
  } else {
    return null;
  }
  const layer = parts[0] as FsdLayer;
  if (!LAYERS.includes(layer)) return { invalidLayer: parts[0], parts } as const;
  return {
    layer,
    slice: SLICED_LAYERS.has(layer) ? parts[1] : undefined,
    segment: SLICED_LAYERS.has(layer) ? undefined : parts[1],
    parts,
  };
};

export const validateFsdImport = (sourceFile: string, specifier: string): string[] => {
  if (!shouldCheckFsdSource(sourceFile)) return [];
  const source = getSourceLocation(sourceFile);
  const target = getTargetLocation(sourceFile, specifier);
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

  const sourceUnit = SLICED_LAYERS.has(source.layer) ? source.slice : source.segment;
  const targetUnit = SLICED_LAYERS.has(target.layer) ? target.slice : target.segment;
  const crossesBoundary = source.layer !== target.layer || sourceUnit !== targetUnit;
  const targetsPublicApi =
    target.parts.length <= 2 ||
    (target.parts.length === 3 && /^index\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(target.parts[2] ?? ""));

  if (SLICED_LAYERS.has(target.layer) && crossesBoundary && !targetsPublicApi) {
    return [`use the slice public API instead of a deep import: ${specifier}`];
  }

  if (!SLICED_LAYERS.has(target.layer) && crossesBoundary && !targetsPublicApi) {
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
  const files = findSourceFiles("src/fsd").filter(shouldCheckFsdSource);
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
