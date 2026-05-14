# ClaimCPU — Product Requirements Document

**Project:** claims-rule-engine

---

## Overview

**Problem:** Insurance companies process thousands of claims daily. Manual fraud detection is slow, inconsistent, and misses patterns invisible to human reviewers. Claim teams lack a systematic way to encode and apply their fraud detection logic at scale.

**Solution:** ClaimCPU is a web platform that lets insurance companies build, test, and deploy decision trees and rule sets for automated claims fraud scoring. Claims analysts upload datasets, configure detection rules, trace individual claims through decision paths, and score entire batches — turning institutional knowledge into repeatable, auditable scoring pipelines.

**Success Criteria:**
- Clients independently upload their claims data and run it through detection pipelines
- Fraud detection rules measurably reduce manual review time
- Scoring results are transparent and traceable — every decision path is visible and explainable
- The platform supports multiple client companies with isolated data and no cross-company leakage

## Target Users

Insurance company claims teams — fraud investigators, claims analysts, and team leads who review claims for suspicious patterns. These users work with large claim datasets and need to apply consistent scoring logic across batches.

Platform administrators at eData provision companies, manage user access, and create the decision trees that client teams use.

## Platform & Experience

- **Primary platform:** Desktop web application
- **Access model:** Invite-only — companies are provisioned by administrators, users receive email OTP access
- **Authentication:** Admin-provisioned accounts with one-time passcode login; no self-registration

## Milestones

### M1 — Core Engine
> A FIGs parser, recursive scoring engine, and tree visualization — the algorithmic core of fraud detection.
Relevant requirements: SRS-001, SRS-002, SRS-003
- Parse decision trees from FIGs format with multi-tree support
- Evaluate claims through recursive decision tree traversal
- Produce score, probability, and risk classification per claim
- Visualize trees with color-coded nodes and connector lines
- Highlight the exact path a claim took through each tree

### M2 — Platform Foundation
> Upload datasets, build rules, and score claims in bulk — a complete web application for fraud analysis.
Relevant requirements: SRS-004, SRS-005, SRS-006, SRS-007, SRS-008, SRS-009, SRS-010, SRS-011
- Upload CSV claim datasets with automatic column alignment
- Process claims in bulk against selected decision trees
- Build detection rules with an IDE-style rule composer
- Manage rule sets with create, edit, and delete operations
- View scored results in a filterable table with financial analytics
- Explore tree structures on an interactive pan-and-zoom canvas
- Toggle between Motor and Medical visual themes
- Sign in with email and password authentication

---
**MVP** — Primary product objectives achieved.

---

### M3 — Accounts & Roles
> Multi-tenant access control so multiple insurance companies can use the platform with isolated data.
Relevant requirements: SRS-012, SRS-013, SRS-014, SRS-015, SRS-016
- Introduce companies as the primary data ownership unit
- Enforce three roles: Admin, Client Admin, and Client User
- Authenticate client users via email OTP with no self-registration
- Isolate all data by company at the database level
- Provide an admin console for company and user provisioning
- Track all admin actions in an immutable audit log

### M4 — Rebrand & Datasets
> Establish the ClaimCPU identity and enable dataset creation without file uploads.
Relevant requirements: SRS-017, SRS-018
- Rename the product to ClaimCPU across the codebase and UI
- Update branding, favicon, page titles, and meta tags
- Create datasets by selecting columns from a dimension catalogue
- Support schema-only datasets usable for rule building and tree generation

### M5 — Client Onboarding
> Guide new client users through their first experience with the platform.
Relevant requirements: SRS-019
- Multi-step onboarding wizard after first login
- Product overview, company profile setup, and column selection
- Interactive tour of key pages with contextual tooltips
- Pre-built example tree and demo dataset for guided learning

### M6 — Detection APIs
> Expose fraud detection as HTTP APIs so clients can integrate ClaimCPU into their own systems.
Relevant requirements: SRS-020, SRS-021
- Single claim detection endpoint with JSON input/output
- Batch detection endpoint for up to 500 claims per request
- JWT authentication with company-scoped data access
- Asynchronous processing for large batches
- API documentation and usage tracking

