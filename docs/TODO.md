# Claims Rule Engine - Development TODO

## ✅ Completed Features

### Infrastructure & Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS v4 with custom theme
- [x] Setup path aliases (`@/` imports)
- [x] Configure ESLint and TypeScript compiler
- [x] Setup git repository with proper .gitignore

### Database Layer
- [x] Implement sql.js + Drizzle ORM integration
- [x] Create database schema for trees table
- [x] Build IndexedDB persistence layer with localforage
- [x] Implement CRUD operations (create, read, delete)
- [x] Database initialization on app startup
- [x] Auto-save database to IndexedDB on changes

### Core Type System
- [x] Define Tree types (TreeNode, DecisionNode, LeafNode, Tree, TreeType)
- [x] Define Claim types (ClaimData, NormalizedClaim)
- [x] Define Trace types (TraceResult, TreePath, RiskLevel)
- [x] Implement type guards (isLeafNode, isDecisionNode)
- [x] Create risk classification utility

### Scoring Engine
- [x] Implement sigmoid transformation function
- [x] Build tree evaluation engine (evaluateNode, evaluateClaim)
- [x] Implement condition parser (<=, >, is Yes/No)
- [x] Calculate total scores from multiple trees
- [x] Compute fraud probability from scores
- [x] Classify risk levels (low/moderate/high)

### Parsers
- [x] FIGS format parser (parseFIGS)
- [x] Handle single tree parsing
- [x] Handle multiple trees separated by '+'
- [x] Extract tree titles from annotations
- [x] Recursive tree building algorithm
- [x] Error handling for malformed trees

### State Management
- [x] Setup Jotai for global state
- [x] Create trees atom (in-memory tree list)
- [x] Create selectedTree atom with persistence
- [x] Create currentClaim atom
- [x] Create claimBatch atom for bulk processing
- [x] Create traceResults atom
- [x] Create theme atom (light/dark)

### UI Components (shadcn/ui)
- [x] Button component with variants
- [x] Card component (Card, CardHeader, CardTitle, CardContent, CardFooter)
- [x] Input component with focus states
- [x] Textarea component
- [x] Label component
- [x] Badge component with variants
- [x] Utility function (cn) for class merging

### Layout Components
- [x] AppLayout - Main app wrapper with navbar
- [x] Navbar - Navigation with active route highlighting
- [x] PageHeader - Reusable page header with title, description, actions

### Shared Components
- [x] TreeVisualizer - Visual tree renderer with connecting lines
- [x] TreeNode - Recursive node component
- [x] Tree styling (CSS connectors, leaf/root/decision node colors)

### Generate Tree Page (Complete)
- [x] FIGS textarea input with syntax highlighting
- [x] Real-time parsing with 500ms debounce
- [x] Visual tree preview with TreeVisualizer
- [x] Tree type selector (Motor/Medical) with icons
- [x] Validation indicators (Valid/Invalid with icons)
- [x] Error messages for invalid trees
- [x] Load Sample button (multi-tree sample)
- [x] Tree statistics badges (tree count, leaf count)
- [x] Save dialog with name validation
- [x] Min/max length validation (3-100 chars)
- [x] Database persistence
- [x] Navigation to Review Trees after save
- [x] useTreeParser hook
- [x] useTreeSave hook
- [x] Validator utilities

### Review Trees Page (Complete)
- [x] Load trees from database on mount
- [x] Display trees in responsive grid (1/2/3 columns)
- [x] Tree cards with metadata (name, type, date, stats)
- [x] Medical/Motor badge with icons
- [x] Tree statistics (tree count, leaf nodes count)
- [x] Delete flow with confirmation (Cancel/Confirm)
- [x] Empty state with call-to-action
- [x] Loading spinner during data fetch
- [x] Error handling for failed loads
- [x] useTreeList hook
- [x] useTreeDelete hook
- [x] Navigation to Generate Tree page

---

## 🚧 In Progress

_(Nothing currently in progress)_

---

## 📋 Pending Features

### Visualize Trace Page
- [ ] Tree selector (load from saved trees)
- [ ] Input mode toggle (Form vs JSON)
- [ ] Claim form with all required fields:
  - [ ] Claim number input
  - [ ] Count of parts (number)
  - [ ] Damage location toggles (left/right/rear)
  - [ ] Vehicle origin (continent selector)
  - [ ] Estimated amount (currency input)
  - [ ] Claim ratio (decimal input)
  - [ ] Days inputs (loss to intermediation, policy start, expiry)
  - [ ] Vehicle age (number)
  - [ ] Additional fields as needed
