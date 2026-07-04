import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeText(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

export async function writeIfMissing(file, content) {
  try {
    await access(file);
    return false;
  } catch {
    await writeText(file, content);
    return true;
  }
}

export function resolveInside(root, relative) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relative);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Path escapes project root: ${relative}`);
  }
  return resolved;
}
