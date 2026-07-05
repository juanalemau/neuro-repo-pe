# Coding style

- Require Node.js 20 or newer and preserve zero runtime dependencies in the base package.
- Keep generated output deterministic: do not include timestamps or machine-specific paths.
- Keep token-economy formulas deterministic and distinguish estimates from provider billing.
- Report local cache reuse separately from AI token reduction.
- Do not overwrite human-authored files anywhere in the structured `.ai` workspace.
- Limit replaceable artifacts to `summaries/`, `indexes/` and the incremental cache.
- Detect runtime versions from repository declarations; never execute project runtimes to infer them.
- Never store APM credentials or telemetry payloads in generated context.
- Every supported language detector needs a focused test fixture.
- Prefer small pure functions; keep filesystem writes in `core/`.
