# Phase 4 - Client Admin Features Plan

**Status**: Planning
**Milestone**: M3 - Accounts & Roles
**Task ID Prefix**: `M3-4`

---

## Goals

- Deliver a proper client-admin surface that replaces the existing `/company/users` scaffolding: a light `/company` overview page and a dedicated `/company/users` user-management page.
- Empower client_admin to manage users in their own company end-to-end: provision, edit details/role, deactivate/reactivate, and recover access (resend invite, reset access).
- Deliver a complete slot-request lifecycle from the client side: submit, track, and cancel pending requests.
- Tighten client_user enforcement: client_user cannot mutate trees, rule sets, or datasets, and cannot reach admin pages or the generate-tree route.
- Land outstanding pending revisions (`TreeForm.tsx` build error + M3.1 stabilization patches) in the gate so the phase ships with a clean build.
- Surface all client_admin actions in the existing `admin_activity_log` so they appear in `/admin/logs` for admin oversight.

---

## Dependencies

| Dependency | Status |
|------------|--------|
| Phase 1 - companies, user_profiles, admin_activity_log, slot_requests tables + base admin RPC/edge-function support | Complete |
| Phase 2 - role-aware auth context, RoleGuard, role-based route protection, role-aware navigation | In Review |
| Phase 3 - Admin Console (provides admin-side slot review, user mgmt RPCs, activity log surface) | Complete |
| Phase 5 - Operations & Tree Assignment (provides company-scoped operations + admin-only generate-tree) | Complete |
| Supabase edge function: `register-user` | Available (to be extended by Stream A) |
| Supabase RPCs: `get_admin_user_list`, `toggle_user_active_admin`, `approve_slot_request_admin`, `deny_slot_request_admin` | Available (to be relaxed/extended by Stream A) |
| Pending Revisions: TreeForm.tsx TS2345 fix, M3.1 stabilization patches | Open (rolled into Gate 4.0) |

---

## SRS Traceability

This phase implements the **client-admin slice of SRS-013** (Three-role access control):

> "Client Admin (company-scoped user management and data operations), and Client User (company-scoped data access only). Role-based route protection must prevent unauthorized page access."

| SRS-013 sub-requirement | Owning Stream |
|-------------------------|---------------|
| Client admin can manage users in their own company | Stream A (backend), Stream C (UI) |
| Client admin can request and track additional slots | Stream A (cancel RPC), Stream B (UI) |
| Client user is read-only (no admin pages, no tree/rule/dataset mutation) | Stream D |
| Cross-role audit visibility | Stream E |

---

## Backend & Architectural Decisions

These are global for the phase. Streams reference them rather than re-deciding.

1. **Backend approach for client_admin user-management: extend + share.** The existing `register-user` edge function and admin user-management RPCs are relaxed to accept a `client_admin` caller when the target is scoped to the caller's own active company. No parallel `register-company-user` function. Rationale: slot capacity, profile insert, audit log shape, and rollback are identical; duplication invites drift. The actual auth delta is a single conditional per guard.
2. **Audit logging: single `admin_activity_log` table.** Client_admin actions are written to the same table as admin actions, distinguished by actor role (already implicit via the `user_id` -> user_profiles.role join). They surface in `/admin/logs` automatically.
3. **No new client-side log view in Phase 4.** Client admin sees a "recent activity" panel on `/company` overview but no dedicated logs page yet (revisit in a future phase if requested).
4. **Page split:** `/company` is the light overview (counts, recent activity, pending slot status, submit/cancel slot request, quick links). `/company/users` is the user-management table. Slot UI lives **only** on `/company`, not on `/company/users`. This is intentional to keep stream file ownership clean.
5. **Slot request cancel:** client_admin can cancel a `pending` slot request. Cancelled requests are visible in history but unblock new submissions. Backed by a new `cancel_slot_request` RPC.
6. **Client-user write enforcement is layered:** UI-level (hide/disable controls via a shared `useWriteAccess` hook) + backend-level (existing RLS already prevents writes via company-scoped policies; Stream D adds explicit negative tests).

---

## Stream File Ownership (Parallelism Contract)

This matrix exists so parallel streams never touch the same file. Streams running concurrently are mutually exclusive on file ownership.

| File / Path                                                | Owner       |
|------------------------------------------------------------|-------------|
| `src/App.tsx`                                              | Gate 4.0    |
| `src/components/shared/Layout/Sidebar.tsx`                 | Gate 4.0    |
| `src/test/fixtures/clientAdmin.ts` (new)                   | Gate 4.0    |
| `src/test/utils/companyRoutes.tsx` (new)                   | Gate 4.0    |
| `supabase/functions/register-user/index.ts`                | Stream A    |
| `supabase/migrations/*_m3_4_a_*` (new)                     | Stream A    |
| `src/lib/db/client-operations.ts` (new)                    | Stream A    |
| `src/pages/company/index.tsx`                              | Stream B (replaces gate stub) |
| `src/pages/company/hooks/*` (new)                          | Stream B    |
| `src/pages/company/components/*` (new)                     | Stream B    |
| `src/pages/company/users/index.tsx` (replaced)             | Stream C    |
| `src/pages/company/users/hooks/*` (new)                    | Stream C    |
| `src/pages/company/users/components/*` (new)               | Stream C    |
| `src/hooks/useWriteAccess.ts` (new)                        | Stream D    |
| `src/pages/review-trees/*`, `src/pages/tree-visualizer/*`  | Stream D    |
| `src/pages/rule-manager/*`, `src/pages/rule-builder/*`     | Stream D    |
| `src/pages/datasets/*`                                     | Stream D    |
| `src/pages/<role>/__phaseE__/*.test.tsx` (new)             | Stream E    |

Stream A is consumed by B and C **only via** `src/lib/db/client-operations.ts`. Streams B, C, D never call edge functions or RPCs directly.

---

## Gate 4.0 - Stabilization, Pending Revisions & Test Harness

