# Milestone 3 — Accounts & Roles

> Introduce multi-tenant access control so multiple insurance companies can use the platform with isolated data. Companies become the primary data ownership unit. Three roles govern access. Client users authenticate via OTP. Admins provision companies and users through a dedicated console.

---

## Phases

### Phase 1 — Database & Auth Foundation
> Create the companies, user_profiles, admin_activity_log, and slot_requests tables. Add company_id to all existing tables. Rewrite RLS policies from user-scoped to company-scoped. Deploy edge functions for user registration and company deactivation. Configure OTP authentication in Supabase alongside existing password login.

### Phase 2 — Auth, Routes & Role Guards
> Redesign the login page for OTP-first flow with a separate admin password route. Extend the auth context with user profile data. Replace the old `ProtectedRoute` with role-aware `RoleGuard`. Apply role-based route protection across the application. Make sidebar navigation adapt to the user's role.

### Phase 3 — Admin Console
> Build admin-only pages for dashboard overview, company management, user registration, and admin activity logs. Support company creation, deactivation, and reactivation. Enable user provisioning with role assignment and slot capacity enforcement. Provide a filterable audit trail of all admin actions.

### Phase 4 — Client Admin Features
> Build a company-scoped user management page for client admins. Enable slot request submission and status tracking. Enforce that client users cannot access admin pages or create trees.

### Phase 5 — Operations & Tree Assignment
> Update all data operations to scope by company_id. Update database TypeScript interfaces. Add a company selector to the Generate Tree page for admins to assign trees to specific companies.

---

## Phase Dependencies

```
Phase 1 → Phase 2
Phase 1 → Phase 3 → Phase 4 (Phase 4 needs Phase 3's admin console)
Phase 1 → Phase 5
Phase 2 → Phase 3 (Phase 3 needs Phase 2's auth context)
Phase 2 → Phase 5 (Phase 5 needs Phase 2's profile for company_id)
```

Phase 1 is the gate — all streams depend on it. Phase 2, Phase 3, and Phase 5 can partially overlap after Phase 1. Phase 4 requires the Admin Console from Phase 3.

---

## Success Criteria

- [x] Companies, user_profiles, admin_activity_log, and slot_requests tables exist
- [x] All existing tables have company_id (NOT NULL) with company-scoped RLS
- [x] OTP login works for newly provisioned users; password login retained for admin
- [x] Routes are protected by role — unauthorized access redirects gracefully
- [x] Sidebar shows correct navigation items per role
- [x] Admin can create companies and register users with role assignment
- [x] Admin can deactivate companies and users
- [x] Client admin can view company users and request more slots
- [x] All data operations correctly scope by company_id
- [x] Generate Tree page includes company selector for admins
- [x] npm run build passes with zero TypeScript errors
- [ ] Client admin slot request flow is end-to-end operational
- [ ] Full integration smoke test across all three roles

---

## SRS Traceability

| Phase | SRS IDs |
|-------|---------|
| Phase 1 — Database & Auth Foundation | SRS-012, SRS-014, SRS-015 |
| Phase 2 — Auth, Routes & Role Guards | SRS-011 (extended), SRS-013 |
| Phase 3 — Admin Console | SRS-016 |
| Phase 4 — Client Admin Features | SRS-013 (client admin stories) |
| Phase 5 — Operations & Tree Assignment | SRS-012, SRS-015 |

---

_Milestone status: In Progress_
