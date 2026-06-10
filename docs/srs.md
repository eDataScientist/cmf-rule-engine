# ClaimCPU — Software Requirements Specification

---

## Purpose

This SRS captures the current shared understanding of ClaimCPU's product requirements between the PRD and later planning documents. It distills requirements from the codebase (M1/M2 built), the archived milestone-3 planning documents (M3 in progress), and the product roadmap (M4–M8 planned).

---

## Requirement Index

| ID      | Title                                           | Priority | Status                         | Assigned Milestone          |
|---------|-------------------------------------------------|----------|--------------------------------|-----------------------------|
| SRS-001 | Decision tree parsing from FIGS format          | Must     | active                         | M1 — Core Engine            |
| SRS-002 | Recursive tree scoring engine                   | Must     | active                         | M1 — Core Engine            |
| SRS-003 | Tree visualization with path tracing            | Must     | active                         | M1 — Core Engine            |
| SRS-004 | Dataset upload and column alignment             | Must     | active                         | M2 — Platform Foundation    |
| SRS-005 | CSV bulk claim processing                       | Must     | active                         | M2 — Platform Foundation    |
| SRS-006 | Rule Builder with IDE-style composition         | Must     | active                         | M2 — Platform Foundation    |
| SRS-007 | Rule Manager with CRUD for rule sets            | Must     | active                         | M2 — Platform Foundation    |
| SRS-008 | Table Visualizer with financial analytics       | Must     | active                         | M2 — Platform Foundation    |
| SRS-009 | Interactive tree structure visualizer           | Must     | active                         | M2 — Platform Foundation    |
| SRS-010 | Motor/Medical dual-theme system                 | Should   | active                         | M2 — Platform Foundation    |
| SRS-011 | Email/password authentication                   | Must     | active                         | M2 — Platform Foundation    |
| SRS-012 | Company entity as data ownership unit           | Must     | approved-pending-implementation | M3 — Accounts & Roles       |
| SRS-013 | Three-role access control                       | Must     | approved-pending-implementation | M3 — Accounts & Roles       |
| SRS-014 | OTP-only authentication for client users        | Must     | approved-pending-implementation | M3 — Accounts & Roles       |
| SRS-015 | Company-scoped data isolation                   | Must     | approved-pending-implementation | M3 — Accounts & Roles       |
| SRS-016 | Admin console for company and user provisioning | Must     | approved-pending-implementation | M3 — Accounts & Roles       |
| SRS-017 | Product rebrand to ClaimCPU                     | Should   | active                         | M4 — Rebrand & Datasets     |
| SRS-018 | Dataset schema mode without CSV upload          | Could    | active                         | M4 — Rebrand & Datasets     |
| SRS-019 | Client onboarding wizard                        | Could    | active                         | M5 — Client Onboarding      |
| SRS-020 | Single claim detection API                      | Must     | active                         | M6 — Detection APIs         |
| SRS-021 | Batch detection API                             | Must     | active                         | M6 — Detection APIs         |
| SRS-022 | Pipeline visualizer                             | Should   | active                         | M7 — Pipeline & Playground  |
| SRS-023 | Rules playground for interactive testing        | Should   | active                         | M7 — Pipeline & Playground  |
| SRS-024 | Query logs and analytics dashboard              | Could    | active                         | M8 — Logs & Analytics       |

---

## Requirements

### Must Have

#### SRS-001 — Decision tree parsing from FIGS format

The system must parse decision tree definitions written in the FIGS (Fraud Investigation Group Scoring) format. The parser must handle multi-tree input separated by `+` delimiters, extract tree titles from annotations, and produce a recursive tree structure with decision nodes and leaf values.

#### SRS-002 — Recursive tree scoring engine

The system must evaluate a claim against one or more decision trees and produce a total score, probability, and risk classification. The engine must traverse decision trees recursively, evaluating conditions against normalized claim data, and compute probability using min-max scaling across the batch.

#### SRS-003 — Tree visualization with path tracing

The system must render decision trees visually with color-coded leaf nodes, highlighted decision paths, and connector lines. When a claim is evaluated, the system must highlight the exact path taken through each tree.

#### SRS-004 — Dataset upload and column alignment

The system must allow users to upload CSV claim datasets. It must automatically align uploaded columns to dimension names, compute dataset quality scores, and persist the aligned dataset for downstream processing.