> Land the outstanding pending revisions so the phase starts with a clean build, audit the existing client-admin scaffolding, wire up shared test infrastructure, and add the `/company` route stub + nav entry so downstream streams can build into a stable shell.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-4.0.1 | Audit existing `/company/users` scaffolding against this phase plan; document gaps + planned replacements in a short audit note appended to this file's Tweaks/Notes section | 0.5 | None | Independent |
| M3-4.0.2 | Resolve pending revisions: fix `TreeForm.tsx:115` TS2345 error so `npm run build` passes, and close the M3.1 stabilization patches (auth regression, refresh loop, dialog fix) | 1.0 | None | Independent |
| M3-4.0.3 | Register `/company` route in `src/App.tsx` (RoleGuard `['client_admin']`, renders a placeholder `CompanyOverview` component), add `/company` to client_admin sidebar nav in `Sidebar.tsx`, and create the placeholder file at `src/pages/company/index.tsx` exporting a minimal "Overview - coming soon" component | 0.75 | None | Independent |
| M3-4.0.4 | Build shared client-route test harness: `src/test/fixtures/clientAdmin.ts` (profile fixtures for client_admin and client_user with valid + inactive + cross-company variants), `src/test/utils/companyRoutes.tsx` (router + AuthProvider wrapper for client routes, Supabase stub helpers for `slot_requests` and `admin_activity_log`) | 1.0 | M3-4.0.3 | Dependent |
| M3-4.0.5 | Baseline route-access tests: `/company` and `/company/users` allow client_admin only; admin and client_user are redirected to their role landing path; deactivated client_admin is signed out and shown the invalid-account message | 1.0 | M3-4.0.4 | Dependent |

### Gate Acceptance Criteria

- [ ] `npm run build` passes with zero TypeScript errors (TreeForm.tsx resolved).
- [ ] All M3.1 stabilization revisions listed in `project-progress.md` are either resolved or explicitly marked obsolete with reason.
- [ ] `/company` route exists, is protected, and renders the placeholder; client_admin sees the new nav entry; admin and client_user do not.
- [ ] Shared client-route test harness is documented and at least one test consumes it.
- [ ] Baseline route-access tests pass for all three roles on `/company` and `/company/users`.

### Junior-Dev Technical Notes - Gate

- **Placeholder component (M3-4.0.3)** should be a single default export that renders nothing more than a Card with the text "Company Overview - coming soon" and sets a breadcrumb. Stream B will replace its body but should keep the file path stable. Do **not** wire any data fetching here.
- **Sidebar update (M3-4.0.3)** edits the existing `companyNavItems` array in `Sidebar.tsx`. Add `/company` as the first entry, keep `/company/users` as the second. Use `Building2` and `Users` icons respectively (already imported).
- **Test fixtures (M3-4.0.4)** must export at minimum: `clientAdminProfile`, `clientAdminInactiveProfile`, `clientUserProfile`, `clientAdminCrossCompanyProfile`. Each fixture is a full `UserProfile` object matching `src/lib/auth/context.tsx`. Re-use existing admin fixtures from `src/test/fixtures/admin.ts` (or equivalent) for shape consistency.
- **Route-access tests (M3-4.0.5)** must use `MemoryRouter` with the path under test, mount via the new `companyRoutes` wrapper, and assert on `screen.findByText(/role landing/i)` redirects rather than asserting on URL changes (jsdom-friendly).

---

## Stream A - Backend & Data Layer Extensions

> Extend the backend so client_admin can call user-management actions and cancel slot requests, with company-scoped guards and shared audit. All client-facing access to these endpoints goes through `src/lib/db/client-operations.ts`. No frontend stream calls Supabase directly.
> SRS sub-requirements: client-admin user mgmt (backend), slot-request cancel (backend).

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-4.A.1 | Extend `supabase/functions/register-user/index.ts`: rename `assertAdminCaller` -> `assertRegisterUserAuthorized(authHeader, targetCompanyId, targetRole)`; admin allowed for any company + any non-admin role; client_admin allowed only when `caller.company_id === targetCompanyId`, `caller.is_active`, target role is `client_admin` or `client_user`, and target company is active. Preserve all existing slot checks and audit log emission unchanged | 1.0 | None | Independent |
| M3-4.A.2 | New migration `supabase/migrations/<ts>_m3_4_a_2_relax_user_mgmt_rpcs.sql`: relax `toggle_user_active_admin` and add `update_user_profile_admin(target_user_id, full_name, role)` (or extend if exists). Both functions check caller via `auth.uid() -> user_profiles`: allow when `caller.role = 'admin'`, OR (`caller.role = 'client_admin'` AND `caller.company_id = target.company_id`). Cross-company is rejected with explicit SQLSTATE 42501 (insufficient_privilege). All mutations write `admin_activity_log` rows | 1.5 | M3-4.A.1 | Dependent |
| M3-4.A.3 | New migration `supabase/migrations/<ts>_m3_4_a_3_cancel_slot_request_rpc.sql`: add RPC `cancel_slot_request(request_id uuid)`. Allowed when caller is the original `requested_by` OR caller is admin. Verifies status is `pending`; updates to `cancelled`; writes `admin_activity_log` entry with action `cancel_slot_request`. Rejects non-existent or already-resolved requests | 0.75 | M3-4.A.1 | Dependent |
| M3-4.A.4 | Build `src/lib/db/client-operations.ts` exporting typed wrappers consumed by Streams B and C: `registerCompanyUser`, `updateCompanyUser`, `setCompanyUserActive`, `resendCompanyUserInvite`, `resetCompanyUserAccess`, `cancelSlotRequest`. Each calls the corresponding edge function or RPC, normalizes Postgres errors to friendly messages, and returns a discriminated `{ ok: true, data } | { ok: false, error }` result | 1.0 | M3-4.A.2, M3-4.A.3 | Dependent |
| M3-4.A.5 | Tests for the backend surface: edge-function role branch (admin happy path, client_admin same-company happy path, client_admin cross-company rejected with 403, client_admin targeting role=admin rejected, slot-cap exceeded rejected); RPC tests for both `toggle/update` and `cancel_slot_request` covering admin + client_admin same-company + cross-company rejection + already-cancelled rejection; client-operations unit tests mocking Supabase response shapes | 1.5 | M3-4.A.4 | Dependent |

### Stream A Acceptance Criteria

