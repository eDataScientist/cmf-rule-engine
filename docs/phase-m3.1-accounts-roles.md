# Phase M3.1 — Accounts & Roles Plan

## Goals

- Introduce the **company entity** as the primary data ownership unit across the platform
- Implement **three-role RBAC** (Admin, Client Admin, Client User)
- Switch authentication to **OTP-only for new users** while retaining password login for existing admin
- Build the **Admin Console** for provisioning companies and users
- Rewrite **RLS policies** and **storage paths** from user-scoped to company-scoped
- Update the **Generate Tree** page with a company selector (admin-only)

## Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| Supabase Auth configured | Existing | ✅ Email/password working |
| `trees` table with `user_id` | Existing | ✅ Must gain `company_id` |
| `datasets` table with `user_id` | Existing | ✅ Must gain `company_id` |
| `rule_sets` table with `user_id` | Existing | ✅ Must gain `company_id` |
| `ProtectedRoute` component | Existing | ✅ Must be replaced by `RoleGuard` |
| `AuthProvider` context | Existing | ✅ Must be extended |
| Storage path helpers | Existing | ✅ Must be restructured |

---

## Gate M3.1.0 — Database & Auth Foundation ◆

All schema migrations, RLS rewrites, and auth changes. **Blocks all streams.** Must complete before any frontend work begins.

| Task ID | Task Name | Duration | Dependencies | Notes |
|---------|-----------|----------|--------------|-------|
| M3.1.0.1 | Create `companies` table | 0.5 | — | UUID PK, name, country, insurance_type, max_user_slots, is_active, timestamps, created_by FK |
| M3.1.0.2 | Create `user_profiles` table | 0.75 | M3.1.0.1 | FK to auth.users + companies, role enum check, is_active, invited_by FK. Seed mali@edata.ae as admin with company_id = NULL |
| M3.1.0.3 | Create `admin_activity_log` table | 0.5 | — | Append-only audit log. user_id, action, target_type, target_id, details JSONB, ip_address, timestamp. Index on (action, created_at) |
| M3.1.0.4 | Create `slot_requests` table | 0.5 | M3.1.0.1 | company_id FK, requested_by FK, requested_slots, status (pending/approved/denied), reviewed_by, timestamps |
| M3.1.0.5 ★ | Add `company_id` to existing tables | 1.0 | M3.1.0.1 | Add nullable company_id FK to: trees, datasets, rule_sets, dataset_tree_associations, upload_status. Add indexes. |
| M3.1.0.6 ★ | Backfill & constrain `company_id` | 0.5 | M3.1.0.5 | Wipe existing data (confirmed OK). Make company_id NOT NULL on all tables. |
| M3.1.0.7 ★ | Rewrite RLS policies | 1.5 | M3.1.0.2, M3.1.0.6 | Create `get_user_company_id()` and `is_admin()` helper functions. Drop all user_id-based policies. Write company-based SELECT/INSERT/UPDATE/DELETE policies for every table. |
| M3.1.0.8 | Update `rule_sets` unique constraint | 0.5 | M3.1.0.6 | Drop `(dataset_id, user_id)` unique. Add `(dataset_id, company_id)` unique. |
| M3.1.0.9 | Restructure storage path convention | 0.5 | M3.1.0.1 | Update `generateStoragePath()` in both client (`src/lib/storage/helpers.ts`) and Edge Functions (`_shared/storage.ts`) to use `{company_id}/{dataset_id}/` pattern. |
| M3.1.0.10 | Create `register-user` Edge Function | 1.0 | M3.1.0.2 | Accepts email, full_name, company_id, role. Validates caller is admin, company has slots. Uses `supabase.auth.admin.createUser()`. Creates user_profiles record. Logs to admin_activity_log. |
| M3.1.0.11 | Create `deactivate-company` Edge Function | 0.75 | M3.1.0.2 | Sets is_active=false on company + all its users. Revokes sessions via `auth.admin.signOut()`. Logs to admin_activity_log. |
| M3.1.0.12 | Update `process-dataset-upload` Edge Function | 0.5 | M3.1.0.7, M3.1.0.9 | Resolve company_id from JWT/user_profiles. Include in dataset record. Use new storage paths. |
| M3.1.0.13 | Configure Supabase Auth for OTP | 0.25 | — | Enable OTP in Supabase dashboard. Keep email/password enabled (for existing admin). |

