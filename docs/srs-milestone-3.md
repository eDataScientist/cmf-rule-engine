# Software Requirements Specification — Milestone 3: ClaimCPU v3.0

> **Product:** ClaimCPU (formerly Claims Rule Engine)
> **Milestone:** 3 — Client-Facing Product
> **Status:** DRAFT — M3.1 detailed, M3.2–M3.9 outlined
> **Date:** 2026-02-16

---

## 1. M3.1 — Accounts & Roles

### 1.1 Company Entity
- A `companies` table becomes the primary data ownership unit
- All trees, datasets, rule sets, and associations are scoped to a company, not a user
- Company fields: name, country, insurance type (Motor / Medical), max user slots, active status
- Existing data (currently scoped to `user_id`) must be migrated to a company record
- The existing user `mali@edata.ae` becomes the first Admin, under an "eData" company

### 1.2 Roles
- Three roles: **Admin**, **Client Admin**, **Client User**
- Role is stored on a `user_profiles` table linked to `auth.users`
- Each user belongs to exactly one company

#### Admin
- Platform-level role (eData staff)
- Full access to all companies and all data across the platform
- Can create companies and register users
- Can create, edit, and delete trees (tree creation is admin-only)
- Access to admin console, logs, and system configuration

#### Client Admin
- Company-level role (primary contact for a client company)
- Can view and manage users within their own company
- Can request additional user slots from Admin
- Can create and manage datasets and rules for their company
- Cannot create or delete trees
- Cannot see other companies' data

#### Client User
- Standard client user
- Can work with their company's datasets and rules
- Can use detection APIs scoped to their company's data
- Cannot manage users, create trees, or delete datasets/rules

### 1.3 Authentication
- **No self-registration** — registration is blocked entirely
- **OTP-only login** — user enters email, receives OTP, enters code
- Admin pre-registers client emails (via `supabase.auth.admin.createUser()` using service role key)
- Email/password sign-up and sign-in are disabled
- Unregistered emails receive an "Access denied. Contact your administrator." message
- Session management via Supabase JWT containing user role in metadata
- Login page: single email field → "Send Code" → OTP input → redirect based on role

### 1.4 Data Ownership Migration
- All major tables gain a `company_id` foreign key column
- Tables affected: `trees`, `datasets`, `rule_sets`, `dataset_tree_associations`, `upload_status`
- `user_id` columns are retained for audit (who created/modified) but are no longer the access-control key
- `rule_sets` unique constraint changes from `(dataset_id, user_id)` to `(dataset_id, company_id)`
- All RLS policies rewritten: `auth.uid() = user_id` → company-based checks via helper functions
- Admins bypass company scoping (see all data)
- All existing data backfilled to the eData company

### 1.5 Frontend Changes
- Auth context extended with `profile` (role, company_id, full_name)
- `signUp` / `signIn` replaced with `signInWithOtp` / `verifyOtp`
- `ProtectedRoute` replaced with role-aware `RoleGuard` component
- Sidebar navigation adapts per role:
  - Admin: full nav + Admin section (Companies, Users, Logs)
  - Client Admin: standard nav + "My Company" section
  - Client User: standard nav only
- "Generate Tree" hidden from sidebar for all Client roles
- Per-role landing page: Admin → admin dashboard, Client → datasets

### 1.6 Edge Function Updates
- `process-dataset-upload` must resolve `company_id` from user profile and set it on the dataset record
- Other Edge Functions require no auth changes (data scoping handled by RLS)

### 1.7 Resolved Decisions
1. **Client Admin slot requests** — In-app notification to Admin
2. **Tree assignment** — Admin creates trees for a specific company. Trees can also be shared across companies.
3. **Company deactivation** — Both: immediate logout for all company users AND block future logins
4. **Admin hierarchy** — Admin (eData) exists outside the company hierarchy (not a row in `companies`)
5. **Tree creation flow** — "Generate Tree" page gets a company selector (admin-only)
6. **Rule sets** — Shared per company: one rule set per `(dataset_id, company_id)`, all company users see the same rules
7. **Storage paths** — Restructured with company_id prefixes (e.g., `{company_id}/{dataset_id}/raw.csv`). Existing data can be wiped.
8. **Dimensions** — Remain global, shared across all companies
9. **Auth coexistence** — Existing admin user keeps email/password login. OTP is for all newly provisioned users. Both methods coexist.