- [ ] `register-user` edge function accepts client_admin scoped to its own company and rejects every cross-company / role-elevation attempt with a clear error.
- [ ] User-mgmt RPCs accept both admin and same-company client_admin; reject cross-company calls at the database layer (not just at the UI).
- [ ] `cancel_slot_request` RPC allows the original requester or any admin to cancel a pending request; rejects non-pending requests.
- [ ] `client-operations.ts` exposes a stable, typed contract used by every frontend stream in this phase.
- [ ] Backend tests cover every authorization branch and every audit-log emission point.

### Junior-Dev Technical Notes - Stream A

- **Edge function role check (M3-4.A.1):** the existing function already calls `getUserClient(authHeader).auth.getUser()` to identify the caller. After that, load the caller's profile via the service client (it already does this). Replace `if (!profile?.is_active || profile.role !== "admin")` with a function `assertRegisterUserAuthorized` that returns `void` or throws. Error messages must NOT leak whether the target company exists for unauthenticated callers; keep them generic ("Not authorized to register users").
- **Resend invite vs reset access:** "resend invite" means re-issuing the initial OTP / magic-link email (use `supabase.auth.admin.generateLink({ type: 'invite', ... })` or `inviteUserByEmail`). "Reset access" means flipping `is_active` to false then true again and forcing a fresh OTP - effectively a session-revoking re-invite. Both write an audit row with distinct `action` values (`resend_invite`, `reset_access`).
- **Migration naming (M3-4.A.2, A.3):** follow the existing convention `<yyyymmddhhmmss>_m3_4_a_<n>_<short_desc>.sql`. Inspect prior migrations in `supabase/migrations/` for header style.
- **RPC return shape:** existing admin RPCs return either a status row or void. Match whatever pattern is already in place for the function you are relaxing. Do not change the existing return shape - frontend code that already consumes them will break.
- **Audit log details JSON:** existing rows use a `details` JSONB column. Include the same minimum keys as `register_user` rows: `company_id`, `role` (where relevant), `email` (where relevant). For `cancel_slot_request`, include `request_id` and `requested_slots`. Refer to Phase 3 RPC migration `20260216110000_add_get_admin_user_list_function.sql` and `m3_1_2_admin_review_fixes.sql` for shape examples.
- **Cross-company test setup:** create two `companies` rows in test setup; create a client_admin user in company A; attempt every action against a user/request in company B. Every attempt must fail with insufficient_privilege.
- **No frontend wiring in Stream A.** `client-operations.ts` is a pure data-access module. It must not import React, hooks, or stores. It exports plain async functions returning the `{ ok, data | error }` discriminated result. Frontend streams will integrate it through their own hooks.

---

## Stream B - `/company` Overview Page

> Build the light overview surface for client_admin: company summary, slot status with submit + cancel actions, recent activity panel, quick links to user management.
> Depends on: Gate 4.0 (route stub, harness) and Stream A (`client-operations.ts`).

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-4.B.1 | Build `src/pages/company/hooks/useCompanyOverview.ts`: fetches via `Promise.all` the company row (name, max_user_slots, is_active), active user count from `user_profiles` scoped to caller's company, the latest pending slot request, and the 10 most-recent `admin_activity_log` rows scoped to the caller's company. Exposes `{ data, loading, error, refresh }`. Handles inactive-company state explicitly | 1.0 | Gate, M3-4.A.4 | Dependent |
| M3-4.B.2 | Replace the Gate placeholder body in `src/pages/company/index.tsx` with the real overview: three summary cards (Total Slots, Users, Available); a Slot Request card showing pending status and either a "Request More Slots" button (if none pending) or "Cancel Pending Request" button; a Recent Activity card listing the last 10 entries with action label, target, and timestamp; a Quick Links card with a button to `/company/users`. Sets breadcrumb to `[{ label: 'Company Overview', href: '/company' }]` | 1.5 | M3-4.B.1 | Dependent |
| M3-4.B.3 | Build `src/pages/company/components/RequestSlotsDialog.tsx`: form for additional slot count (min 1, max 50, integer), client-side validation, calls a thin wrapper hook that defers to `client-operations.cancelSlotRequest`/insert path. Block submit if pending request exists (defensive duplicate of backend check). Show success + auto-close on success, surface backend error on failure | 1.0 | M3-4.B.1 | Dependent |
| M3-4.B.4 | Build `src/pages/company/components/CancelSlotRequestDialog.tsx`: confirm dialog asking the user to confirm cancellation of `<N> slots`; calls `cancelSlotRequest`; refreshes overview on success | 0.5 | M3-4.B.1 | Dependent |
| M3-4.B.5 | Tests for overview: load + render with seeded data, empty-state for no pending request, pending-state with cancel action, submit slot request happy + failure paths, cancel slot request happy + failure paths, recent activity empty + populated states. Use `client-operations.ts` mocks from the Gate harness | 1.5 | M3-4.B.2, M3-4.B.3, M3-4.B.4 | Dependent |

### Stream B Acceptance Criteria

- [ ] `/company` shows a complete overview without errors for an active client_admin with at least one user in their company.
- [ ] Client_admin can submit a slot request from `/company` and see the page update without a manual reload.
- [ ] Client_admin can cancel a pending slot request from `/company` and see the badge clear immediately.
- [ ] Recent Activity panel reflects new audit rows after every mutation taken in either Stream B or Stream C.
- [ ] All paths covered by tests against the shared harness.

### Junior-Dev Technical Notes - Stream B

- **Promise.all error handling (M3-4.B.1):** if any of the four parallel reads fail, the overall hook should still return partial data with an `error` flag. Do not throw out of `useCompanyOverview`; return the discriminated error in `error` and render a per-card placeholder where data is missing.
- **Slot delta visualization:** "Available" card colour: green when > 0, red when <= 0. Match the existing pattern in the current `/company/users` scaffolding (see lines 260-275 of the file before replacement) so visual style stays consistent across the phase.
- **Recent Activity row format:** each row is `<action label> | <target type> | <relative timestamp>`. Action labels are human-readable (e.g., `register_user` -> "Registered user"). Build a small `actionLabels` map; do not stringify the raw action value.
- **Dialog reuse:** the existing `/company/users` scaffolding has a slot-request dialog. **Do not import it** - it is being deleted by Stream C. Build the dialog fresh in `src/pages/company/components/` using the same `Dialog` primitives.
- **Refresh after action:** after a successful submit or cancel, call the hook's `refresh()` rather than mutating local state. Refresh is the single source of truth and exercises the same code path the page uses on initial load.
- **No slot UI on `/company/users`.** This is a stream-boundary rule. If you find yourself adding slot fields to user-mgmt files, you have crossed into Stream C territory - stop and revisit the plan.

