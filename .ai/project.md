# Project

<!-- Keep this file short. It is loaded before generated summaries. -->

`ai-context-init` is a local-first Node.js library and CLI that prepares compact, vendor-neutral
project context for coding agents across polyglot repositories. It scaffolds a structured `.ai`
workspace for memory, reusable knowledge, retrieval, workflows and local synchronization, and
exposes non-secret APM metadata to agents.

## Purpose

Reduce repeated token consumption and source-code scanning by generating a ranked repository map
under an explicit token budget. It serves maintainers who use multiple AI coding tools across
different languages and frameworks. Generated templates must record the runtime versions declared
by each project and remain safe for teams to customize.

## Context order

1. Read this file.
2. Read `../summaries/summary.md`.
3. Read `../indexes/repository-map.md`.
4. Open only the source files relevant to the task.

## Essential commands

- `npm test`: run the Node.js test suite.
- `npm run lint`: validate public entry-point syntax.
- `npm run verify`: run all required checks.
- `node src/cli.js sync .`: refresh this repository's generated AI context.
- `node src/cli.js generate skill <name> .`: create an editable, version-aware AI control.