#### SRS-005 — CSV bulk claim processing

The system must process multiple claims from an uploaded CSV in batch, evaluating each claim against selected decision trees and producing scored results with probabilities and risk levels.

#### SRS-006 — Rule Builder with IDE-style composition

The system must provide an IDE-style interface for composing claim detection rules. Users must be able to select claim fields, operators, and thresholds to build conditions, and combine conditions into composite rule sets with severity labels.

#### SRS-007 — Rule Manager with CRUD for rule sets

The system must allow users to create, view, edit, and delete rule sets associated with a dataset. Rule sets must be persisted and reusable across detection operations.

#### SRS-008 — Table Visualizer with financial analytics

The system must display scored claim results in a filterable data table with risk badges, probability scores, and financial metric summaries. It must support claim number selection, risk-level filtering, and analytics overview with score distribution charts.

#### SRS-009 — Interactive tree structure visualizer

The system must provide an interactive tree structure view using a flow-editor canvas. Users must be able to pan, zoom, and navigate between subtrees in a multi-tree structure. Nodes must be color-coded and laid out with horizontal spreading.

#### SRS-011 — Email/password authentication

The system must authenticate users via email and password. Session state must persist across page refreshes. The existing admin user must retain password-based login after OTP is introduced.

#### SRS-012 — Company entity as data ownership unit

The system must introduce companies as the primary data ownership unit. All trees, datasets, rule sets, and associations must be scoped to a company, not an individual user. Administrators exist outside the company hierarchy with full cross-company access.

#### SRS-013 — Three-role access control

The system must enforce three distinct roles: Admin (platform-wide access, tree creation, company provisioning), Client Admin (company-scoped user management and data operations), and Client User (company-scoped data access only). Role-based route protection must prevent unauthorized page access.

#### SRS-014 — OTP-only authentication for client users

The system must authenticate client users via email one-time passcode. Self-registration must be disabled. Only administrators may provision new user accounts. Unregistered emails must receive an access-denied message.

#### SRS-015 — Company-scoped data isolation

The system must enforce company-level data isolation at the database layer via row-level security. Client users must only see their own company's trees, datasets, and rule sets. Storage paths must include company identifiers.

#### SRS-016 — Admin console for company and user provisioning

The system must provide an admin-only console for creating and managing companies, registering users with role assignment, handling client admin slot requests, and viewing an audit trail of all admin actions. Company deactivation must log out all company users and block future access.

#### SRS-020 — Single claim detection API

The system must expose an HTTP endpoint that accepts a single claim in JSON format and returns a detection result with score, probability, risk level, matched rules, and decision trace path. The endpoint must be JWT-authenticated and scoped to the user's company.

#### SRS-021 — Batch detection API

The system must expose an HTTP endpoint that accepts a batch of claims in JSON format and returns detection results for all claims with summary statistics. The endpoint must enforce rate limiting, size limits, and support asynchronous processing for large batches.

### Should Have

#### SRS-010 — Motor/Medical dual-theme system

The system should support two visual themes — Motor (blue tones) and Medical (green tones) — with theme-aware CSS variables applied globally. Users should be able to toggle between themes from the navigation bar.

#### SRS-017 — Product rebrand to ClaimCPU

The system should be renamed from "Claims Rule Engine" to "ClaimCPU" across all user-facing surfaces including page titles, sidebar branding, favicon, meta tags, error messages, email templates, and loading states. Codebase identifiers, package names, and repository references remain unchanged.

#### SRS-022 — Pipeline visualizer

The system should provide a pipeline visualization page showing the end-to-end flow of claims through rules and tree scoring stages, with stage-level breakdowns, severity distributions, and claim-level drill-downs.

#### SRS-023 — Rules playground for interactive testing

The system should provide an interactive rules testing page where users select a rule set, input a claim manually or via JSON, and see real-time rule-by-rule results with condition-level pass/fail detail.

### Could Have

#### SRS-018 — Dataset schema mode without CSV upload

The system could allow users to create a dataset by selecting columns from a dimension catalogue without uploading a CSV file. The catalogue should align with existing upload/alignment dimensions. Users should be able to add company-scoped custom dimensions. Schema-only datasets must be fully usable for rule building and tree generation, behaving identically to uploaded datasets in the pipeline.