---

## Stream C - `/company/users` User Management

> Replace the existing scaffolded `/company/users` with a clean user-management page: list, register, edit, deactivate/reactivate, recover access. No slot UI here - that lives on `/company`.
> Depends on: Gate 4.0 (test harness) and Stream A (`client-operations.ts`).

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-4.C.1 | Build `src/pages/company/users/hooks/useCompanyUserMgmt.ts`: loads users via `getCompanyUsers(profile.company_id)`, exposes `{ users, filtered, search, setSearch, loading, error, refresh, pendingAction, setPendingAction }`. Centralises state so dialogs are stateless | 0.75 | Gate, M3-4.A.4 | Dependent |
| M3-4.C.2 | Replace `src/pages/company/users/index.tsx` with the new page: table of company users (name/email, role badge, status badge, last sign-in, added date, actions menu), search input, "Register User" button, empty/loading/error states. Uses `useCompanyUserMgmt`. **Remove all slot UI from this page** (it now lives on `/company`) | 1.0 | M3-4.C.1 | Dependent |
| M3-4.C.3 | Build `src/pages/company/users/components/RegisterCompanyUserDialog.tsx`: form for email + full_name + role (client_admin / client_user). Pre-fills `company_id` from caller's profile (not editable). Validates client-side, calls `registerCompanyUser`, shows slot-availability hint, blocks submit when at capacity, surfaces backend errors. Refreshes table on success | 1.25 | M3-4.C.1 | Dependent |
| M3-4.C.4 | Build `src/pages/company/users/components/EditCompanyUserDialog.tsx`: edit full_name + role (within client_admin / client_user). Disables editing the caller's own row (defensive - block escalation/demotion of self), disables editing rows where `role === 'admin'`. Calls `updateCompanyUser`, refreshes table on success | 1.0 | M3-4.C.1 | Dependent |
| M3-4.C.5 | Build `src/pages/company/users/components/UserStatusConfirmDialog.tsx`: shared confirm dialog used for deactivate and reactivate. Headline + button label change based on intent. Calls `setCompanyUserActive(targetUserId, nextValue)`, refreshes on success. Block deactivating the caller's own row | 0.5 | M3-4.C.1 | Dependent |
| M3-4.C.6 | Build `src/pages/company/users/components/UserRecoveryMenu.tsx`: dropdown trigger with Resend Invite and Reset Access entries. Each opens its own confirmation; calls `resendCompanyUserInvite` / `resetCompanyUserAccess`; shows transient success or error feedback in a toast or inline banner | 0.75 | M3-4.C.1 | Dependent |
| M3-4.C.7 | Tests for the user-mgmt surface: list + search, register happy path, register at slot capacity (button disabled, attempt-anyway blocked), edit happy path, edit self blocked, edit admin row blocked, deactivate/reactivate happy + self blocked, recovery actions happy + failure. Cross-company attempts via direct hook call must fail gracefully | 1.5 | M3-4.C.2, M3-4.C.3, M3-4.C.4, M3-4.C.5, M3-4.C.6 | Dependent |

### Stream C Acceptance Criteria

- [ ] `/company/users` lists every active and inactive user in the caller's company with searchable name/email/role.
- [ ] Client_admin can register, edit (full_name + role within client_admin/client_user), deactivate, reactivate, resend invite, and reset access on company users.
- [ ] Client_admin cannot mutate their own row, cannot mutate admins, and cannot escalate a user to admin.
- [ ] All actions refresh the table on success and surface backend errors on failure.
- [ ] Slot UI is **not** present on this page; submit/cancel slot flows live on `/company`.

### Junior-Dev Technical Notes - Stream C

- **Replace, do not patch.** The existing `src/pages/company/users/index.tsx` mixes slot UI and user listing. Start from a fresh file. Use the existing file as **read-only reference** for visual styling (badges, colours, table classes) but do not import from it.
- **Actions menu:** use the existing dropdown primitive if one exists in `src/components/ui/`; otherwise model the trigger after the admin user-row actions in `src/pages/admin/users/index.tsx`. Each menu item opens a single dialog at a time; co-ordinate visibility via `pendingAction` in `useCompanyUserMgmt`.
- **Self-edit guard:** compare `user.userId === profile.user_id` in dialog gating. The backend rejects the attempt anyway (Stream A), but the UI should never let the user reach the submit step.
- **Admin row defensive guard:** in practice no admin user will appear in `getCompanyUsers` because admins have `company_id = NULL`. The guard exists so a future schema change does not accidentally expose an escalation path. Render admin rows (if any leak through) with all actions disabled and a tooltip.
- **Slot capacity hint (M3-4.C.3):** read `max_user_slots` and active user count via the existing query the page already runs for the listing - do not introduce a second round-trip. Show "Slots: X / Y used" near the role selector. Disable submit when used >= max.
- **Toasts vs inline feedback:** the project does not yet have a toast system. Use the inline-feedback banner pattern seen in `RegisterUserDialog.tsx` (admin) until a toast primitive lands.

---

## Stream D - Client-User Write Restrictions

