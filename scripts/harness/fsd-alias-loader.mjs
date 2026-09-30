import { existsSync, statSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = pathResolve(dirname(fileURLToPath(import.meta.url)), "../..");

const candidatesFor = (specifier) => {
  const target = pathResolve(repositoryRoot, "src/fsd", specifier.slice("@fsd/".length));
  return [target, `${target}.ts`, `${target}.tsx`, `${target}/index.ts`, `${target}/index.tsx`];
};

export const resolve = async (specifier, context, nextResolve) => {
  if (!specifier.startsWith("@fsd/")) return nextResolve(specifier, context);

  const target = candidatesFor(specifier).find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  if (!target) {
    throw new Error(`Unable to resolve FSD alias: ${specifier}`);
  }

  return { url: pathToFileURL(target).href, shortCircuit: true };
};
