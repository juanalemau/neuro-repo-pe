import path from "node:path";

const BRIDGES = {
  agents: {
    file: "AGENTS.md",
    content: (contextDir) => `# Agent instructions

The single source of project context is \`${contextDir}/\`.
Start with \`${contextDir}/project.md\`, then use generated summaries to locate relevant source.
Do not duplicate rules in this file.
`,
  },
  claude: {
    file: "CLAUDE.md",
    content: (contextDir) => `@${contextDir}/project.md
`,
  },
  copilot: {
    file: path.join(".github", "copilot-instructions.md"),
    content: (contextDir) => `The single source of project context is \`${contextDir}/\`.
Read \`${contextDir}/project.md\` first and use its summaries before scanning source files.
`,
  },
  gemini: {
    file: "GEMINI.md",
    content: (contextDir) => `# Project context

Read \`${contextDir}/project.md\` first. Use \`${contextDir}/summary.md\` and
\`${contextDir}/repository-map.md\` to select only the source files needed for the task.
`,
  },
};

export function bridgeDefinitions(names, contextDir) {
  return names.map((name) => ({
    ...BRIDGES[name],
    content: BRIDGES[name].content(contextDir),
  }));
}
