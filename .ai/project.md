# Project

<!-- Keep this file short. It is loaded before generated summaries. -->

`ai-context-init` is a local-first Node.js library and CLI that prepares compact, vendor-neutral
project context for coding agents.

## Purpose

Reduce repeated token consumption and source-code scanning by generating a ranked repository map
under an explicit token budget. It serves maintainers who use multiple AI coding tools across
different languages and frameworks.

## Context order

1. Read this file.
2. Read `summary.md`.
3. Read `repository-map.md`.
4. Open only the source files relevant to the task.

## Essential commands

- `npm test`: run the Node.js test suite.
- `npm run lint`: validate public entry-point syntax.
- `npm run verify`: run all required checks.
- `node src/cli.js sync .`: refresh this repository's generated AI context.
