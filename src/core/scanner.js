import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { matchesAny } from "./patterns.js";

const DEFAULT_EXCLUDES = [
  ".git",
  ".svn",
  ".hg",
  "node_modules",
  "vendor",
  "dist",
  "build",
  "coverage",
  "target",
  "bin",
  "obj",
  ".next",
  ".nuxt",
  ".venv",
  "venv",
  "__pycache__",
  "*.min.js",
  "*.map",
  "*.lock",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "Cargo.lock",
  "poetry.lock",
];

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".gz",
  ".tar", ".jar", ".war", ".class", ".dll", ".exe", ".so", ".dylib", ".woff",
  ".woff2", ".ttf", ".mp3", ".mp4", ".mov", ".avi", ".db", ".sqlite",
]);

export async function scanProject(root, config) {
  const gitignore = await readIgnoreFile(path.join(root, ".gitignore"));
  const excludes = [
    ...DEFAULT_EXCLUDES,
    config.contextDir,
    ...gitignore,
    ...config.exclude,
  ];
  const files = [];

  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join("/");

      if (matchesAny(relative, excludes)) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        await visit(absolute);
        continue;
      }
      if (!entry.isFile() || BINARY_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
      if (config.include.length > 0 && !matchesAny(relative, config.include)) continue;

      const details = await stat(absolute);
      if (details.size > config.maxFileBytes) continue;

      const content = await readFile(absolute, "utf8");
      if (content.includes("\0")) continue;
      files.push({ path: relative, content, bytes: details.size });
    }
  }

  await visit(root);
  return files;
}

async function readIgnoreFile(file) {
  try {
    return (await readFile(file, "utf8"))
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && !line.startsWith("!"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}
