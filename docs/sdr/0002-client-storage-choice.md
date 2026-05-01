# SDR-0002: Client Storage Choice

## Status
Accepted

## Date
2026-05-01

## Context
The application needs to persist expenses, categories, and limits without a backend server (NFR-08, FR-13).

## Decision
Use **localStorage**.

## Options considered
- **localStorage**: Selected. Simple, synchronous API, sufficient for up to 5MB of stringified JSON data, which is more than enough for thousands of expense records.
- **IndexedDB**: Asynchronous, robust, suitable for large datasets.

## Consequences
- Data is tied to the specific browser and device (as per assumptions/limitations).
- Easy synchronous access to data simplifies state management.

## Requirements touched
- FR-13 (Data preservation between sessions)
- NFR-05 (Data persistence)
- FR-15 (Data reset capability)

## Rejected options and rationale
- **IndexedDB**: Rejected because it introduces unnecessary asynchronous complexity for a dataset that will rarely exceed a few megabytes. `localStorage` perfectly aligns with the educational/simple nature of the project.
