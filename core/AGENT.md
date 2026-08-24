# Aura Ecosystem Repository AGENTS

## Project Vision

Aura Ecosystem is a unified platform combining AI, Web4, blockchain, decentralized identity, payments, developer tooling, and cloud infrastructure.

## Architecture

Domains:

- apps/
- packages/
- ai/
- blockchain/
- web4/
- services/
- docs/

Shared libraries belong inside `packages/`.

## Languages

| Area | Language |
|------|----------|
| Frontend | TypeScript, Svelte, React |
| Backend | TypeScript, Go, Python |
| AI | Python, Rust |
| Blockchain | Solidity, Rust |
| Mobile | Swift |

## Standards

- ESM only.
- Strict TypeScript.
- Environment variables only.
- No hardcoded credentials.

## Testing

- Vitest for TypeScript.
- Pytest for Python.
- Cargo test for Rust.
- Foundry tests for Solidity.

## Formatting

- Prettier.
- ESLint.
- Ruff.
- Black.
- rustfmt.
- gofmt.

## Pull Requests

Every PR should include:

- Summary.
- Tests.
- Security considerations.
- Breaking changes (if any).