- [ ] JSON textarea for bulk/custom input
- [ ] Form validation and error messages
- [ ] Live tree path highlighting as user inputs data
- [ ] Active node visualization (highlight path taken)
- [ ] ScoreCard component showing:
  - [ ] Total score calculation
  - [ ] Fraud probability percentage
  - [ ] Risk badge (Low/Moderate/High)
  - [ ] Score breakdown by tree
  - [ ] Visual risk indicator (color-coded)
- [ ] Export trace as PNG (html2canvas)
- [ ] Single claim mode
- [ ] Batch claims mode (multiple traces)
- [ ] useClaimEvaluation hook
- [ ] usePathTracing hook
- [ ] useImageExport hook

### Table Visualizer Page
- [ ] CSV file upload component
  - [ ] Drag and drop zone
  - [ ] File browser fallback
  - [ ] File size validation
  - [ ] CSV parsing with papaparse
- [ ] Column mapping interface
  - [ ] Auto-detect column names
  - [ ] Manual column mapping UI
  - [ ] Required field indicators
  - [ ] Preview mapped data
- [ ] Claims data table
  - [ ] Sortable columns
  - [ ] Claim number column
  - [ ] Score/probability columns
  - [ ] Risk classification column
  - [ ] Pagination for large datasets
- [ ] Row click interaction
  - [ ] Navigate to Visualize Trace page
  - [ ] Pre-fill claim data
  - [ ] Show full tree trace
- [ ] Batch scoring progress indicator
- [ ] Export results as CSV
- [ ] Filter by risk level
- [ ] useCSVParser hook
- [ ] useBatchScoring hook
- [ ] useTableNavigation hook

### Medical/Motor Theme Variants
- [ ] Define color schemes for Medical theme
  - [ ] Primary colors (purple/pink tones)
  - [ ] Accent colors
  - [ ] Background variations
- [ ] Define color schemes for Motor theme
  - [ ] Primary colors (blue/gray tones)
  - [ ] Accent colors
  - [ ] Background variations
- [ ] Theme toggle in navbar or settings
- [ ] Apply theme to all components
- [ ] Persist theme preference
- [ ] Update badges/icons based on active theme
- [ ] Smooth theme transitions

### Error Boundaries & Loading States
- [ ] Create ErrorBoundary component
- [ ] Wrap each page in ErrorBoundary
- [ ] Create error fallback UI
- [ ] Add retry mechanism
- [ ] Implement suspense boundaries
- [ ] Loading skeletons for:
  - [ ] Tree cards grid
  - [ ] Tree preview
  - [ ] Data tables
  - [ ] Forms
- [ ] Global loading indicator
- [ ] Network error handling
- [ ] Database error recovery

### Database Export/Import
- [ ] Export database as .sqlite file
  - [ ] Download button in settings/navbar
  - [ ] Generate blob from sql.js database
  - [ ] Trigger browser download
- [ ] Import database from .sqlite file
  - [ ] File upload interface
  - [ ] Validate file format
  - [ ] Replace current database
  - [ ] Confirmation dialog
- [ ] Export individual trees as JSON
- [ ] Import trees from JSON
- [ ] Backup/restore functionality
- [ ] Clear all data option

### Additional Features
- [ ] Search/filter trees in Review Trees page
- [ ] Sort trees by name/date/type
- [ ] Edit tree name after creation
- [ ] Duplicate tree functionality
- [ ] Tree version history
- [ ] Keyboard shortcuts (Cmd+K for search, etc.)
- [ ] Dark mode toggle
- [ ] User preferences/settings page
- [ ] Help/documentation tooltips
- [ ] Onboarding tour for new users

### Testing & Polish
- [ ] Manual testing of all flows
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] Performance optimization
  - [ ] Code splitting
  - [ ] Lazy loading
  - [ ] Memoization where needed
- [ ] Accessibility audit (a11y)
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] ARIA labels
  - [ ] Focus management
- [ ] Error message consistency
- [ ] Loading state consistency
- [ ] Animation/transition polish
- [ ] Final UI/UX review

### Documentation
- [ ] Update README.md with:
  - [ ] Project overview
  - [ ] Installation instructions
  - [ ] Usage guide
  - [ ] Feature list
  - [ ] Development setup
- [ ] Add inline code comments for complex logic
- [ ] Create user guide
- [ ] Add examples and screenshots
- [ ] Document FIGS format specification
- [ ] API documentation for scoring engine

---

## 📊 Progress Summary

**Completed:** 67 tasks
**Pending:** 94 tasks
**Total:** 161 tasks

**Completion:** ~42%

---

## 🎯 Next Sprint Priority

1. **Visualize Trace Page** - Core feature for claim evaluation
2. **ScoreCard Component** - Visual fraud probability display
3. **Table Visualizer Page** - Bulk claim processing
4. **Medical/Motor Themes** - Visual polish and branding
5. **Error Boundaries** - Production stability

---

_Last Updated: 2025-10-23_
