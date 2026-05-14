# Phase 3 - Admin Console Plan

**Status**: Planning
**Milestone**: M3 - Accounts & Roles
**Task ID Prefix**: `M3-3`

---

## Goals

- Deliver an admin-only console with a light overview dashboard, pending slot request review, and quick access to company and user management.
- Enable admins to create, edit, deactivate, and reactivate companies, and to provision and maintain users across companies.
- Add automated coverage for the admin console surfaces already built in this phase so completed and in-review work is protected by tests before phase completion.

---

## Dependencies

| Dependency | Status |
|------------|--------|
| Phase 1 - companies, user_profiles, admin_activity_log, slot_requests, and base admin RPC/edge-function support | Complete |
| Phase 2 - role-aware auth context, RoleGuard, admin route protection, and role-aware navigation | In Progress |
| Supabase edge functions: `register-user`, `deactivate-company` | Available |
| Supabase RPCs: `get_admin_user_list`, `toggle_user_active_admin`, `approve_slot_request_admin`, `deny_slot_request_admin` | Available |
| Admin UI test harness for Supabase-driven routes and dialogs | Not Available |

---

## Gate 3.0 - Admin Baseline & Test Harness

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-3.0.1 | Audit the current admin console against SRS-016 and the approved phase boundary, noting which dashboard, company, user, slot-review, and audit-log behaviors are complete, partial, or missing | 0.5 | None | Independent |
| M3-3.0.2 | Create shared test utilities for admin routes, auth/profile mocking, router wrappers, Supabase query/RPC/function stubs, and reusable admin fixtures | 1.0 | M3-3.0.1 | Dependent |
| M3-3.0.3 | Add baseline route-access smoke tests for `/admin`, `/admin/companies`, `/admin/users`, and `/admin/logs`, including unauthorized and deactivated-account redirects | 1.0 | M3-3.0.2 | Dependent |

### Gate Acceptance Criteria

- [ ] The current admin console scope is explicitly mapped to Phase 3 streams rather than left as implicit codebase knowledge.
- [ ] Shared test scaffolding exists for admin pages, hooks, dialogs, and `admin-operations` data calls.
- [ ] Automated smoke coverage exists for admin-only routing and invalid-account handling.

---

## Stream A - Dashboard & Slot Review

> Deliver the light admin landing page defined for this phase: counts, recent activity, pending slot requests, quick actions, and refresh/error handling.
> Owns the admin-side slot request review slice of SRS-016. Client-side submission and tracking remain in Phase 4.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-3.A.1 | Stabilize the dashboard data contract across `useAdminDashboard`, dashboard widgets, and pending request summaries so loading, empty, and retry states are consistent | 1.0 | Gate | Dependent |
| M3-3.A.2 | Complete approve/deny slot request actions with visible processing state, refresh semantics, and failure feedback on the dashboard surface | 1.0 | M3-3.A.1 | Dependent |
| M3-3.A.3 | Add automated tests for dashboard counts, recent activity rendering, pending request actions, retry behavior, and post-action refresh outcomes | 1.5 | M3-3.A.1, M3-3.A.2 | Dependent |

### Stream A Acceptance Criteria

- [ ] `/admin` shows a light overview only: counts, recent activity, pending slot requests, and quick links/actions.
- [ ] Admins can approve or deny pending slot requests from the dashboard and see the UI refresh correctly afterward.
- [ ] Dashboard and slot-review behaviors are covered by automated tests.

---

## Stream B - Company Lifecycle Management

> Deliver company creation and maintenance workflows on `/admin/companies`, including edit and activation lifecycle operations.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-3.B.1 | Stabilize company listing, search, create dialog flow, and admin feedback states on `/admin/companies` | 1.0 | Gate | Dependent |
| M3-3.B.2 | Add company edit capability for name, country, insurance type, and slot capacity, including validation and persistence through the admin data layer | 1.5 | M3-3.B.1 | Dependent |
| M3-3.B.3 | Complete deactivate/reactivate company handling, including refreshed list state, clear admin feedback, and explicit treatment of session-revoking deactivation semantics | 1.0 | M3-3.B.1 | Dependent |
| M3-3.B.4 | Add tests for company search, creation, edit validation, deactivate/reactivate actions, and audit-log side effects expected from company mutations | 1.5 | M3-3.B.1, M3-3.B.2, M3-3.B.3 | Dependent |

### Stream B Acceptance Criteria

- [ ] Admins can create, edit, deactivate, and reactivate companies from `/admin/companies`.
- [ ] Company mutations preserve slot-capacity rules and refresh the page state without stale rows or stuck dialogs.
- [ ] Company management flows are covered by automated tests, including failure paths.

---

## Stream C - User Provisioning & Recovery