> Enforce that client_user is read-only across tree, rule, and dataset surfaces. UI controls are hidden or disabled via a shared hook; backend RLS already enforces denial as a defence in depth.
> Independent of Stream A (no backend changes). Independent of Streams B and C (different files).

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-4.D.1 | Build `src/hooks/useWriteAccess.ts`: returns `{ canWrite: boolean, role: UserRole \| null }`. `canWrite` is true when `role === 'admin'` or `role === 'client_admin'`, false for `client_user` and unauthenticated. This is the single source of truth for write gating | 0.5 | Gate | Dependent |
| M3-4.D.2 | Gate tree mutations in `src/pages/review-trees/*` and `src/pages/tree-visualizer/*`: hide or disable any control that creates, edits, deletes, publishes, or assigns trees. Use `useWriteAccess`; do not duplicate role checks. Read-only views (open, expand, inspect) remain available | 0.75 | M3-4.D.1 | Dependent |
| M3-4.D.3 | Gate rule mutations in `src/pages/rule-manager/*` and `src/pages/rule-builder/*`: hide create/edit/delete on rule sets and rule conditions; client_user can open a rule for read but cannot save. Disable the rule-builder save button with an explanatory tooltip | 0.75 | M3-4.D.1 | Dependent |
| M3-4.D.4 | Gate dataset mutations in `src/pages/datasets/*` and `src/pages/datasets/[id]/*`: hide upload, create-via-schema, and delete controls. Client_user can browse company datasets and open detail pages. Disable any column-edit/alignment-edit affordance | 0.75 | M3-4.D.1 | Dependent |
| M3-4.D.5 | Negative-access tests for each surface: render each page with the client_user fixture from Gate; assert mutation controls are absent or disabled; assert direct programmatic write attempts (where surfaced via hooks) return the backend-denied error without crashing the UI | 1.25 | M3-4.D.2, M3-4.D.3, M3-4.D.4 | Dependent |

### Stream D Acceptance Criteria

- [ ] `useWriteAccess` is used everywhere a mutation control exists; no scattered role string comparisons remain in tree/rule/dataset pages.
- [ ] Client_user sees no mutation controls on tree, rule, or dataset surfaces; admin and client_admin retain full access.
- [ ] Client_user cannot reach `/generate-tree` or `/admin*` (already enforced by RoleGuard; verified by the Gate 4.0 baseline tests).
- [ ] Defence-in-depth: if a client_user fixture somehow bypasses the UI and triggers a write call, the backend response is handled without a stack trace or broken UI state.
- [ ] Negative-access tests cover every gated surface.

### Junior-Dev Technical Notes - Stream D

- **Single-source-of-truth rule:** every place that currently checks `profile?.role === 'admin'` or similar inline should be replaced with `useWriteAccess().canWrite`. The hook lives in `src/hooks/useWriteAccess.ts` (not `src/lib/auth/`) so it can compose `useAuth` cleanly.
- **Hide vs disable:** for primary CTAs ("Upload Dataset", "Create Rule"), prefer **hide** for client_user - the absence reads cleaner than a disabled button. For inline row actions (edit / delete icons in a list), prefer **disable** with a tooltip ("Read-only access") so the row layout does not shift across roles.
- **Tooltip text:** use one consistent string project-wide: `"Read-only access for client users."` Junior dev: add this to a constant if the string appears more than three times.
- **Programmatic write attempts in tests:** Stream D does not own backend behaviour - the backend already denies these. The test asserts the UI handles a 403 / RLS-denied response without crashing. Mock the Supabase response in the test fixture; do not call the real database.
- **Discovery list:** before starting M3-4.D.2/3/4, grep each owning directory for the strings `onClick`, `<Button`, `useMutation`, `supabase.from(.*).insert`, `.update(`, `.delete()`. Build a punch list of every mutation site. Anything not in the list is at risk of being missed.

---

## Stream E - Phase Regression Coverage

> Phase-wide integration coverage across all three roles, audit-log visibility verification, and final lint/build green-up before phase completion.
> Depends on: Streams B, C, D outputs.

| Task ID | Task | Duration | Dependencies | Type |
|---------|------|----------|--------------|------|
| M3-4.E.1 | Cross-role integration scenario: admin invites a client_admin -> client_admin signs in -> registers a client_user -> submits a slot request -> cancels it -> deactivates the client_user -> reactivates it. Each step is one test in a single suite using the shared harness | 1.5 | M3-4.B.5, M3-4.C.7, M3-4.D.5 | Dependent |
| M3-4.E.2 | Audit-log visibility scenario: every mutation taken by client_admin in M3-4.E.1 produces a corresponding `admin_activity_log` row visible at `/admin/logs` with correct actor (client_admin), target, action label, and details metadata. Mounts both `/company*` (acting role) and `/admin/logs` (verifying role) in the same test | 1.25 | M3-4.E.1 | Dependent |
| M3-4.E.3 | Run the full phase-owned test suite, fix any failures, run lint on every file touched by this phase, confirm `npm run build` succeeds, and verify the M3 milestone success criteria are now all met or explicitly deferred | 1.0 | M3-4.E.1, M3-4.E.2 | Dependent |

### Stream E Acceptance Criteria

- [ ] End-to-end cross-role scenario completes without flakes against the shared test harness.
- [ ] Every client_admin mutation introduced in this phase appears in `/admin/logs` with the correct metadata.
- [ ] Lint clean for every file in the file-ownership matrix.
- [ ] `npm run build` passes phase-wide.
- [ ] M3 milestone success-criteria checklist is updated: client admin slot request flow end-to-end operational; full integration smoke across all three roles; build passing.

### Junior-Dev Technical Notes - Stream E

- **Test layout:** colocate the cross-role suite at `src/pages/company/__phaseE__/cross-role.test.tsx` so it sits with the surface under test but is clearly tagged as phase-level. The audit-log suite goes alongside at `cross-role-audit.test.tsx`.
- **Audit assertion shape:** assertions match on action name + actor user_id + target_id + details keys. Do **not** match on raw timestamp; match on "within the last 5 seconds" via a helper.
- **Lint scope:** use `npx eslint <changed files>` rather than `--all`. The pre-existing lint state outside this phase is not in scope.
- **Build verification:** `npm run build` is a hard gate. If it fails for a reason unrelated to Phase 4, that is a new revision, not a Phase 4 blocker - file it and continue, do not silently muddle around the failure.

---

## Parallelization Map

