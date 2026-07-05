import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { CONTEXT_FILES } from "./layout.js";

export async function loadCache(root, contextDir) {
  try {
    return JSON.parse(await readFile(cachePath(root, contextDir), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" || error instanceof SyntaxError) {
      return { version: 1, files: {} };
    }
    throw error;
  }
}

export async function saveCache(root, contextDir, cache) {
  const output = cachePath(root, contextDir);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

function cachePath(root, contextDir) {
  return path.join(root, contextDir, CONTEXT_FILES.cache);
}
