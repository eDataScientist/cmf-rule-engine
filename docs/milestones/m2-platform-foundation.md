# Milestone 2 — Platform Foundation

> Transform ClaimCPU from a local analysis tool into a web application: migrate to Supabase, add dataset management, build the rule creation experience, add interactive visualizers, and support two insurance-type themes. This is the MVP — users can upload claims, build rules, and score batches independently.

---

## Phases

### Phase 1 — Supabase Migration & Auth
> Migrate from SQLite to Supabase for persistent storage, deploy edge functions for dataset processing, and add email/password authentication with session management.

### Phase 2 — Datasets & Processing
> Enable CSV upload with automatic column alignment and quality scoring. Build bulk claim processing that evaluates claims against selected trees and returns scored results.

### Phase 3 — Rule Builder & Manager
> Build an IDE-style rule composition interface with syntax validation and composite rule cards. Add rule set CRUD operations with severity labels.

### Phase 4 — Table & Tree Visualizers
> Display scored results in a filterable table with financial analytics and risk badges. Build an interactive tree structure canvas with React Flow, pan-and-zoom, and subtree carousel.

### Phase 5 — Theme System
> Introduce Motor (blue) and Medical (green) visual themes with CSS variable switching, a theme toggle in the sidebar, and smooth transitions.

---

## Phase Dependencies

```
Phase 1 → Phase 2 → Phase 3
Phase 2 → Phase 4
Phase 3 → Phase 4
Phase 4 → Phase 5 (parallel-ready)
```

Phase 1 must complete first (everything depends on Supabase and auth). Phase 2 and Phase 3 can proceed in parallel after Phase 1. Phase 4 depends on both Phase 2 (datasets for table) and Phase 3 (rules for scoring). Phase 5 is independent.

---

## Success Criteria

- [x] Users can sign in with email and password
- [x] Datasets can be uploaded, aligned, and scored for quality
- [x] Bulk claim processing produces scored results with risk levels
- [x] Rules can be composed, saved, and applied to datasets
- [x] Tree structures are explorable on an interactive canvas
- [x] Scored claims display in a filterable table with analytics
- [x] Users can toggle between Motor and Medical themes
- [x] All phases are complete — this milestone is fully built

---

## SRS Traceability

| Phase | SRS IDs |
|-------|---------|
| Phase 1 — Supabase Migration & Auth | SRS-011 |
| Phase 2 — Datasets & Processing | SRS-004, SRS-005 |
| Phase 3 — Rule Builder & Manager | SRS-006, SRS-007 |
| Phase 4 — Table & Tree Visualizers | SRS-008, SRS-009 |
| Phase 5 — Theme System | SRS-010 |

---

_Milestone status: Complete (MVP)_