### M7 — Pipeline & Playground
> Visualize end-to-end claim processing and test rules interactively.
Relevant requirements: SRS-022, SRS-023
- Pipeline visualization showing Rules → Trees flow with stage breakdowns
- Severity distribution charts and claim-level drill-downs
- Interactive rules playground with manual claim input
- Real-time rule-by-rule results with condition-level detail

### M8 — Logs & Analytics
> Full visibility into platform usage and detection activity across all companies.
Relevant requirements: SRS-024
- Log every detection API call with full query metadata
- Per-company analytics: query volumes, claims processed over time
- System-wide aggregation with top companies and error rates
- Filterable query log table with expandable JSON detail

## Milestones

### M1 — Core Engine
> A FIGs parser, recursive scoring engine, and tree visualization — the algorithmic core of fraud detection.
Relevant requirements: SRS-001, SRS-002, SRS-003
- Parse decision trees from FIGs format with multi-tree support
- Evaluate claims through recursive decision tree traversal
- Produce score, probability, and risk classification per claim
- Visualize trees with color-coded nodes and connector lines
- Highlight the exact path a claim took through each tree

### M2 — Platform Foundation
> Upload datasets, build rules, and score claims in bulk — a complete web application for fraud analysis.
Relevant requirements: SRS-004, SRS-005, SRS-006, SRS-007, SRS-008, SRS-009, SRS-010, SRS-011
- Upload CSV claim datasets with automatic column alignment
- Process claims in bulk against selected decision trees
- Build detection rules with an IDE-style rule composer
- Manage rule sets with create, edit, and delete operations
- View scored results in a filterable table with financial analytics
- Explore tree structures on an interactive pan-and-zoom canvas
- Toggle between Motor and Medical visual themes
- Sign in with email and password authentication

---
**MVP** — Primary product objectives achieved.

---

### M3 — Accounts & Roles
> Multi-tenant access control so multiple insurance companies can use the platform with isolated data.
Relevant requirements: SRS-012, SRS-013, SRS-014, SRS-015, SRS-016
- Introduce companies as the primary data ownership unit
- Enforce three roles: Admin, Client Admin, and Client User
- Authenticate client users via email OTP with no self-registration
- Isolate all data by company at the database level
- Provide an admin console for company and user provisioning
- Track all admin actions in an immutable audit log

### M4 — Rebrand & Datasets
> Establish the ClaimCPU identity and enable dataset creation without file uploads.
Relevant requirements: SRS-017, SRS-018
- Rename the product to ClaimCPU across the codebase and UI
- Update branding, favicon, page titles, and meta tags
- Create datasets by selecting columns from a dimension catalogue
- Support schema-only datasets usable for rule building and tree generation

### M5 — Client Onboarding
> Guide new client users through their first experience with the platform.
Relevant requirements: SRS-019
- Multi-step onboarding wizard after first login
- Product overview, company profile setup, and column selection
- Interactive tour of key pages with contextual tooltips
- Pre-built example tree and demo dataset for guided learning

### M6 — Detection APIs
> Expose fraud detection as HTTP APIs so clients can integrate ClaimCPU into their own systems.
Relevant requirements: SRS-020, SRS-021
- Single claim detection endpoint with JSON input/output
- Batch detection endpoint for up to 500 claims per request
- JWT authentication with company-scoped data access
- Asynchronous processing for large batches
- API documentation and usage tracking

### M7 — Pipeline & Playground
> Visualize end-to-end claim processing and test rules interactively.
Relevant requirements: SRS-022, SRS-023
- Pipeline visualization showing Rules → Trees flow with stage breakdowns
- Severity distribution charts and claim-level drill-downs
- Interactive rules playground with manual claim input
- Real-time rule-by-rule results with condition-level detail

### M8 — Logs & Analytics
> Full visibility into platform usage and detection activity across all companies.
Relevant requirements: SRS-024
- Log every detection API call with full query metadata
- Per-company analytics: query volumes, claims processed over time
- System-wide aggregation with top companies and error rates
- Filterable query log table with expandable JSON detail