#### SRS-019 — Client onboarding wizard

The system could guide new client users through a multi-step onboarding flow after first login, covering product overview, company profile setup, column selection, and a guided tour of key pages.

#### SRS-024 — Query logs and analytics dashboard

The system could log every detection API call with full metadata and provide a per-company analytics view showing query volumes, claims processed over time, most-used trees and rule sets, and system-wide aggregation across all companies.

### Won't Have

_None yet._

---

## Data Schema

### Company

- Related requirements: SRS-012, SRS-013, SRS-016
- Notes: Primary data ownership umbrella for all platform entities
- Fields:
  - name: Company display name
  - country: Country of operation
  - insurance_type: motor or medical
  - max_user_slots: Maximum number of provisioned users
  - is_active: Whether the company can access the platform

### User Profile

- Related requirements: SRS-011, SRS-013, SRS-014
- Notes: Links a Supabase auth user to a company with a role
- Fields:
  - user_id: FK to auth.users
  - company_id: FK to companies (NULL for admin)
  - role: admin, client_admin, or client_user
  - full_name: Display name
  - is_active: Whether the user can log in

### Tree

- Related requirements: SRS-001, SRS-002, SRS-003, SRS-009
- Notes: A decision tree structure parsed from FIGS format
- Fields:
  - title: Tree display name
  - tree_type: motor or medical
  - structure: JSON blob of TreeNode root
  - company_id: Owning company (post-M3)

### Dataset

- Related requirements: SRS-004, SRS-018
- Notes: A claim dataset uploaded or created via schema mode
- Fields:
  - name: Dataset display name
  - company_id: Owning company
  - columns: Aligned/selected dimension columns
  - status: Processing state (uploading, ready, error)

### Rule Set

- Related requirements: SRS-006, SRS-007
- Notes: A set of detection rules associated with a dataset
- Fields:
  - dataset_id: FK to datasets
  - company_id: Owning company
  - rules: JSON array of rule definitions with conditions and severity

### Trace Result

- Related requirements: SRS-002, SRS-005, SRS-020, SRS-021
- Notes: Result of evaluating a claim against one or more trees
- Fields:
  - claimNumber: Claim identifier
  - totalScore: Aggregate score across all trees
  - probability: Normalized 0–1 probability
  - riskLevel: low, moderate, or high
  - paths: Per-tree traversal paths with leaf values

### API Query Log

- Related requirements: SRS-024
- Notes: Immutable audit record of every detection API call
- Fields:
  - timestamp: When the query was made
  - user_id: Who made the query
  - company_id: Which company's data was queried
  - query_type: single or batch
  - trees_used: Which trees were evaluated
  - rule_set_used: Which rule set was applied
  - claim_count: Number of claims processed

### Admin Activity Log

- Related requirements: SRS-016
- Notes: Append-only audit trail of all admin actions
- Fields:
  - user_id: Which admin performed the action
  - action: Action type (create_company, register_user, deactivate_company, etc.)
  - target_type: Entity type acted upon
  - target_id: Entity ID acted upon
  - details: JSONB with action-specific metadata
  - ip_address: Request origin
  - timestamp: When the action occurred

---

## Requirement Metadata

### SRS-001

- Title: Decision tree parsing from FIGS format
- Priority: Must
- Status: active
- Assigned milestone: M1 — Core Engine
- Source: Codebase — `src/lib/parsers/figs.ts`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-002

- Title: Recursive tree scoring engine
- Priority: Must
- Status: active
- Assigned milestone: M1 — Core Engine
- Source: Codebase — `src/lib/scoring/engine.ts`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-003

- Title: Tree visualization with path tracing
- Priority: Must
- Status: active
- Assigned milestone: M1 — Core Engine
- Source: Codebase — `src/components/shared/TreeVisualizer/`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-004

- Title: Dataset upload and column alignment
- Priority: Must
- Status: active
- Assigned milestone: M2 — Platform Foundation
- Source: Codebase — `src/pages/datasets/`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-005

- Title: CSV bulk claim processing
- Priority: Must
- Status: active
- Assigned milestone: M2 — Platform Foundation
- Source: Codebase — `src/lib/processing/TabularClaimsProcessor.ts`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-006

