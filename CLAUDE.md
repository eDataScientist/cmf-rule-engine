# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claims Fraud Detection Rule Engine** - a React application that uses interpretable machine learning (decision trees/gradient boosting) to assess insurance claim fraud risk. The system visualizes decision tree paths and calculates fraud probability scores for individual claims.

## Task Tracking Workflow

### IMPORTANT: Task Log Management

**Before starting ANY work session:**
1. Read `TASK_LOG.md` to understand what has been completed
2. Review `TODO.md` for pending features and priorities

**After completing a major feature (before committing):**
1. Update `TASK_LOG.md` with all completed sub-tasks
2. Mark items as `[x]` in the relevant phase
3. Add new phases if needed for current work
4. Update the "Current Status" section with task counts
5. Update the "Last Updated" timestamp

**When creating a commit for a feature:**
1. Ensure TASK_LOG.md reflects all work done
2. Include TASK_LOG.md in the commit if it was updated
3. Use descriptive commit messages following the existing format

**This ensures continuous progress tracking across sessions.**

---

## Tech Stack

### Frontend
- **Vite + React Router v6** - Fast dev server, file-based routing
- **TypeScript** - Type safety for tree structures and claim data
- **Tailwind CSS v4** - Modern utility-first CSS with `@tailwindcss/vite` plugin
- **shadcn/ui** - Pre-built accessible UI components
- **Jotai** - Lightweight atomic state management

### Database
- **sql.js** - SQLite compiled to WebAssembly (runs in browser)
- **Drizzle ORM** - Type-safe database operations
- **localforage** - IndexedDB persistence layer

### Additional Libraries
- **html2canvas** - Client-side PNG export for tree traces
- **papaparse** - CSV parsing for bulk claim processing
- **lucide-react** - Icon library

---

## Project Architecture

### Directory Structure

```
src/
├── lib/
│   ├── db/              # Database layer (sql.js + Drizzle + IndexedDB)
│   │   ├── client.ts    # DB initialization and persistence
│   │   ├── schema.ts    # Drizzle table definitions
│   │   ├── operations.ts # CRUD functions
│   │   └── persistence.ts # IndexedDB sync
│   ├── scoring/
│   │   ├── engine.ts    # Tree evaluation logic
│   │   ├── transforms.ts # Sigmoid function
│   ├── parsers/
│   │   └── figs.ts      # FIGS format parser
│   └── types/
│       ├── tree.ts      # Tree type definitions
│       ├── claim.ts     # Claim data types
│       └── trace.ts     # Trace result types
├── store/
│   └── atoms/           # Jotai state atoms
├── components/
│   ├── ui/              # shadcn base components
│   └── shared/          # Reusable app components
│       ├── TreeVisualizer/
│       └── Layout/
├── pages/
│   ├── review-trees/    # View/manage saved trees
│   ├── generate-tree/   # Create new trees (FIGS parser)
│   ├── visualize-trace/ # Evaluate single/batch claims
│   └── table-visualizer/ # CSV upload + bulk processing
```

### Page Module Pattern

**Each page follows this modular structure:**

```
pages/[page-name]/
├── index.tsx           # Page component (max 80 lines)
├── components/         # Page-specific UI components
├── hooks/              # Page-specific data hooks (max 50 lines each)
└── utils/              # Pure utility functions (max 30 lines each)
```

**Key Principles:**
- Keep files small and focused (see max line limits above)
- One hook = one data operation (e.g., `useTreeDelete` not `useTreeOperations`)
- Colocation: Page-specific code lives in page subdirs
- No barrel exports - explicit imports only

---

## Core Concepts

### Decision Tree Structure

Trees are stored as recursive data structures:

```typescript
type TreeNode = LeafNode | DecisionNode;

interface LeafNode {
  value: number; // Contribution to fraud score
}

interface DecisionNode {
  condition: string;     // e.g., "count_of_parts <= 1.5"
  true_branch: TreeNode;
  false_branch: TreeNode;
}
```

**A complete tree model contains:**
- Multiple trees (ensemble model)
- Each tree has a title and root node
- Leaf values are summed across all trees
- Final score is transformed via sigmoid to get probability

### FIGS Format

Trees are imported using FIGS (text-based) format:

```
feature <= threshold (Tree #0 root)
	child_feature <= value (split)
		Val: 0.123 (leaf)
		Val: -0.045 (leaf)
	Val: 0.067 (leaf)

	+
[next tree...]
```

**Key Rules:**
- Indentation uses TABS (not spaces)
- Trees separated by `+` on its own line
- Leaf nodes start with `Val:`
- Decision nodes have conditions with `<=` or `>`

### Scoring Engine

**Flow:**
1. User inputs claim data (form or JSON)
2. For each tree:
   - Traverse from root to leaf based on conditions
   - Record path taken (nodeIds)
   - Collect leaf value
3. Sum all leaf values = total score
4. Apply sigmoid: `probability = 1 / (1 + exp(-score))`
5. Classify risk: >65% = high, 40-65% = moderate, <40% = low

