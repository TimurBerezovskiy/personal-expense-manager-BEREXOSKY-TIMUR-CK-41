# SDR-0001: Stack Choice

## Status
Accepted

## Date
2026-05-01

## Context
The application is a single-user personal expense manager. It requires state management for filtering, categorical budgets, and real-time statistics updates. Given the constraint of being deployed natively on GitHub pages and aiming for simplicity without a backend, a reliable frontend stack is necessary. We aim for a "Liquid Glass" design requiring modern CSS, but no complex component logic is strictly required.

## Decision
Use **Vanilla HTML, CSS, JavaScript**.

## Options considered
- **Plain HTML/JS**: Selected. Simplest setup, meets all requirements, no build steps required, fully compatible with GitHub Pages static hosting natively.
- **Vite + React + TS**: Overkill for a simple expense tracker. The lack of complex, deep component trees makes Vanilla JS perfectly sufficient while ensuring maximum simplicity for GitHub pages.

## Consequences
- No build step required.
- Easy to deploy directly by dropping files into the repository root.
- State management and DOM updates are handled manually via JavaScript.

## Requirements touched
- FR-01 to FR-15 (All functional requirements)
- NFR-01 (Web app)
- NFR-08 (Compatibility with GitHub Pages)

## Rejected options and rationale
- **Vite + React + TS**: Rejected due to unnecessary complexity and build step overhead for an application of this scope. Vanilla JS provides the required functionality with the lightest footprint.
