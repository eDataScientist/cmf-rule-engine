# Conventions

**Project:** ClaimCPU (claims-rule-engine)

---

## Tech Stack

| Layer      | Technology      | Version |
|------------|-----------------|---------|
| Language   | TypeScript      | 5.9     |
| Runtime    | Browser (ES2022) | —       |
| Framework  | React           | 19.1    |
| Build Tool | Vite            | 7.1     |
| CSS        | Tailwind CSS    | 4.1     |
| Backend    | Supabase        | 2.84    |

---

## Libraries & Tools

| Library/Tool           | Purpose                        | Version |
|------------------------|--------------------------------|---------|
| @xyflow/react          | Flow/tree graph editor        | 12.9    |
| jotai                  | State management              | 2.15    |
| react-router-dom       | Client-side routing            | 7.9     |
| recharts               | Data visualization (charts)    | 2.15    |
| papaparse              | CSV parsing                    | 5.5     |
| html2canvas            | DOM-to-image export            | 1.4     |
| lucide-react           | Icon library                   | 0.546   |
| date-fns               | Date utilities                 | 4.1     |
| class-variance-authority | Component variant builder    | 0.7     |
| clsx + tailwind-merge  | Class merging utility          | —       |
| typescript-eslint      | TS-aware linting               | 8.45    |
| eslint                 | Code linting                   | 9.36    |
| vitest                 | Test runner                    | 4.1     |
| @testing-library/react | Component testing              | 16.3    |
| @testing-library/jest-dom | DOM matchers                | 6.9     |
| @testing-library/user-event | User interaction simulation | 14.6    |
| jsdom                  | Browser test environment       | 29.1    |
| @vitest/coverage-v8    | Code coverage provider         | 4.1     |

---

## File Structure

```
project-root/
  src/                    — All application source code
    components/
      shared/             — Reusable app components (Layout, RoleGuard, ScoreCard)
      ui/                 — shadcn/ui primitives (button, card, dialog, table, tabs)
    hooks/                — Shared hooks
    lib/                  — Core logic, no React dependency
      auth/               — Auth context and providers
      db/                 — Database types, operations, admin-operations
      parsers/            — FIGS parser and other format parsers
      processing/         — TabularClaimsProcessor and bulk processing
      scoring/            — Tree scoring engine (engine.ts, transforms.ts)
      storage/            — Supabase storage helpers
      themes/             — Theme color definitions (Motor/Medical)
      types/              — TypeScript interfaces (tree, claim, trace)
      utils/              — General utilities (cn, formatters)
    pages/                — Route-level page components, one directory per route
      [page-name]/
        components/       — Page-specific UI components
        hooks/            — Page-specific custom hooks
        utils/            — Page-specific utilities
        index.tsx         — Page entry point
    store/
      atoms/              — Jotai atoms organized by domain
      index.ts            — Atom re-exports
    App.tsx               — Root routing and providers
    main.tsx              — App entry point, DB init
  supabase/
    functions/            — Edge functions deployed to Supabase
      _shared/            — Shared helpers across edge functions
    migrations/           — SQL migration files (timestamped)
  docs/                   — Blueprint project documentation
  knowledge-base/         — Legacy planning documents (archived)
  public/                 — Static assets (favicon, etc.)
  sources/                — Reference HTML prototypes (gig_tree_*)
```

Page module pattern — each page has its own directory with `components/`, `hooks/`, `utils/`, and an `index.tsx` entry.

---

## Coding Standards

- **Naming**:
  - React components: `PascalCase` (e.g., `ClaimsTable.tsx`)
  - Hooks: `camelCase` with `use` prefix (e.g., `useCsvParser.ts`)
  - Utilities/functions: `camelCase` (e.g., `evaluateClaim`, `parseFIGS`)
  - Types/interfaces: `PascalCase` (e.g., `TraceResult`, `ClaimData`)
  - Constants/enums: `PascalCase` (e.g., `TreeType`)
  - Filenames: match the primary export (components `PascalCase`, hooks `camelCase`)