```text
Gate 4.0 - Stabilization & Test Harness ------------------------+
   (pending revisions + route stub + harness + access tests)    |
                                                                |
                          v                                     |
                Stream A - Backend Extensions                   |
            (edge fn + RPCs + client-operations.ts)             |
                          |                                     |
        +-----------------+-----------------+                   |
        |                 |                 |                   |
        v                 v                 v                   v
Stream B - /company   Stream C -        Stream D -       (Stream D can also
Overview              /company/users    Client-User      start right after Gate
+ Slot Lifecycle      User Management   Restrictions     since it does not need
                                                         Stream A)
        |                 |                 |
        +-----------------+-----------------+
                          |
                          v
              Stream E - Phase Regression Coverage
              (cross-role + audit visibility + green build)
                          |
                          v
                  Phase 4 complete
```

Note: Stream D is technically independent of Stream A and can begin immediately after Gate 4.0. It is drawn alongside B and C because that is when its parallel slot is most useful.

---

## Test Plan

> Generated from task analysis. Each testable task has one or more tests mapped to it. Tests are written before implementation (TDD) during task execution.

### Gate 4.0 Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| — | M3-4.0.1 | — | Not testable: scope-audit / planning artifact | — |
| T-M3-4.0.2.1 | M3-4.0.2 | Integration | `npm run build` succeeds end-to-end after the TreeForm.tsx fix | Build exits 0; no TS2345 at `TreeForm.tsx:115` |
| T-M3-4.0.2.2 | M3-4.0.2 | Integration | Each M3.1 stabilization patch (auth regression, refresh loop, dialog fix) has a verifying test in its owning file | The targeted regression no longer reproduces |
| T-M3-4.0.3.1 | M3-4.0.3 | Integration | `/company` route renders the placeholder for an active client_admin and redirects every other role | Client_admin sees placeholder; admin and client_user redirect to their landing path |
| T-M3-4.0.3.2 | M3-4.0.3 | Unit | Sidebar nav exposes `/company` only for client_admin | `companyNavItems` are filtered to client_admin; admin and client_user do not see the entry |
| — | M3-4.0.4 | — | Not testable: infrastructure consumed by downstream tests | — |
| T-M3-4.0.5.1 | M3-4.0.5 | Integration | `/company` access matrix: client_admin allowed, admin redirected, client_user redirected | Each role lands on the correct path |
| T-M3-4.0.5.2 | M3-4.0.5 | Integration | `/company/users` access matrix mirrors `/company` | Same redirect outcomes across roles |
| T-M3-4.0.5.3 | M3-4.0.5 | Integration | Deactivated client_admin is signed out and shown the invalid-account message | No `/company*` content renders; auth state is cleared |

### Stream A Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| T-M3-4.A.1.1 | M3-4.A.1 | Integration | Admin caller can register a user in any company via `register-user` | 200 with user_id, profile row created, audit row written |
| T-M3-4.A.1.2 | M3-4.A.1 | Integration | Client_admin caller can register a client_user in their own active company | 200 with user_id; profile + audit rows reflect actor as the client_admin |
| T-M3-4.A.1.3 | M3-4.A.1 | Integration | Client_admin caller targeting another company is rejected | 4xx with insufficient_privilege; no profile or audit row written |
| T-M3-4.A.1.4 | M3-4.A.1 | Integration | Client_admin attempting to register a role of `admin` is rejected | 4xx; no rows written |
| T-M3-4.A.1.5 | M3-4.A.1 | Integration | Slot-cap exceeded path still rejects for both admin and client_admin callers | 4xx with slot-cap error; no rows written |
| T-M3-4.A.2.1 | M3-4.A.2 | Integration | `toggle_user_active_admin` accepts admin and same-company client_admin | Status flips; audit row written |
| T-M3-4.A.2.2 | M3-4.A.2 | Integration | `toggle_user_active_admin` rejects cross-company client_admin at the DB layer | SQLSTATE 42501; no row mutated |
| T-M3-4.A.2.3 | M3-4.A.2 | Integration | `update_user_profile_admin` updates name/role for same-company client_admin | Profile row reflects change; audit row written |
| T-M3-4.A.2.4 | M3-4.A.2 | Integration | `update_user_profile_admin` rejects role escalation to `admin` | SQLSTATE 42501; profile unchanged |
| T-M3-4.A.3.1 | M3-4.A.3 | Integration | Original requester can cancel their pending slot request | Status flips to `cancelled`; audit row written |
| T-M3-4.A.3.2 | M3-4.A.3 | Integration | Admin can cancel any pending request | Same outcome as T-M3-4.A.3.1 |
| T-M3-4.A.3.3 | M3-4.A.3 | Integration | Cancelling an already-resolved request is rejected | Error returned; row unchanged |
| T-M3-4.A.3.4 | M3-4.A.3 | Integration | Unrelated client_admin (different company) is rejected | SQLSTATE 42501; row unchanged |
| T-M3-4.A.4.1 | M3-4.A.4 | Unit | Each `client-operations.ts` wrapper returns the `{ ok: true, data }` shape on success | Discriminated success branch holds the typed payload |
| T-M3-4.A.4.2 | M3-4.A.4 | Unit | Each wrapper normalizes Supabase / edge-function errors to `{ ok: false, error }` with a human-readable message | Error branch holds friendly message, no raw Postgres codes |
| — | M3-4.A.5 | — | Not testable: task output is the test coverage itself | — |

