# Architecture

The flow is configuration → scanner → detectors → ranked project model → token-budgeted
generators → vendor adapters. File hashes connect the project model to an incremental local cache.

- `core/` owns orchestration and filesystem boundaries.
- `detectors/` turn source files into language, framework and symbol metadata.
- `generators/` produce deterministic vendor-neutral artifacts.
- `adapters/` produce minimal tool-specific bridges.

The library API must remain independent from CLI parsing. Human-authored context is never
overwritten; generated summaries may be safely replaced.

Editable artifacts are routed to purpose-specific directories under `contextDir` and created
individually by the CLI. Generated summaries live in `summaries/`, indexes in `indexes/`, and
incremental state in `sync/`. Declared runtime versions shape templates. APM configuration is
context metadata only; instrumentation and credentials remain outside this library.
