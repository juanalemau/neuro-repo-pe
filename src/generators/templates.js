export function projectTemplate(projectName, stack = {}) {
  const compatibility = compatibilityText(stack);
  return `# Project

<!-- Keep this file short. It is loaded before generated summaries. -->

${projectName} is a software project.

## Detected compatibility

${compatibility}

## Purpose

Describe the product goal and its users here.

## Context order

1. Read this file.
2. Read \`../summaries/summary.md\`.
3. Read \`../indexes/repository-map.md\`.
4. Open only the source files relevant to the task.

## Essential commands

Document install, test, lint and build commands here.
`;
}

export function architectureTemplate(stack = {}) {
  return `# Architecture

Document module boundaries, dependency direction and important runtime flows here.
Prefer durable decisions over a complete directory inventory.

Detected baseline: ${compatibilityText(stack)}
`;
}

export function conventionsTemplate(stack = {}) {
  return `# Conventions

Document only project-specific rules that tools cannot infer.
Keep each rule short, testable and free of duplicated formatter or linter configuration.

When adding examples, keep them compatible with: ${compatibilityText(stack)}
`;
}

export function controlsTemplate(stack = {}) {
  return `# AI workspace

This directory contains editable project memory, reusable agent assets and generated indexes.
Human-authored files are never overwritten.

Compatibility baseline: ${compatibilityText(stack)}

## Commands

\`\`\`bash
ai-context generate skill <name> .
ai-context generate prompt <name> .
ai-context generate recipe <name> .
ai-context generate sdd <name> .
ai-context generate profile <name> .
\`\`\`

- Start with \`memory/project-memory.md\`.
- Read generated summaries from \`summaries/\` and indexes from \`indexes/\`.
- Keep reusable knowledge in the directory matching its purpose.
`;
}

export function directoryTemplate(directory, stack = {}) {
  const descriptions = {
    skills: "Reusable agent capabilities and specialized instructions.",
    prompts: "Project prompts that can be adapted by people and tools.",
    recipes: "Repeatable implementation recipes with inputs, steps and checks.",
    templates: "Reusable file and document templates.",
    context: "Task, team and domain-specific context profiles.",
    summaries: "Generated compact summaries. Files here may be replaced by `ai-context sync`.",
    examples: "Small examples demonstrating preferred project patterns.",
    architecture: "Architecture boundaries, diagrams and durable design notes.",
    adr: "Architecture Decision Records.",
    glossary: "Project and business terminology.",
    playbooks: "Operational and incident-response playbooks.",
    manifests: "Machine-readable declarations for AI integrations.",
    indexes: "Generated repository indexes. Files here may be replaced by `ai-context sync`.",
    retrieval: "Retrieval policies, source ranking and chunking guidance.",
    workflows: "Multi-step agent and team workflows.",
    docs: "Additional AI-facing documentation and specification-driven development documents.",
    sync: "Local synchronization and export scripts. Network behavior must be explicitly configured.",
  };

  return `# ${directory}

${descriptions[directory]}

Compatibility baseline: ${compatibilityText(stack)}
`;
}

export function syncScriptTemplates() {
  return {
    "ai-sync.ts": `import { syncProject } from "ai-context-init";

const result = await syncProject(process.cwd());
console.log(\`Synchronized \${result.generated.length} AI context files.\`);
`,
    "ai-summary.ts": `import { inspectProject } from "ai-context-init";

const result = await inspectProject(process.cwd());
console.log(JSON.stringify({
  stack: result.model.stack,
  statistics: result.model.statistics,
}, null, 2));
`,
    "ai-index.ts": `import { inspectProject } from "ai-context-init";

const result = await inspectProject(process.cwd());
console.log(result.repositoryMap.content);
`,
    "ai-vectorize.ts": `/**
 * Optional vectorization hook.
 *
 * Add your approved embedding provider and credential source here.
 * The default library never sends repository content to the network.
 */
export async function vectorizeContext(): Promise<void> {
  throw new Error("Vectorization provider is not configured.");
}
`,
    "ai-export.ts": `import { readFile } from "node:fs/promises";
import path from "node:path";

const summary = await readFile(
  path.join(process.cwd(), ".ai", "summaries", "summary.json"),
  "utf8",
);
process.stdout.write(summary);
`,
  };
}

export function compatibilityText(stack = {}) {
  const languages = stack.languages?.map((item) => item.name).join(", ") || "language not detected";
  const runtimes = stack.runtimes?.map((item) => `${item.name} ${item.version}`).join(", ");
  return runtimes ? `${languages}; runtimes: ${runtimes}.` : `${languages}; runtime version not declared.`;
}