**Gate M3.1.0 Total: 8.75 units (sequential)**

### Gate Acceptance Criteria

- [ ] `companies`, `user_profiles`, `admin_activity_log`, `slot_requests` tables exist with correct schemas
- [ ] All existing tables have `company_id` column (NOT NULL after backfill)
- [ ] `rule_sets` unique constraint is `(dataset_id, company_id)`
- [ ] `is_admin()` and `get_user_company_id()` SQL functions work correctly
- [ ] RLS: admin can see all data; client users see only their company's data
- [ ] RLS: only admin can INSERT into `trees`
- [ ] `register-user` Edge Function creates user + profile + log entry
- [ ] `deactivate-company` Edge Function deactivates company + users + revokes sessions
- [ ] `process-dataset-upload` writes to `{company_id}/{dataset_id}/` storage paths
- [ ] OTP login method is available in Supabase Auth config
- [ ] `mali@edata.ae` has a `user_profiles` record with role = `admin`, company_id = NULL

---

## Stream A — Auth & Route Protection

Update the frontend authentication flow, auth context, and route guards.

| Task ID | Task Name | Duration | Dependencies | Notes |
|---------|-----------|----------|--------------|-------|
| A.1 | Update login page — OTP flow | 1.0 | Gate M3.1.0 | Two-step: email input → OTP input. Use `signInWithOtp()` + `verifyOtp()`. Keep password fallback for existing admin. Handle "not registered" error. |
| A.2 | Extend `AuthProvider` with profile | 1.0 | Gate M3.1.0 | Add `profile` state (role, company_id, full_name, is_active). Fetch from `user_profiles` on session restore. Remove `signUp()`. Add `signInWithOtp()` + `verifyOtp()` methods. |
| A.3 | Create `RoleGuard` component | 0.75 | A.2 | Replace `ProtectedRoute`. Accept `allowedRoles` prop. Check `profile.role`. Handle deactivated users (sign out + redirect). Redirect unauthorized to appropriate page. |
| A.4 | Update route definitions | 0.5 | A.3 | Wrap all routes with `RoleGuard`. Set per-role landing: admin → `/admin`, clients → `/datasets`. |
| A.5 | Update sidebar navigation | 1.0 | A.2 | Role-aware nav items. Admin: full nav + Admin section. Client Admin: standard + My Company. Client User: standard only. Hide "Generate Tree" for clients. Show company name for client users. |

**Stream A Total: 4.25 units**

### Stream A Acceptance Criteria

- [ ] Login page shows email-only field with "Send Code" button
- [ ] OTP entry field appears after code is sent
- [ ] Existing admin can still log in with email/password
- [ ] Unregistered emails show "Access denied" message
- [ ] `useAuth()` exposes `profile` with role, company_id, full_name
- [ ] Routes are protected by role: `/admin/*` → admin only, `/company/*` → client_admin only
- [ ] Unauthorized access redirects gracefully (not a blank page or crash)
- [ ] Deactivated user is signed out and redirected to login with message
- [ ] Sidebar shows correct items per role
- [ ] "Generate Tree" is not visible to client roles

---

## Stream B — Admin Console

Build the admin-only pages for managing companies, users, and viewing logs.

