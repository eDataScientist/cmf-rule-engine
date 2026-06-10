# Milestone 4 — Rebrand & Datasets

> This milestone establishes the ClaimCPU product identity and introduces a new way to create datasets without uploading CSV files. After this milestone, users see ClaimCPU branding everywhere, and they can build datasets by selecting columns from a dimension catalogue — including custom company-scoped dimensions — with full support for rule building and tree generation.

---

## Phases

### Phase 1 — Rebrand & Identity
> Rename all user-facing surfaces to ClaimCPU, including page titles, sidebar branding, favicon, meta tags, error messages, and loading states.

### Phase 2 — Dimension Catalogue Foundation
> Build a dimension catalogue derived from existing upload/alignment dimensions, establishing the source of truth for schema-mode dataset creation.

### Phase 3 — Schema Dataset Creation
> Allow users to create datasets by selecting columns from the dimension catalogue without uploading a CSV file, with full persistence and dataset lifecycle management.

### Phase 4 — Custom Dimensions
> Support company-scoped custom dimension additions beyond the catalogue, so each company can define dimensions specific to their data needs.

### Phase 5 — Pipeline Integration & Testing
> Ensure schema-only datasets work end-to-end with the rule builder and tree generation, and validate the full milestone with regression coverage.

---

## Phase Dependencies

```
Phase 1 runs in parallel with Phases 2–5
Phase 2 → Phase 3 → Phase 5
Phase 2 → Phase 4 → Phase 5
```

---

## Success Criteria

- [ ] All user-facing strings reference "ClaimCPU" instead of "Claims Rule Engine"
- [ ] Favicon, page titles, meta tags, and sidebar branding reflect the ClaimCPU identity
- [ ] Users can create a dataset by selecting columns from the dimension catalogue without uploading a CSV
- [ ] Schema-only datasets are persisted and behave identically to uploaded datasets in rule building and tree generation
- [ ] Companies can add custom dimensions scoped to their own data
- [ ] No regressions in existing dataset upload, rule builder, or tree visualization functionality
- [ ] Build passes and existing test suite remains green

---

## Requirement Assignment

| Phase | SRS Requirement |
|-------|----------------|
| Phase 1 | SRS-017 |
| Phase 2 | SRS-018 (catalogue foundation) |
| Phase 3 | SRS-018 (schema dataset creation) |
| Phase 4 | SRS-018 (custom dimensions) |
| Phase 5 | SRS-017 + SRS-018 (integration & validation) |
