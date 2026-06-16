# Phase 1 — Rebrand & Identity Plan

**Status**: Complete
**Milestone**: M4 — Rebrand & Datasets
**Prefix**: M4-1

---

## Goals

- All user-facing strings reference "ClaimCPU" instead of "Claims Rule Engine" or "CMF"
- Favicon, page titles, meta tags, and sidebar branding reflect the ClaimCPU identity
- No regressions in existing functionality
- Build passes and existing test suite remains green

---

## Dependencies

| Dependency | Status |
|------------|--------|
| M3 complete — all account/role features operational | Complete |
| ClaimCPU logo asset (`src/assets/claims_cpu_logo.jpeg`) | Available |

---

## Gate 1.0 — Asset & Inventory Preparation

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| 1.0.1 | Inventory all user-facing brand references (grep for "Claims Rule Engine", "CMF", old logo imports) | 0.5 | None | Independent |
| 1.0.2 | Prepare logo asset for web use (copy `claims_cpu_logo.jpeg` to `public/claimcpu-logo.png` or equivalent) | 0.25 | 1.0.1 | Dependent |

### Gate Acceptance Criteria

- [ ] Complete list of files containing "Claims Rule Engine", "CMF", or old logo references
- [ ] Logo asset is available in a web-accessible location (public/ or src/assets/)

---

## Stream A — HTML & Meta Rebrand

> Update the HTML shell and browser chrome to ClaimCPU.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| A.1 | Update `index.html` title from "Claims Rule Engine" to "ClaimCPU" | 0.25 | Gate | Dependent |
| A.2 | Replace `/favicon.svg` with ClaimCPU-branded favicon | 0.5 | Gate | Dependent |

### Stream A Acceptance Criteria

- [ ] Browser tab displays "ClaimCPU" on all routes
- [ ] Favicon reflects ClaimCPU branding

---

## Stream B — Sidebar & Navigation Rebrand

> Replace CMF logo and text with ClaimCPU branding in the primary navigation.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| B.1 | Replace `CMFLogo` import in `Sidebar.tsx` with ClaimCPU logo asset | 0.25 | Gate | Dependent |
| B.2 | Replace "CMF" text with "ClaimCPU" in Sidebar branding | 0.25 | Gate | Dependent |
| B.3 | Update logo `alt` text and any aria labels to "ClaimCPU" | 0.25 | B.1 | Dependent |

### Stream B Acceptance Criteria

- [ ] Sidebar displays ClaimCPU logo and text
- [ ] Collapsed sidebar shows logo only, expanded shows "ClaimCPU"
- [ ] Alt text and accessibility labels are updated

---

## Stream C — Page Surface Strings

> Sweep all page components for remaining "CMF" or "Claims Rule Engine" references.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| C.1 | Replace "CMF Platform" with "ClaimCPU" in `PageHeader.tsx` | 0.25 | Gate | Dependent |
| C.2 | Sweep all pages and components for remaining brand references | 0.75 | Gate | Dependent |
| C.3 | Update any loading, empty, or error states containing old brand names | 0.5 | C.2 | Dependent |

### Stream C Acceptance Criteria

- [ ] `PageHeader` badge reads "ClaimCPU" instead of "CMF Platform"
- [ ] No "Claims Rule Engine" or "CMF" strings remain in `src/` (excluding knowledge-base/)
- [ ] Loading and empty states reference ClaimCPU where applicable

---

## Parallelization Map

```
Gate 1.0 (Inventory & Assets) ──────────────┐
                                             │
                ┌────────────────────────────┤
                │                            │
Stream A (HTML & Meta) ─────────────────────►│
Stream B (Sidebar) ─────────────────────────►│
Stream C (Page Strings) ────────────────────►│
                                             │
                                             ▼
                                   Phase 1 complete
```

---

## Definition of Done

- [ ] Gate 1.0 acceptance criteria pass
- [ ] Stream A acceptance criteria pass
- [ ] Stream B acceptance criteria pass
- [ ] Stream C acceptance criteria pass
- [ ] `npx eslint .` passes with no errors in touched files
- [ ] `npm run build` succeeds
- [ ] Existing test suite (`npm run test`) remains green
- [ ] Visual check: sidebar, browser tab, and page headers show ClaimCPU

---

## Test Scenarios

### Happy Path
- [ ] User loads app → browser tab shows "ClaimCPU"
- [ ] User views sidebar → sees ClaimCPU logo and text
- [ ] User navigates to any page → `PageHeader` badge shows "ClaimCPU"

### Edge Cases
- [ ] Sidebar collapsed state → logo still visible and correct
- [ ] No old "CMF" or "Claims Rule Engine" strings appear in UI
- [ ] Build succeeds with no broken asset references

---

## Tweaks

> Corrections to completed tasks within this phase are tracked here.
> Each tweak has an ID (e.g., 1.TW1), lists affected tasks, and
> includes test impact. See docs/core/tweak-planning.md for the full
> tweak workflow.

_None._

---