### Stream B Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| T-M3-4.B.1.1 | M3-4.B.1 | Unit | `useCompanyOverview` resolves the parallel reads and exposes loading -> ready transition | State moves through loading -> ready; all four data slices populated |
| T-M3-4.B.1.2 | M3-4.B.1 | Unit | Partial failure (one of four reads errors) surfaces `error` but does not throw | Successful slices remain populated; `error` is set; hook does not throw |
| T-M3-4.B.1.3 | M3-4.B.1 | Unit | Inactive company state is detected and surfaced | Hook reports an inactive-company flag; downstream UI can render the read-only banner |
| T-M3-4.B.2.1 | M3-4.B.2 | Integration | `/company` renders three summary cards (Total / Users / Available) with correct values | DOM contains the seeded counts; Available colour reflects positive vs zero |
| T-M3-4.B.2.2 | M3-4.B.2 | Integration | Recent Activity card lists at most 10 entries in reverse-chronological order | Rows ordered by created_at desc; empty state when none |
| T-M3-4.B.2.3 | M3-4.B.2 | Integration | Quick Links button navigates to `/company/users` | Navigation occurs; target page mounts |
| T-M3-4.B.3.1 | M3-4.B.3 | Integration | Submit slot request happy path: form validates, calls operation, refreshes overview | New pending request appears in the slot card |
| T-M3-4.B.3.2 | M3-4.B.3 | Integration | Submit blocked when a pending request already exists | Submit disabled; inline message surfaces |
| T-M3-4.B.3.3 | M3-4.B.3 | Integration | Backend failure surfaces error message, dialog stays open | Error displayed inline; pending state cleared |
| T-M3-4.B.4.1 | M3-4.B.4 | Integration | Cancel confirm calls `cancelSlotRequest` and refreshes overview | Pending request cleared; success feedback shown |
| T-M3-4.B.4.2 | M3-4.B.4 | Integration | Cancel failure (race with admin approve) surfaces error and keeps dialog open | Error displayed; row left as admin updated it |
| — | M3-4.B.5 | — | Not testable: task output is the test coverage itself | — |

### Stream C Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| T-M3-4.C.1.1 | M3-4.C.1 | Unit | `useCompanyUserMgmt` filters users by search across name, email, and role | Filtered set matches expected rows for each query |
| T-M3-4.C.1.2 | M3-4.C.1 | Unit | `pendingAction` mediates single-dialog-at-a-time behaviour | Setting one action clears any previous pending action |
| T-M3-4.C.2.1 | M3-4.C.2 | Integration | Page renders user table with role, status, last sign-in, added date, actions menu | Columns populated for seeded users; empty state when none |
| T-M3-4.C.2.2 | M3-4.C.2 | Integration | Page has no slot UI elements (regression guard for stream-boundary) | No "Request More Slots" or slot-status DOM exists on `/company/users` |
| T-M3-4.C.3.1 | M3-4.C.3 | Integration | Register happy path inserts user and refreshes table | New row appears with seeded values |
| T-M3-4.C.3.2 | M3-4.C.3 | Integration | Register at slot capacity disables submit and surfaces hint | Submit button disabled; capacity hint visible |
| T-M3-4.C.3.3 | M3-4.C.3 | Integration | Register backend failure surfaces error inline | Error banner shown; dialog stays open |
| T-M3-4.C.4.1 | M3-4.C.4 | Integration | Edit happy path persists full_name and role and refreshes table | Row reflects new values |
| T-M3-4.C.4.2 | M3-4.C.4 | Integration | Editing the caller's own row is blocked | Edit action disabled; dialog cannot be opened |
| T-M3-4.C.4.3 | M3-4.C.4 | Integration | Role selector excludes `admin` for client_admin caller | Only client_admin and client_user appear in the dropdown |
| T-M3-4.C.5.1 | M3-4.C.5 | Integration | Deactivate and reactivate round-trip refreshes table state | Status badge reflects each transition |
| T-M3-4.C.5.2 | M3-4.C.5 | Integration | Deactivating own row is blocked | Action disabled; backend not called |
| T-M3-4.C.6.1 | M3-4.C.6 | Integration | Resend Invite calls `resendCompanyUserInvite` and shows success feedback | Success message shown; no row mutation |
| T-M3-4.C.6.2 | M3-4.C.6 | Integration | Reset Access calls `resetCompanyUserAccess` and shows success feedback | Success message shown; `is_active` round-trips per backend semantics |
| T-M3-4.C.6.3 | M3-4.C.6 | Integration | Recovery failures (backend unavailable, inactive target) surface error without crashing | Error feedback shown; UI remains interactive |
| — | M3-4.C.7 | — | Not testable: task output is the test coverage itself | — |

### Stream D Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| T-M3-4.D.1.1 | M3-4.D.1 | Unit | `useWriteAccess` returns `canWrite: true` for admin and client_admin | `canWrite` is true; `role` matches input |
| T-M3-4.D.1.2 | M3-4.D.1 | Unit | `useWriteAccess` returns `canWrite: false` for client_user and unauthenticated | `canWrite` is false in both cases |
| T-M3-4.D.2.1 | M3-4.D.2 | Integration | Review-trees and tree-visualizer hide/disable edit, delete, publish controls for client_user | No mutation control reachable; read-only controls remain |
| T-M3-4.D.2.2 | M3-4.D.2 | Integration | Same surfaces show full controls for admin and client_admin | All mutation controls present and enabled |
| T-M3-4.D.3.1 | M3-4.D.3 | Integration | Rule-manager and rule-builder block create/edit/delete for client_user; save button disabled with tooltip | No mutation reachable; tooltip text matches the standard string |
| T-M3-4.D.3.2 | M3-4.D.3 | Integration | Same surfaces remain fully writable for admin and client_admin | All controls present and enabled |
| T-M3-4.D.4.1 | M3-4.D.4 | Integration | Datasets list and detail hide upload / create-via-schema / delete for client_user | Mutation entry points absent; browsing remains |
| T-M3-4.D.4.2 | M3-4.D.4 | Integration | Column-edit / alignment-edit affordances are disabled for client_user | Controls disabled with the standard tooltip |
| T-M3-4.D.5.1 | M3-4.D.5 | Integration | Programmatic write attempt by client_user against any gated surface surfaces backend error without crashing | UI handles 403 / RLS-denied response; no stack trace; user-friendly message |
| — | M3-4.D.5 | — | Other M3-4.D.5 outputs not directly testable beyond the row above (the task is itself the test coverage for D.2-D.4) | — |

### Stream E Tests

| Test ID | Task | Type | Description | Expected Result |
|---------|------|------|-------------|-----------------|
| T-M3-4.E.1 | M3-4.E.1 | End-to-End | Cross-role scenario: admin invites client_admin -> client_admin registers a client_user -> submits slot request -> cancels it -> deactivates user -> reactivates user | Every step succeeds; UI state matches at each transition |
| T-M3-4.E.2 | M3-4.E.2 | End-to-End | Every client_admin mutation from T-M3-4.E.1 surfaces in `/admin/logs` with correct actor, target, action, and details metadata | Audit rows present; row count matches; metadata keys match the documented shape |
| — | M3-4.E.3 | — | Not testable: verification / run-and-fix task | — |

