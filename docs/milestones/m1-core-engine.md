# Milestone 1 — Core Engine

> The algorithmic foundation of ClaimCPU: a FIGs parser that translates decision trees into executable code, a recursive scoring engine that evaluates claims through those trees, and visual tools that render tree structures with full path tracing.

---

## Phases

### Phase 1 — Project Foundation
> Establish the Vite + React + TypeScript frontend stack with Tailwind CSS, directory structure, and core dependencies.

### Phase 2 — Type System & Database
> Define TypeScript types for trees, claims, and trace results. Build the SQLite + Drizzle persistence layer for tree storage.

### Phase 3 — Core Logic
> Implement the FIGs parser for multi-tree input, the recursive scoring engine with condition evaluation, and risk classification with min-max probability scaling.

### Phase 4 — Visualization
> Build the tree visualizer component with color-coded leaf nodes, connector lines, root and decision node styling, and path highlighting for traced evaluations.

---

## Phase Dependencies

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
```

Sequential — each phase builds on the previous. Types defined in Phase 2 inform the parser and engine in Phase 3. Visualization in Phase 4 consumes the tree structures from Phase 3.

---

## Success Criteria

- [x] FIGs multi-tree input (with `+` separator) parses into valid tree structures
- [x] Claim data evaluated through decision trees produces a score, probability, and risk level
- [x] Tree visualizer renders nodes with proper coloring and connector lines
- [x] Multiple trees can be persisted to and loaded from the database
- [x] All phases are complete — this milestone is fully built

---

## SRS Traceability

| Phase | SRS IDs |
|-------|---------|
| Phase 2 — Type System & DB | SRS-001 (types support) |
| Phase 3 — Core Logic | SRS-001, SRS-002 |
| Phase 4 — Visualization | SRS-003 |

---

_Milestone status: Complete_
