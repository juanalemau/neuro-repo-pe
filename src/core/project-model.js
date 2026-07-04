import { hash } from "./hash.js";
import { detectStack } from "../detectors/languages.js";
import { extractSymbols } from "../detectors/symbols.js";

export function buildProjectModel(files, previousCache = { files: {} }) {
  const stack = detectStack(files);
  const nextCache = { version: 1, files: {} };
  let cacheHits = 0;

  const mappedFiles = files.map((file) => {
    const digest = hash(file.content);
    const cached = previousCache.files?.[file.path];
    let symbols;

    if (cached?.hash === digest && Array.isArray(cached.symbols)) {
      symbols = cached.symbols;
      cacheHits += 1;
    } else {
      symbols = extractSymbols(file);
    }

    nextCache.files[file.path] = { hash: digest, symbols };
    return {
      path: file.path,
      bytes: file.bytes,
      symbols,
      score: rankFile(file.path, symbols),
    };
  });

  mappedFiles.sort((left, right) => right.score - left.score || left.path.localeCompare(right.path));

  return {
    stack,
    files: mappedFiles,
    statistics: {
      files: mappedFiles.length,
      bytes: mappedFiles.reduce((total, file) => total + file.bytes, 0),
      symbols: mappedFiles.reduce((total, file) => total + file.symbols.length, 0),
      cacheHits,
    },
    cache: nextCache,
  };
}

function rankFile(file, symbols) {
  const depth = file.split("/").length - 1;
  const name = file.split("/").at(-1).toLowerCase();
  let score = Math.max(0, 20 - depth * 2) + Math.min(symbols.length, 10) * 3;

  if (/^(readme|package\.json|pyproject\.toml|cargo\.toml|go\.mod|pom\.xml)/u.test(name)) score += 25;
  if (/(main|index|app|routes?|config|schema|api)\./u.test(name)) score += 20;
  if (/(test|spec|fixture|mock|generated|snapshot)/u.test(file.toLowerCase())) score -= 15;
  if (/^(src|app|lib|packages)\//u.test(file)) score += 10;

  return score;
}