### Test Summary

| Component | Total Tasks | Testable | Not Testable |
|-----------|-------------|----------|--------------|
| Gate 4.0  | 5  | 3  | 2 |
| Stream A  | 5  | 4  | 1 |
| Stream B  | 5  | 4  | 1 |
| Stream C  | 7  | 6  | 1 |
| Stream D  | 5  | 4  | 1 |
| Stream E  | 3  | 2  | 1 |
| **Total** | **30** | **23** | **7** |

---

## Definition of Done

- [ ] Gate acceptance criteria pass.
- [ ] All stream acceptance criteria pass.
- [ ] All tests in the Test Plan pass.
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] Lint clean on every file in the ownership matrix.
- [ ] Pending revisions listed in `project-progress.md` (TreeForm.tsx, M3.1 stabilization) are resolved.
- [ ] Client_admin can use `/company` and `/company/users` end-to-end for the full action set (register / edit / deactivate / reactivate / resend / reset / submit slot / cancel slot).
- [ ] Client_user cannot mutate trees, rules, or datasets and cannot reach `/admin*` or `/generate-tree`.
- [ ] Every client_admin mutation appears in `/admin/logs` with the correct actor, target, and metadata.
- [ ] M3 milestone success-criteria checklist updated to reflect Phase 4 completion.

---

## Test Scenarios

### Happy Path

- [ ] Admin invites a new client_admin -> client_admin receives invite, signs in via OTP -> lands on `/company` overview.
- [ ] Client_admin registers a client_user from `/company/users` -> user appears in the table -> action shows in `/admin/logs`.
- [ ] Client_admin submits a slot request from `/company` -> admin sees pending request -> client_admin cancels it before admin acts -> cancellation logged.
- [ ] Client_admin edits a user's role from client_user to client_admin -> change persists -> reflected in `/admin/logs`.
- [ ] Client_admin deactivates then reactivates a user -> table state and audit log both reflect the round-trip.

### Edge Cases

- [ ] Client_admin attempts to register an 11th user when company has 10 slots and 10 active users -> dialog blocks submit; backend would also reject.
- [ ] Client_admin attempts to edit a user in another company by manipulating IDs in dev tools -> backend RPC returns 403, UI surfaces the error cleanly.
- [ ] Client_admin attempts to escalate a client_user to admin -> dialog does not offer admin as an option; direct backend call rejected.
- [ ] Client_admin attempts to edit or deactivate their own row -> action menu disabled with tooltip.
- [ ] Client_admin submits a slot request while one is already pending -> dialog blocks; if bypassed, backend rejects.
- [ ] Client_admin cancels an already-resolved slot request (race with admin approval) -> backend rejects with explanatory error.
- [ ] Client_user signs in -> tree/rule/dataset mutation controls are absent or disabled; `/admin*` and `/generate-tree` redirect to role landing.
- [ ] Deactivated client_admin attempts to access `/company*` -> signed out, shown invalid-account message.
- [ ] Inactive company -> client_admin signed in for that company cannot submit new slot requests or invite users; existing data is read-only.

---

## Tweaks

> Corrections to completed tasks within this phase are tracked here.
> Each tweak has an ID (e.g. `M3-4.TW1`), lists affected tasks, and
> includes test impact. See `docs/core/tweak-planning.md` for the full
> tweak workflow.

_None._

---

### M3-4.AUDIT.1 - Existing /company/users Scaffolding Audit

**Audited file:** `src/pages/company/users/index.tsx` (19,737 bytes)

**What EXISTS vs. Stream C Requirements:**

| Requirement | Status | Notes |
|-------------|--------|-------|
| User listing with table | ✅ EXISTS | Full table with name, email, role, status, added date columns |
| User search | ✅ EXISTS | Search input filters by name, email, role |
| Role badges | ✅ EXISTS | Role badge styling with client_admin/client_user differentiation |
| Status badges | ✅ EXISTS | Active/Inactive status with color coding |
| Slot request UI | ⚠️ EXISTS but mis-located | Slot UI is on `/company/users` - should be moved to `/company` per Decision #4 |
| Slot request display | ✅ EXISTS | Shows pending/approved/denied requests in a card |
| Request slots dialog | ✅ EXISTS | Dialog for requesting additional slots |
| User count summary | ✅ EXISTS | Shows total users count |

**What's MISSING vs. Stream C Requirements:**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Register User dialog | ❌ MISSING | No "Register User" button or dialog present |
| Edit user dialog | ❌ MISSING | Actions menu exists but only shows slot UI |
| Deactivate/Reactivate | ❌ MISSING | No user status toggle actions |
| Resend invite | ❌ MISSING | No recovery actions for users |
| Reset access | ❌ MISSING | No access recovery for users |
| useCompanyUserMgmt hook | ❌ MISSING | All state is inline in component |
| useWriteAccess integration | ❌ MISSING | No role-based write gating |

**File Ownership Conflicts:**
- Current file mixes slot UI (which belongs on `/company` per Stream B) with user listing
- Stream C owns `src/pages/company/users/index.tsx` - complete replacement required
- Stream B owns `/company` slot lifecycle - current slot UI must be removed from users page
- No conflict with Stream A (backend) - uses different files

**Recommended Actions:**
1. REPLACE the current `src/pages/company/users/index.tsx` entirely (Stream C)
2. REMOVE slot request UI from `/company/users` - it belongs on `/company` (Stream B)
3. BUILD new components per Stream C task list: RegisterCompanyUserDialog, EditCompanyUserDialog, UserStatusConfirmDialog, UserRecoveryMenu
4. BUILD useCompanyUserMgmt hook to centralize state

**Cross-stream Dependencies:**
- Stream C depends on Stream A's `client-operations.ts` for all user management actions
- Stream C must NOT import from admin/users components - those are separate ownership
- Current file imports from `@/lib/db/admin-operations` - should use new `client-operations.ts`