- Title: Rule Builder with IDE-style composition
- Priority: Must
- Status: active
- Assigned milestone: M2 — Platform Foundation
- Source: Codebase — `src/pages/rule-builder/`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-007

- Title: Rule Manager with CRUD for rule sets
- Priority: Must
- Status: active
- Assigned milestone: M2 — Platform Foundation
- Source: Codebase — `src/pages/rule-manager/`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-008

- Title: Table Visualizer with financial analytics
- Priority: Must
- Status: active
- Assigned milestone: M2 — Platform Foundation
- Source: Codebase — `src/pages/table-visualizer/`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-009

- Title: Interactive tree structure visualizer
- Priority: Must
- Status: active
- Assigned milestone: M2 — Platform Foundation
- Source: Codebase — `src/pages/tree-visualizer/`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-010

- Title: Motor/Medical dual-theme system
- Priority: Should
- Status: active
- Assigned milestone: M2 — Platform Foundation
- Source: Codebase — `src/lib/themes/` and `src/components/shared/ThemeProvider.tsx`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-011

- Title: Email/password authentication
- Priority: Must
- Status: active
- Assigned milestone: M2 — Platform Foundation
- Source: Codebase — `src/lib/auth/context.tsx`
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from codebase analysis and archived tasks.md

### SRS-012

- Title: Company entity as data ownership unit
- Priority: Must
- Status: approved-pending-implementation
- Assigned milestone: M3 — Accounts & Roles
- Source: Knowledge base — `srs-milestone-3.md` section 1.1
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-013

- Title: Three-role access control
- Priority: Must
- Status: approved-pending-implementation
- Assigned milestone: M3 — Accounts & Roles
- Source: Knowledge base — `srs-milestone-3.md` section 1.2
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-014

- Title: OTP-only authentication for client users
- Priority: Must
- Status: approved-pending-implementation
- Assigned milestone: M3 — Accounts & Roles
- Source: Knowledge base — `srs-milestone-3.md` section 1.3
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-015

- Title: Company-scoped data isolation
- Priority: Must
- Status: approved-pending-implementation
- Assigned milestone: M3 — Accounts & Roles
- Source: Knowledge base — `srs-milestone-3.md` section 1.4
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-016

- Title: Admin console for company and user provisioning
- Priority: Must
- Status: approved-pending-implementation
- Assigned milestone: M3 — Accounts & Roles
- Source: Knowledge base — `srs-milestone-3.md` sections 1.6 and 8
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-017

- Title: Product rebrand to ClaimCPU
- Priority: Should
- Status: active
- Assigned milestone: M4 — Rebrand & Datasets
- Source: Knowledge base — `srs-milestone-3.md` section 2
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-018

- Title: Dataset schema mode without CSV upload
- Priority: Could
- Status: active
- Assigned milestone: M4 — Rebrand & Datasets
- Source: Knowledge base — `srs-milestone-3.md` section 3.1
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-019

- Title: Client onboarding wizard
- Priority: Could
- Status: active
- Assigned milestone: M5 — Client Onboarding
- Source: Knowledge base — `srs-milestone-3.md` section 4
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-020

- Title: Single claim detection API
- Priority: Must
- Status: active
- Assigned milestone: M6 — Detection APIs
- Source: Knowledge base — `srs-milestone-3.md` section 5.1
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-021

- Title: Batch detection API
- Priority: Must
- Status: active
- Assigned milestone: M6 — Detection APIs
- Source: Knowledge base — `srs-milestone-3.md` section 5.2
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-022

- Title: Pipeline visualizer
- Priority: Should
- Status: active
- Assigned milestone: M7 — Pipeline & Playground
- Source: Knowledge base — `srs-milestone-3.md` section 6
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-023

- Title: Rules playground for interactive testing
- Priority: Should
- Status: active
- Assigned milestone: M7 — Pipeline & Playground
- Source: Knowledge base — `srs-milestone-3.md` section 7
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS

### SRS-024

- Title: Query logs and analytics dashboard
- Priority: Could
- Status: active
- Assigned milestone: M8 — Logs & Analytics
- Source: Knowledge base — `srs-milestone-3.md` section 9
- Introduced by: Alignment
- Supersedes: None
- Superseded by: None

Change log:
- 2026-05-13 — Created from archived milestone-3 SRS
