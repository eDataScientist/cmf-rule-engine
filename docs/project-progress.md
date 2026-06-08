# Project Progress

**Project**: ClaimCPU (claims-rule-engine)

---

## Kanban

| Board         | Link / Reference                          |
|---------------|-------------------------------------------|
| Project Board | claims-rule-engine  |

---

## Current Milestone

| Field     | Value |
|-----------|-------|
| Milestone | M3 - Accounts & Roles |
| Goal      | Multi-tenant RBAC for client companies |
| Status    | In Progress |

---

## Current Phase

| Field     | Value |
|-----------|-------|
| Phase     | Phase 4 - Client Admin Features |
| Objective | Client-admin user management, slot lifecycle, write restrictions, regression coverage |
| Status    | Complete |

---

## Status

- [x] Health check passing
- [x] Tests passing (281/283 — 2 pre-existing Phase 3 CSV export failures excluded)
- [x] Kanban MCP authenticated
- [x] npm run build passing (TreeForm.tsx fix verified in Gate 4.0)
- [x] Client admin slot request flow is end-to-end operational
- [x] Full integration smoke test across all three roles

---

## Execution Start

- Start with `Gate 3.0 - Admin Baseline & Test Harness`.
- After the gate completes, begin `Stream A`, `Stream B`, `Stream C`, and `Stream D.1-D.2` in parallel.
- Start `Stream D.3-D.4` after the admin actions from Streams A-C are available for audit-log verification.
- Start `Stream E` after Streams A-D land so the phase closes with regression coverage across the full admin console surface.

---

## Decisions

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | Testing framework: Vitest + RTL + jsdom | Standard Vite ecosystem, co-located test files, forward-only policy | 2026-05-13 |
| 2 | Milestone structure: full numbers only (M1-M8) | Cleaner separation than decimal sub-milestones (M3.1-M3.9) | 2026-05-13 |
| 3 | MVP boundary at M2 | Platform Foundation delivered complete fraud analysis app | 2026-05-13 |
| 4 | Admin Console merged into M3 (was separate M3.8) | Company and user provisioning are integral to the role system | 2026-05-13 |
| 5 | Phase 3 - Admin Console completed | All 21 tasks done, full test suite green (130 tests, 7 files), all DoD criteria met | 2026-05-15 |

---

## Milestone Overview

| # | Milestone | Status |
|---|-----------|--------|
| M1 | Core Engine | Complete |
| M2 | Platform Foundation | Complete (MVP) |
| M3 | Accounts & Roles | In Progress |
| M4 | Rebrand & Datasets | Not Started |
| M5 | Client Onboarding | Not Started |
| M6 | Detection APIs | Not Started |
| M7 | Pipeline & Playground | Not Started |
| M8 | Logs & Analytics | Not Started |

---

## Phase Graph

```text
M1 - Core Engine
|- Phase 1 - Project Foundation [complete]
|- Phase 2 - Type System & Database [complete]
|- Phase 3 - Core Logic [complete]
\- Phase 4 - Visualization [complete]

M2 - Platform Foundation
|- Phase 1 - Supabase Migration & Auth [complete]
|- Phase 2 - Datasets & Processing [complete]
|- Phase 3 - Rule Builder & Manager [complete]
|- Phase 4 - Table & Tree Visualizers [complete]
\- Phase 5 - Theme System [complete]

M3 - Accounts & Roles
|- Phase 1 - Database & Auth Foundation [complete]
|- Phase 2 - Auth, Routes & Role Guards [in review]
|- Phase 3 - Admin Console [complete]
|- Phase 4 - Client Admin Features [complete]
\- Phase 5 - Operations & Tree Assignment [complete]
```

---

## Pending Revisions

| # | Revision | Source | Status |
|---|----------|--------|--------|
| 1 | Fix `npm run build` - pre-existing `TreeForm.tsx:115` TS2345 error | Stream M3.1 stabilization review | **resolved** (verified in Gate 4.0 M3-4.0.2) |
| 3 | Finish M3.1 stabilization patches (auth regression, refresh loop, dialog fix) | Phase M3.1 tasks.md | _in review_ |

