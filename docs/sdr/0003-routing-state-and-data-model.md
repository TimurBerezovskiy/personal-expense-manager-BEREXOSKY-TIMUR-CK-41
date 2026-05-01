# SDR-0003: Routing, State and Data Model

## Status
Accepted

## Date
2026-05-01

## Context
The application is a single-page list application. We need to define how state is tracked and whether routing is needed.

## Decision
- **Routing**: No routing needed. A Single Page Application (SPA) with modal overlays for creation/editing is sufficient.
- **State**: A global state object containing an array of `expenses` and an object of `limits`. State changes trigger a re-render of the DOM elements.
- **Data Model**:
  - `Expense`: `{ id, title, amount, category, date, description, createdAt, updatedAt }`
  - `Limits`: `{ "CategoryName": limitAmount }`

## Options considered
- **Client-side Routing (e.g. History API)**: Separate pages for dashboard vs list vs settings.
- **Single Page with Modals**: Selected. Keeps the UI compact and easy to navigate for a small dataset.

## Consequences
- The entire UI is present in `index.html`.
- Javascript handles showing/hiding Modals and Empty States.

## Requirements touched
- FR-01, FR-04 (Creation and editing forms)
- FR-03 (Viewing list)

## Rejected options and rationale
- **Client-side Routing**: Rejected because the app is simple enough to fit on a single dashboard screen without requiring URL changes or browser history management.