- **Formatting**: ESLint + TypeScript strict mode enforced
  - `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
  - No trailing commas, 2-space indent (Vite defaults)
- **Imports**:
  - Path alias `@/` maps to `src/` (configured in vite.config.ts and tsconfig.app.json)
  - Third-party imports first, then `@/` imports
  - No relative import chains beyond one level inside a page module — use `@/` for cross-page imports
- **Comments**: Minimal. Only for non-obvious logic. No emojis in code or comments.
- **File size**: Keep files focused; extract into sub-components/hooks when a single file exceeds ~300 lines.
- **Types**: `verbatimModuleSyntax` enabled — use `import type` for type-only imports. No `any` unless truly unavoidable (prefer `unknown`).
- **Component variants**: Use `class-variance-authority` for styled component variants (matching existing `button.tsx`, `badge.tsx` patterns).

---

## Testing

- **Framework**: Vitest + React Testing Library + jsdom
- **Runner**: `npx vitest` (script: `"test": "vitest"` in package.json)
- **Location**: Test files co-located with source files as `*.test.tsx` or `*.test.ts`
  - Example: `src/lib/scoring/engine.test.ts` tests `src/lib/scoring/engine.ts`
- **Naming**: `[filename].test.ts` for pure logic, `[filename].test.tsx` for component tests
- **Coverage**: Vitest coverage via v8 provider, reported but not blocking (no gate threshold yet)
- **Policy**: FORWARD-ONLY. Tests cover new work from this point forward. Existing untested code gets tests only when modified as part of new work, bug fixes, or revisions.
- **Test types expected**:
  - Unit tests for `lib/` modules (scoring engine, parsers, utilities, processing)
  - Component tests for shared components (RoleGuard, RiskBadge, ScoreCard)
  - Integration tests for hooks
  - No E2E tests at this stage (no Playwright/Cypress)

---

## Anti-Patterns

- **Direct Supabase client calls in components** — use `src/lib/db/` operations layer instead
- **Inline business logic in page components** — extract to hooks in the page's `hooks/` directory
- **`any` types** — use `unknown` and narrow with type guards; `any` silences the type checker
- **Mutating state directly** — always use Jotai atom setters; never mutate atom values in place
- **Hardcoded URLs or keys** — use environment variables (`.env`) for Supabase URL, anon key, etc.
- **Emojis in code** — never use emojis in any code file, ever
- **Relative imports beyond the page module** — use `@/` path alias for imports from other parts of `src/`
- **Dropping `company_id` from inserts** — all new data operations must scope to company (post-M3.1)

---

## Agent Tools

| Tool         | Purpose                        | Configuration                         |
|--------------|--------------------------------|---------------------------------------|
| Supabase MCP | Database management            | Project: `cayqhjjpqucsoymjvbzr`       |

---

## Project-Specific Notes

- **Product name**: ClaimCPU (rebranded from "Claims Rule Engine" — M3.2 pending)
- **Auth**: OTP-only for new users; email/password retained for existing admin via `/auth/admin`
- **RBAC**: Three roles — admin, client_admin, client_user. Route protection via `RoleGuard`.
- **Multi-tenancy**: All data scoped to `company_id`. RLS enforces isolation at database level.
- **Design system**: "Zinc Protocol" dark theme. Monospace font (JetBrains Mono) for data values, Inter/Geist for UI text. 1px borders over shadows. 6px container radius.
- **CSS**: Tailwind CSS v4 with `@theme` syntax in `index.css`. No v3 directives.
- **Dual theme**: Motor (blue, primary hue 240) and Medical (green, primary hue 155) themes.
- **No self-registration**: Users are provisioned by Admin only.
- **Database**: Supabase PostgreSQL. Migration files in `supabase/migrations/` are auto-applied via Supabase CLI.
- **Edge functions**: Deployed via `supabase functions deploy`. Shared code in `_shared/`.
- **Agent instructions**: Root `CLAUDE.md` and `AGENTS.md` contain session protocols. Knowledge-base `AGENTS.md`/`CLAUDE.md` contain task workflows.
