This is exactly how Codex discovers `AGENTS.md` files. The files are layered from global → project → feature, and all applicable files are loaded together. The deeper file adds or overrides guidance for its scope.

### Recommended AGENTS.md hierarchy for Codex

```bash
~/.codex/
├── AGENTS.md              # Personal/global instructions
├── config.toml
├── auth.json
└── scripts/

AuraEcosystem/
├── AGENTS.md              # Repository-wide rules
├── apps/
├── ai/
├── blockchain/
├── web4/
└── features/
    └── auth/
        └── AGENTS.md      # Authentication feature rules
```

### 1. `~/.codex/AGENTS.md` — Global Personal Guidance

This file contains instructions you want Codex to apply in every repository.

Markdown

```mkdn
# Global AGENTS.md

## Identity

Primary workspace: Aura Ecosystem / QUBUHUB.

Focus on AI engineering, Web4, blockchain, backend systems, DevOps, Swift, Rust, Go, Python, TypeScript, and Solidity.

## Coding Principles

- Prefer production-ready code.
- Security first.
- Type safety over convenience.
- Keep functions modular and documented.
- Preserve existing architecture unless explicitly asked to refactor.

## Style

- Use descriptive names.
- Avoid unnecessary dependencies.
- Prefer async/await.
- Generate tests alongside new code.

## Git

- Use Conventional Commits.
- Never commit secrets or API keys.
- Respect `.gitignore`.

## Documentation

Every public module should include:

- README.md
- Usage examples.
- Configuration docs.
- API docs when applicable.

## Security

- Validate user input.
- Sanitize filesystem operations.
- Never expose tokens in logs.
- Store credentials with least privilege.

## Default Workflow

1. Understand project structure.
2. Read nearby AGENTS.md files.
3. Make minimal safe changes.
4. Run lint/tests if available.
5. Explain important architectural decisions.
```

### 2. `AGENTS.md` at Repository Root — Shared Project Guidance

Everything here applies to everyone working on the repository.

Markdown

```mf
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
```

### 3. `AGENTS.md` in a Feature Folder — Local Feature Guidance

Example: `features/auth/AGENTS.md`

Markdown

```mdmd
# Authentication Feature AGENTS

Scope: features/auth/**

## Purpose

Implements OAuth, OIDC, PKCE, API key exchange, session management, and identity.

## Rules

- Always validate OAuth state.
- PKCE S256 is required.
- Never log access or refresh tokens.
- JWTs must be validated before decoding.
- Refresh expired ID tokens automatically.

## Files

- notify.py
- auth.ts
- callback.ts
- session.ts
- token-store.ts

## Testing

Run:

- OAuth callback tests.
- Refresh token tests.
- PKCE generation tests.
- JWT validation tests.

## Security Checklist

- CSRF protection.
- Secure cookie flags.
- File permissions `0600`.
- Secrets loaded from environment.
```

### How Codex merges them

<table class="_6IUVGW_Table" data-d-column-sizing="equal" data-d-dividers="" style="table-layout: fixed;"><tbody><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start"><p class="w6asjq_TextBase _85PZeG_Text" data-d-component="text"><span class="w6asjq_TextBase _85PZeG_Text" data-d-component="text" data-d-default-strong="" data-d-inline="">Location</span></p></td><td data-d-component="table-cell" data-d-valign="start"><p class="w6asjq_TextBase _85PZeG_Text" data-d-component="text"><span class="w6asjq_TextBase _85PZeG_Text" data-d-component="text" data-d-default-strong="" data-d-inline="">Purpose</span></p></td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start"><p class="w6asjq_TextBase _85PZeG_Text" data-d-component="text"><code class="er4J8W_Code" data-d-component="code">~/.codex/AGENTS.md</code></p></td><td data-d-component="table-cell" data-d-valign="start">Personal defaults across all projects.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start"><p class="w6asjq_TextBase _85PZeG_Text" data-d-component="text"><code class="er4J8W_Code" data-d-component="code">repo/AGENTS.md</code></p></td><td data-d-component="table-cell" data-d-valign="start">Shared architecture, tooling, coding standards.</td></tr><tr data-d-component="table-row"><td data-d-break-long-token="" data-d-component="table-cell" data-d-valign="start"><p class="w6asjq_TextBase _85PZeG_Text" data-d-component="text"><code class="er4J8W_Code" data-d-component="code">repo/features/auth/AGENTS.md</code></p></td><td data-d-component="table-cell" data-d-valign="start"><p class="w6asjq_TextBase _85PZeG_Text" data-d-component="text">Rules only when working inside <code class="er4J8W_Code" data-d-component="code">features/auth</code>.</p></td></tr></tbody></table>

Example

If you're editing:

```
AuraEcosystem/features/auth/session.ts
```

Codex loads guidance in this order:

1. `~/.codex/AGENTS.md`

2. `AuraEcosystem/AGENTS.md`

3. `AuraEcosystem/features/auth/AGENTS.md`

The authentication-specific instructions augment or narrow the broader project guidance for files in that folder.

### Best practice for large monorepos (Aura Ecosystem)

For a monorepo like Aura Ecosystem, I'd use multiple scoped `AGENTS.md` files:

```
AGENTS.md                     # Entire ecosystem

ai/AGENTS.md                  # AI models, prompts, inference
blockchain/AGENTS.md          # Smart contracts, consensus, wallets
web4/AGENTS.md                # Web4 protocol rules
apps/mobile/AGENTS.md         # Swift/iOS conventions
apps/web/AGENTS.md            # React/Svelte frontend rules
packages/sdk/AGENTS.md        # SDK API compatibility
services/auth/AGENTS.md       # OAuth/OIDC security rules
docs/AGENTS.md                # Documentation style guide
```

This gives Codex context-aware behavior depending on which part of the repository you're working in, while keeping your personal coding preferences separate from project-wide standards.
