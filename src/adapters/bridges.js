import path from "node:path";

const BRIDGES = {
  agents: {
    file: "AGENTS.md",
    content: (contextDir) => `# Agent instructions

The single source of project context is \`${contextDir}/\`.
Start with \`${contextDir}/memory/project-memory.md\`, then read
\`${contextDir}/summaries/summary.md\` and use generated indexes to locate relevant source.
Do not duplicate rules in this file.
`,
  },
  claude: {
    file: "CLAUDE.md",
    content: (contextDir) => `@${contextDir}/memory/project-memory.md
`,
  },
  copilot: {
    file: path.join(".github", "copilot-instructions.md"),
    content: (contextDir) => `The single source of project context is \`${contextDir}/\`.
Read \`${contextDir}/memory/project-memory.md\` first and use
\`${contextDir}/summaries/summary.md\` before scanning source files.
`,
  },
  gemini: {
    file: "GEMINI.md",
    content: (contextDir) => `# Project context

Read \`${contextDir}/memory/project-memory.md\` first. Use
\`${contextDir}/summaries/summary.md\` and \`${contextDir}/indexes/repository-map.md\`
to select only the source files needed for the task.
`,
  },
};

export function bridgeDefinitions(names, contextDir) {
  return names.map((name) => ({
    ...BRIDGES[name],
    content: BRIDGES[name].content(contextDir),
  }));
}
