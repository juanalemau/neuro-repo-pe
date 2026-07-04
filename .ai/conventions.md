# Conventions

- Require Node.js 20 or newer and preserve zero runtime dependencies in the base package.
- Keep generated output deterministic: do not include timestamps or machine-specific paths.
- Do not overwrite human-authored context during `init` or `sync`.
- Every supported language detector needs a focused test fixture.
- Prefer small pure functions; keep filesystem writes in `core/`.