### Database Persistence

**All data is stored client-side:**
- sql.js creates an in-memory SQLite database
- After each mutation, database is exported to Uint8Array
- localforage saves the array to IndexedDB
- On app load, database is restored from IndexedDB

**Tables:**
- `trees` - Stores decision tree models (id, name, tree_type, structure, created_at)

---

## Common Development Tasks

### Running the App

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Working with Database

**To initialize/reset database:**
- Delete IndexedDB via browser DevTools > Application > IndexedDB
- Refresh page - new empty database will be created

**To inspect database:**
- Use browser DevTools > Application > IndexedDB > ClaimsRuleEngine

### Adding a New Page

1. Create page directory: `src/pages/new-page/`
2. Create `index.tsx` with default export
3. Add route to `src/App.tsx`
4. Add nav link to `src/components/shared/Layout/Navbar.tsx`
5. Create subdirs: `components/`, `hooks/`, `utils/` as needed

### Adding shadcn/ui Components

When you need a new component:
1. Check `src/components/ui/` for existing components
2. If needed, create new component file following shadcn patterns
3. Import from lucide-react for icons
4. Use `cn()` utility for conditional classes

### Styling Guidelines

**Tailwind v4 Notes:**
- CSS variables defined in `src/index.css` using `@theme`
- Use OKLCH color format (not HSL)
- Import Tailwind with `@import "tailwindcss"`
- NO `@tailwind` directives or `@layer` blocks

**Component Styling:**
- Use semantic color variables: `bg-background`, `text-foreground`
- Use `cn()` to merge classes: `cn("base-classes", conditionalClass)`
- Responsive: `md:grid-cols-2 lg:grid-cols-3`

---

## Key Features Implementation

### Tree Type (Medical vs Motor)

Trees have a `treeType` field (`'medical' | 'motor'`):
- Used for visual theming (different badge colors)
- Currently cosmetic, but can affect scoring rules later
- Icon indicators: Activity (Motor), Heart (Medical)

### Real-time Validation

**Generate Tree page uses debounced parsing:**
- User types in textarea
- After 500ms pause, parser runs
- Shows Valid/Invalid indicator
- Updates preview automatically

### Visual Tree Rendering

**TreeVisualizer uses CSS for connector lines:**
- `::before` creates horizontal lines
- `::after` creates vertical lines
- Root nodes: blue background
- Leaf nodes: green background
- Decision nodes: gray background

---

## Troubleshooting

### "Cannot find module" errors
- Check `vite.config.ts` has path alias for `@`
- Check `tsconfig.app.json` has matching paths config
- Restart dev server

### Database not persisting
- Check browser IndexedDB quotas
- Check `persistDB()` is called after mutations
- Verify `initDB()` is called in `main.tsx`

### Tailwind classes not working
- Ensure using Tailwind v4 syntax in `index.css`
- Verify `@tailwindcss/vite` plugin in `vite.config.ts`
- Check browser console for CSS errors

### Trees not parsing
- Verify indentation uses TABS (not spaces)
- Check trees are separated by `+` on its own line
- Ensure conditions use `<=` or `>` operators
- Look for missing `Val:` prefix on leaf nodes

---

## Code Quality Standards

### File Size Limits
- Page index files: **80 lines max**
- Component files: **100 lines max**
- Hook files: **50 lines max**
- Utility functions: **30 lines per function max**

### TypeScript
- Prefer interfaces over types for object shapes
- Use type guards for discriminated unions (isLeafNode, isDecisionNode)
- Avoid `any` - use `unknown` or proper types
- Export types from `/types` directory

### React Patterns
- Functional components only
- Use hooks for side effects
- Prefer composition over inheritance
- Extract reusable logic to custom hooks
- Use Suspense + lazy for route-based code splitting

### State Management
- Use Jotai atoms for global state
- Use `atomWithStorage` for persisted state
- Derive state when possible (computed atoms)
- Keep atoms focused (single responsibility)

---

## Testing Guidelines

When implementing new features:
1. Test all user flows manually
2. Test with valid and invalid inputs
3. Test error states and edge cases
4. Verify database persistence (refresh page)
5. Check responsive design (mobile/tablet/desktop)
6. Ensure loading states are shown

**For Generate Tree:**
- Test with 1 tree, 3 trees, 10+ trees
- Test invalid FIGS format
- Test save with invalid names
- Test navigation after save

**For Review Trees:**
- Test empty state
- Test with many trees (20+)
- Test delete confirmation flow
- Test after browser refresh

---

## Related Documentation

- **FIGS Format Spec:** See `sources/gig_tree_synthesizer.html` for reference parser
- **Scoring Logic:** See `sources/gig_tree_crawl.html` for original implementation
- **Original HTML Apps:** `sources/` contains the 3 HTML files this project modernizes

---

_This file should be updated as the project evolves with new patterns and conventions._