> Deliver admin user maintenance on `/admin/users`, including provisioning, edits, status changes, and recovery actions beyond initial registration.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-3.C.1 | Stabilize user listing, search, company lookup, and registration flow, including slot-capacity enforcement and admin-only restrictions | 1.0 | Gate | Dependent |
| M3-3.C.2 | Add admin edit capability for user details, role reassignment, company reassignment, and active-status changes | 1.5 | M3-3.C.1 | Dependent |
| M3-3.C.3 | Add user recovery/maintenance actions such as resend invite and reset access, extending the admin backend surface where current RPC/edge-function coverage is insufficient | 1.5 | M3-3.C.1 | Dependent |
| M3-3.C.4 | Add tests for registration, validation errors, role/company edits, deactivate/reactivate, and recovery action success/error flows | 1.5 | M3-3.C.1, M3-3.C.2, M3-3.C.3 | Dependent |

### Stream C Acceptance Criteria

- [ ] Admins can register and maintain company users from `/admin/users` without bypassing slot or role constraints.
- [ ] Edit and recovery actions exist for users, not just first-time registration and on/off activation.
- [ ] User provisioning and recovery flows are covered by automated tests.

---

## Stream D - Audit Log & Export

> Deliver a filterable audit trail that stays usable as company, user, and slot-review actions expand.
> **Depends on:** Stream A, Stream B, and Stream C for complete action coverage.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-3.D.1 | Stabilize audit-log loading, debounced search, action filters, empty states, and pagination behavior on `/admin/logs` | 1.0 | Gate | Dependent |
| M3-3.D.2 | Complete detail expansion and CSV export behavior so logs remain inspectable and exportable for the full admin action set | 0.75 | M3-3.D.1 | Dependent |
| M3-3.D.3 | Verify that actions introduced or stabilized in Streams A-C produce filterable audit records with usable metadata and labels | 1.0 | M3-3.A.2, M3-3.B.2, M3-3.B.3, M3-3.C.2, M3-3.C.3 | Dependent |
| M3-3.D.4 | Add tests for log filters, pagination, detail expansion, CSV export formatting, and cross-stream audit visibility | 1.25 | M3-3.D.1, M3-3.D.2, M3-3.D.3 | Dependent |

### Stream D Acceptance Criteria

- [ ] `/admin/logs` supports search, action filtering, pagination, detail inspection, and CSV export.
- [ ] Company, user, and slot-review admin actions appear in the audit log with enough detail to investigate what changed.
- [ ] Audit-log UI and cross-stream visibility are covered by automated tests.

---

## Stream E - Phase Regression Coverage

> Add phase-wide automated coverage for already-built admin surfaces so Phase 3 is test-backed before completion.
> **Depends on:** Stream A, Stream B, Stream C, and Stream D outputs.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-3.E.1 | Add integration coverage for admin navigation between dashboard, companies, users, and logs, including breadcrumb and quick-action transitions | 1.0 | M3-3.A.3, M3-3.B.4, M3-3.C.4, M3-3.D.4 | Dependent |
| M3-3.E.2 | Add regression scenarios for deactivated accounts, unauthorized roles, slot-review refreshes, and admin dialog lifecycle issues already seen during review | 1.0 | M3-3.A.3, M3-3.B.4, M3-3.C.4, M3-3.D.4 | Dependent |
| M3-3.E.3 | Run and fix the phase-owned test suite and touched-file lint/build issues surfaced by the new coverage before handing the phase to test planning/completion | 0.75 | M3-3.E.1, M3-3.E.2 | Dependent |

### Stream E Acceptance Criteria

- [ ] The admin console's previously completed or in-review surfaces now have automated regression coverage.
- [ ] Known review-state regressions for admin flows are captured by tests rather than only manual verification.
- [ ] Phase-owned verification passes for the admin console surface area before phase completion work begins.

---

## Parallelization Map

```text
Gate 3.0 - Admin Baseline & Test Harness ------------------------------+
                                                                      |
        +--------------------+--------------------+-------------------+-------------------+
        |                    |                    |                   |                   |
        v                    v                    v                   v                   |
Stream A - Dashboard   Stream B - Company   Stream C - User    Stream D.1-D.2 -   -------+
& Slot Review          Lifecycle Mgmt       Provisioning       Audit Log Shell
                                             & Recovery
        |                    |                    |                   |
        +--------------------+--------------------+-------------------+
                                     |
                                     v
                          Stream D.3-D.4 - Cross-stream
                          Audit Verification & Tests
                                     |
                                     v
                         Stream E - Phase Regression Coverage
                                     |
                                     v
                             Phase 3 complete
```

---

## Test Plan

> Generated from task analysis. Each testable task has one or more tests mapped to it. Tests are written before implementation (TDD) during task execution.

### Gate 3.0 Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| — | M3-3.0.1 | — | Not testable: scope-audit/planning artifact | — |
| — | M3-3.0.2 | — | Not testable: shared test harness is exercised by downstream tests | — |
| T-M3-3.0.3 | M3-3.0.3 | Integration | Verify admin routes allow admins and redirect unauthorized/deactivated users correctly | `/admin*` routes are gated correctly and invalid accounts do not render admin UI |

