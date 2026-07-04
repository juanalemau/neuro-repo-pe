export function projectTemplate(projectName) {
  return `# Project

<!-- Keep this file short. It is loaded before generated summaries. -->

${projectName} is a software project.

## Purpose

Describe the product goal and its users here.

## Context order

1. Read this file.
2. Read \`summary.md\`.
3. Read \`repository-map.md\`.
4. Open only the source files relevant to the task.

## Essential commands

Document install, test, lint and build commands here.
`;
}

export function architectureTemplate() {
  return `# Architecture

Document module boundaries, dependency direction and important runtime flows here.
Prefer durable decisions over a complete directory inventory.
`;
}

export function conventionsTemplate() {
  return `# Conventions

Document only project-specific rules that tools cannot infer.
Keep each rule short, testable and free of duplicated formatter or linter configuration.
`;
}
