import path from "node:path";

const RULES = {
  ".ts": [
    /\b(?:export\s+)?(?:default\s+)?(?:abstract\s+)?(?:class|interface|type|enum|function)\s+([A-Za-z_$][\w$]*)/gu,
    /\bexport\s+const\s+([A-Za-z_$][\w$]*)/gu,
  ],
  ".tsx": [
    /\b(?:export\s+)?(?:default\s+)?(?:class|interface|type|enum|function)\s+([A-Za-z_$][\w$]*)/gu,
    /\bexport\s+const\s+([A-Za-z_$][\w$]*)/gu,
  ],
  ".js": [/\b(?:export\s+)?(?:default\s+)?(?:class|function)\s+([A-Za-z_$][\w$]*)/gu],
  ".jsx": [/\b(?:export\s+)?(?:default\s+)?(?:class|function)\s+([A-Za-z_$][\w$]*)/gu],
  ".py": [/^(?:async\s+)?(?:def|class)\s+([A-Za-z_][\w]*)/gmu],
  ".java": [/\b(?:class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/gu],
  ".kt": [/\b(?:class|interface|object|fun)\s+([A-Za-z_][\w]*)/gu],
  ".go": [/\b(?:type|func)\s+(?:\([^)]*\)\s*)?([A-Za-z_][\w]*)/gu],
  ".rs": [/\b(?:pub\s+)?(?:struct|enum|trait|fn|mod)\s+([A-Za-z_][\w]*)/gu],
  ".cs": [/\b(?:class|interface|enum|record|struct)\s+([A-Za-z_][\w]*)/gu],
  ".rb": [/^\s*(?:class|module|def)\s+([A-Za-z_][\w!?=]*(?:::[A-Za-z_][\w]*)*)/gmu],
  ".php": [/\b(?:class|interface|trait|enum|function)\s+([A-Za-z_][\w]*)/gu],
};

export function extractSymbols(file, maximum = 20) {
  const rules = RULES[path.extname(file.path).toLowerCase()] ?? [];
  const symbols = [];
  const seen = new Set();

  for (const rule of rules) {
    rule.lastIndex = 0;
    for (const match of file.content.matchAll(rule)) {
      if (seen.has(match[1])) continue;
      seen.add(match[1]);
      symbols.push(match[1]);
      if (symbols.length >= maximum) return symbols;
    }
  }

  return symbols;
}