### Stream A Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| T-M3-3.A.1 | M3-3.A.1 | Integration | Verify dashboard loads counts, recent activity, pending requests, and handles loading, error, and retry states | Dashboard state transitions are consistent and recoverable |
| T-M3-3.A.2 | M3-3.A.2 | Integration | Verify approve/deny actions show processing state, call the correct backend path, and refresh the dashboard | Slot review actions succeed or fail with visible feedback and refreshed state |
| — | M3-3.A.3 | — | Not testable: task output is the test coverage itself | — |

### Stream B Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| T-M3-3.B.1 | M3-3.B.1 | Integration | Verify company page loads, search filters rows, and create dialog success refreshes the list | Company listing, search, and create flow work without stale state |
| T-M3-3.B.2 | M3-3.B.2 | Integration | Verify company edit form loads current values, validates input, persists updates, and reflects slot-capacity changes | Company edits save correctly and invalid input is blocked |
| T-M3-3.B.3 | M3-3.B.3 | Integration | Verify deactivate/reactivate actions call the correct backend path and update row status and feedback | Company lifecycle actions complete with correct UI state |
| — | M3-3.B.4 | — | Not testable: task output is the test coverage itself | — |

### Stream C Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| T-M3-3.C.1 | M3-3.C.1 | Integration | Verify user list, search, and register flow, including active-company selection and slot-capacity or edge-function failure handling | Registration flow enforces constraints and surfaces failures cleanly |
| T-M3-3.C.2 | M3-3.C.2 | Integration | Verify user edit, role/company reassignment, and active-status changes refresh the table correctly | User maintenance actions persist and render correctly |
| T-M3-3.C.3 | M3-3.C.3 | Integration | Verify resend-invite/reset-access actions call the backend, show success/failure feedback, and fail safely for invalid targets | Recovery actions work or degrade safely with clear feedback |
| — | M3-3.C.4 | — | Not testable: task output is the test coverage itself | — |

### Stream D Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| T-M3-3.D.1 | M3-3.D.1 | Integration | Verify debounced search, action filters, pagination, and empty states on `/admin/logs` | Log queries and UI states behave correctly |
| T-M3-3.D.2 | M3-3.D.2 | Integration | Verify detail expansion and CSV export formatting for visible audit entries | Log details expand correctly and export output is well-formed |
| T-M3-3.D.3 | M3-3.D.3 | Integration | Verify company, user, and slot-review actions appear as filterable audit records with usable metadata | Cross-stream admin actions are visible in logs |
| — | M3-3.D.4 | — | Not testable: task output is the test coverage itself | — |

### Stream E Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| — | M3-3.E.1 | — | Not testable: integration-coverage task | — |
| — | M3-3.E.2 | — | Not testable: regression-coverage task | — |
| — | M3-3.E.3 | — | Not testable: verification/run-fix task | — |

### Test Summary

| Component | Total Tasks | Testable | Not Testable |
|-----------|-------------|----------|--------------|
| Gate 3.0 | 3 | 1 | 2 |
| Stream A | 3 | 2 | 1 |
| Stream B | 4 | 3 | 1 |
| Stream C | 4 | 3 | 1 |
| Stream D | 4 | 3 | 1 |
| Stream E | 3 | 0 | 3 |
| **Total** | **21** | **12** | **9** |

---

## Definition of Done

- [ ] Gate acceptance criteria pass.
- [ ] All stream acceptance criteria pass.
- [ ] All tests in the Test Plan pass.
- [ ] Admin dashboard, companies, users, and logs routes are covered by automated tests.
- [ ] Company edit, user edit, and user recovery actions are implemented and tested.
- [ ] Slot request review is fully functional on the admin side, with audit visibility.
- [ ] No lint errors remain in files touched by this phase.
- [ ] No admin-console regressions found during smoke testing remain untracked.

---

## Test Scenarios

### Happy Path

- [ ] Admin signs in, lands on `/admin`, sees counts/recent activity/pending requests, and approves a slot request successfully.
- [ ] Admin creates a company, edits its details, deactivates it, then reactivates it and sees the list refresh correctly.
- [ ] Admin registers a user, edits role/company assignment, performs a recovery action, and confirms the user appears correctly in logs.
- [ ] Admin filters activity logs to company, user, and slot-review actions and exports the result set as CSV.

### Edge Cases

- [ ] Client admin or client user attempts to access `/admin*` routes and is redirected to the correct role landing page.
- [ ] Deactivated or unprovisioned accounts are signed out and shown the invalid-account message instead of rendering admin content.
- [ ] Company/user dialogs reject invalid or incomplete input without getting stuck open or silently failing.
- [ ] Slot request review failures, RPC/edge-function failures, and empty dashboard/log states surface actionable feedback.
- [ ] User recovery actions fail safely when the backend surface is unavailable or the target account is inactive.

---

## Tweaks

> Corrections to completed tasks within this phase are tracked here.
> Each tweak has an ID (e.g. `M3-3.TW1`), lists affected tasks, and
> includes test impact. See `docs/core/tweak-planning.md` for the full
> tweak workflow.

_None._

---
