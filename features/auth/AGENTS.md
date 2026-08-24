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