---

## 2. M3.2 — Product Rebrand

_To be detailed when this track begins._

### 2.1 Codebase Rename
- Replace all references to "Claims Rule Engine" / "CMF" with "ClaimCPU"
- Update page titles, sidebar logo, favicon, meta tags, README

### 2.2 Branding Assets
- New logo and wordmark
- Updated color palette (if applicable)
- Email template and notification text updates

---

## 3. M3.3 — Dataset Creation Overhaul

_To be detailed when this track begins._

### 3.1 Column Schema Mode
- Dataset creation without CSV upload
- Column picker from dimension catalogue
- Schema-only dataset records

### 3.2 Enhanced CSV Upload
- Improved drag-and-drop UX
- File validation and progress indicators
- Auto-mapping of detected columns

### 3.3 Dataset Management
- Unified list for schema-only and CSV-backed datasets
- Status badges and dataset duplication

---

## 4. M3.4 — Client Onboarding

_To be detailed when this track begins._

### 4.1 Onboarding Wizard
- Multi-step flow: Welcome → Company Profile → Column Selection → Quick Tour
- Persistence of completion status per user

### 4.2 First-Run Experience
- Sample dataset and demo tree/rule set
- Contextual tooltips on first visit

---

## 5. M3.5 — Detection APIs

_To be detailed when this track begins._

### 5.1 Single Claim API
- `POST /functions/v1/detect-claim`
- JSON input/output, JWT-authenticated, company-scoped

### 5.2 Batch Detection API
- `POST /functions/v1/detect-claims-batch`
- Rate limiting, size limits, async option for large batches

### 5.3 API Documentation & Key Management
- Auto-generated docs page
- API key generation per client
- Usage tracking and quota management

---

## 6. M3.6 — Pipeline Visualiser

_To be detailed when this track begins._

### 6.1 Pipeline Page
- Dataset selector, two-stage flow (Rules → Trees), summary cards

### 6.2 Rules Stage
- Claim breakdown by rule, severity distribution, drill-downs

### 6.3 Trees Stage
- Risk level distribution, score histogram, per-tree breakdown

### 6.4 Combined Summary
- End-to-end classification breakdown, export options

---

## 7. M3.7 — Rules Playground

_To be detailed when this track begins._

### 7.1 Interactive Testing
- Select rules, input claim (form/JSON), execute, view results

### 7.2 Visual Feedback
- Rule-by-rule cards, condition-level detail, severity coding

### 7.3 Bulk & Comparison
- Bulk testing, rule set comparison, hit-rate statistics

---

## 8. M3.8 — Admin Console

_To be detailed when this track begins._

### 8.1 Admin Dashboard
- Overview metrics, activity feed, quick actions

### 8.2 Company Provisioning
- Create, edit, deactivate companies
- Company detail pages with user and data summaries

### 8.3 User Provisioning
- Register users with role and company assignment
- Deactivate/reactivate, role editing, slot management

---

## 9. M3.9 — Admin Logs & Query Dashboard

_To be detailed when this track begins._

### 9.1 Query Logs
- Log every detection API call with full metadata
- Filterable by company, query type, user, date range

### 9.2 Company Query Dashboard
- Per-company analytics: query volume, claims over time, most-used trees/rules

### 9.3 System-Wide Analytics
- Cross-company aggregation, top companies, error rates

### 9.4 Admin Activity Audit Trail
- Immutable log of all admin actions (user/company/tree changes)
- Filterable by action type, admin user, target entity

---

_SRS Version: 1.0 | Last Updated: 2026-02-16_