| Task ID | Task Name | Duration | Dependencies | Notes |
|---------|-----------|----------|--------------|-------|
| B.1 | Admin dashboard page (`/admin`) | 1.5 | Gate M3.1.0 | Overview cards (companies, users, datasets, trees count). Recent activity feed from admin_activity_log. Quick-action buttons: New Company, Register User. |
| B.2 | Company management page (`/admin/companies`) | 2.0 | B.1 | List table with search/filter. Create Company dialog. Company detail page: edit info, user list, data summary, deactivate toggle. Log actions. |
| B.3 | User management page (`/admin/users`) | 2.0 | B.1, A.2 ⊕ | List table with search/filter. Register User dialog: email, name, company dropdown, role dropdown. Calls `register-user` Edge Function. Deactivate/reactivate toggle. Edit role/company. |
| B.4 | Admin logs page (`/admin/logs`) | 1.5 | B.1 | Table from admin_activity_log. Filters: action type, user, company, date range. Sortable columns. Expandable row for details JSON. Export CSV. |
| B.5 | Slot request handling | 0.75 | B.3 | Pending requests indicator on dashboard. Approve/deny UI (increases max_user_slots on approve). |

**Stream B Total: 7.75 units**

### Stream B Acceptance Criteria

- [ ] Admin dashboard shows correct aggregate counts
- [ ] Activity feed displays recent admin actions with timestamps
- [ ] Admin can create a new company with all required fields
- [ ] Company detail page shows users, datasets, trees belonging to that company
- [ ] Admin can deactivate/reactivate a company (triggers logout + blocks login)
- [ ] Admin can register a new user under a company with a chosen role
- [ ] Registration is blocked when company is at max user slots
- [ ] Admin can deactivate/reactivate individual users
- [ ] Logs page displays all admin activity with working filters
- [ ] Slot requests appear in admin dashboard and can be approved/denied

---

## Stream C — Client Admin Features

Build the company-scoped user management page for Client Admins.

| Task ID | Task Name | Duration | Dependencies | Notes |
|---------|-----------|----------|--------------|-------|
| C.1 | Company users page (`/company/users`) | 1.5 | Gate M3.1.0, A.3 ⊕ | List users within own company. Read-only for most fields. |
| C.2 | Request more slots UI | 0.75 | C.1 | "Request More Slots" button → creates `slot_requests` record. View request history and statuses (pending/approved/denied). |

**Stream C Total: 2.25 units**

### Stream C Acceptance Criteria

- [ ] Client Admin can see only their company's users
- [ ] Client Admin cannot see other companies' data
- [ ] "Request More Slots" creates a slot_requests record
- [ ] Request history shows correct statuses
- [ ] Client User cannot access `/company/users`

---

## Stream D — Operations Layer & Generate Tree

Update the data operations layer and the tree creation page.

| Task ID | Task Name | Duration | Dependencies | Notes |
|---------|-----------|----------|--------------|-------|
| D.1 ★ | Update `operations.ts` — tree operations | 1.0 | Gate M3.1.0 | `createTree()` accepts company_id param. Update TypeScript interfaces. RLS handles scoping for reads. |
| D.2 ★ | Update `operations.ts` — dataset operations | 1.0 | Gate M3.1.0 | Resolve company_id from profile for inserts. Update interfaces. |
| D.3 | Update `operations.ts` — ruleset operations | 0.75 | Gate M3.1.0 | `upsertRuleset()` uses company_id. `getRulesetForDataset()` filters by company. Update unique key. |
| D.4 | Update remaining DB type interfaces | 0.5 | D.1, D.2, D.3 | Ensure all TypeScript types in `db/types.ts` reflect company_id additions. |
| D.5 | Add company selector to Generate Tree page | 1.0 | D.1, A.2 ⊕ | Admin-only dropdown at top. Fetches companies list. Selected company_id saved on tree record. |

**Stream D Total: 4.25 units**

### Stream D Acceptance Criteria

- [ ] `createTree()` correctly saves `company_id` on the tree record
- [ ] Dataset creation includes `company_id` from user profile
- [ ] Rule set operations use `(dataset_id, company_id)` for uniqueness
- [ ] All TypeScript interfaces reflect the new `company_id` field
- [ ] Generate Tree page shows company selector for admins
- [ ] Company selector is hidden / page is inaccessible for client roles
- [ ] `npm run build` passes with zero TypeScript errors

---

## Parallelization Map

```
Gate M3.1.0 (Database + Auth + Edge Functions) ◆
     │
     │  ── sequential, blocking ──
     │
     ├── Stream A (Auth & Routes)  ──────────────►│
     │                                             │
     ├── Stream B (Admin Console)  ──────────────►│  (parallel with A)
     │                                             │
     ├── Stream C (Client Admin)   ──────────────►│  (parallel, needs A.3 ⊕)
     │                                             │
     └── Stream D (Operations + Gen Tree) ───────►│  (parallel, needs A.2 ⊕)
                                                   │
                                                   ▼
                                          Phase M3.1 Complete
```

**Notes:**
- Stream C partially depends on Stream A (needs `RoleGuard` from A.3)
- Stream D partially depends on Stream A (needs profile from A.2 for company_id resolution)
- Stream B partially depends on Stream A (B.3 uses auth context from A.2)
- Streams B and D can begin on their non-dependent tasks immediately after the gate

---

## Component Dependency Summary

| Component | Status | Used By |
|-----------|--------|---------|
| `AuthProvider` | Modify | All streams (core auth) |
| `ProtectedRoute` | Replace → `RoleGuard` | Stream A |
| `Sidebar` | Modify | Stream A (role-aware nav) |
| `operations.ts` | Modify | Stream D (add company_id) |
| `storage/helpers.ts` | Modify | Gate (storage restructure) |
| Edge: `process-dataset-upload` | Modify | Gate (company_id in records) |
| Edge: `register-user` | New | Gate + Stream B |
| Edge: `deactivate-company` | New | Gate + Stream B |

---

## Definition of Done

- [ ] All new routes are protected by `RoleGuard` with correct role checks
- [ ] Admin can create companies, register users, view logs end-to-end
- [ ] Client Admin can view company users and request slots
- [ ] Client User can only access own company data, cannot create trees or manage users
- [ ] OTP login works for newly provisioned users
- [ ] Password login still works for existing admin
- [ ] Company deactivation logs out all users and blocks future access
- [ ] All data operations correctly scope by `company_id`
- [ ] Generate Tree page includes company selector for admin
- [ ] Storage paths use `{company_id}/{dataset_id}/` pattern
- [ ] No lint errors in files touched by this phase
- [ ] `npm run build` succeeds with zero TypeScript errors

---

## Test Scenarios

### Happy Path
- Admin logs in with password → sees admin dashboard → creates company → registers user under it → user logs in via OTP → sees only their company's data
- Admin creates tree for Company X → Company X users can see/use it → other companies cannot
- Client Admin views company users → requests more slots → admin approves → new user can be registered

### Edge Cases
- Unregistered email attempts login → "Access denied" message
- Company at max slots → user registration shows "slots full" error
- Deactivated company user tries to navigate → immediate sign-out
- Client user navigates to `/admin` directly → redirected to `/datasets`
- Client user navigates to `/generate-tree` directly → redirected
- Two users from same company edit same ruleset → last write wins (shared ruleset)
- Admin with no company_id accesses platform data → sees everything

---

## Estimated Duration

| Component | Sequential | Parallelized |
|-----------|-----------|-------------|
| Gate M3.1.0 | 8.75 | 8.75 (blocking) |
| Stream A | 4.25 | — |
| Stream B | 7.75 | — |
| Stream C | 2.25 | — |
| Stream D | 4.25 | — |
| **Total** | **27.25** | **~16.5** (gate + longest stream B) |

With two parallel agents after the gate, estimated **~16.5 units** (gate + Stream B as critical path).

---

_Phase Document Version: 1.0 | Last Updated: 2026-02-16_
