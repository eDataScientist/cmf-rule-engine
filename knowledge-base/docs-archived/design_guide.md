# **ClaimsEngine: Master Design Specification**

**Aesthetic Target:** Technical Dark / Engineering-Grade (Vercel/Linear Style)

This document outlines the comprehensive UI/UX overhaul for ClaimsEngine, transitioning from a "Bootstrapped" component-library look to a high-density, professional engineering tool aesthetic.

## **1\. Global Design System ("The Zinc Protocol")**

**Philosophy:** High density, low noise. The interface recedes; the data advances.

### **Color Palette (Dark Mode Only)**

We utilize a monochromatic scale with intentional, functional accents.

* **Canvas (--bg-app):** \#09090b (Zinc-950) — The deepest background layer.  
* **Panels/Sidebars (--bg-panel):** \#18181b (Zinc-900) — Secondary layer for navigation and cards.  
* **Borders (--border-subtle):** \#27272a (Zinc-800) — The primary method of separation (replacing drop shadows).  
* **Interactive Elements:** \#27272a default, \#3f3f46 (Zinc-700) on hover.

### **Typography Strategy**

Strict separation between interface text and data values.

* **Interface Font:** Inter (or Geist Sans).  
  * Used for Navigation, Labels, and Body text.  
  * Weights: Regular (400) and Medium (500).  
* **Data Font:** JetBrains Mono (or Geist Mono).  
  * **Mandatory** for: IDs, Financial figures, Dates, Dimensions, and Risk Scores.  
  * This ensures tabular alignment and a "technical" feel.

### **Structural Rules**

* **Borders \> Shadows:** Depth is created by 1px borders, not soft drop shadows.  
* **Compact Inputs:** Input fields are 32px high with dark backgrounds (\#000) and thin borders.  
* **Radius:** 6px maximum for containers; 4px for inner elements.

## **2\. Dashboard: Decision Trees**

**Goal:** Transform "Cards" into a high-density "Data Grid."

### **Layout & Navigation**

* **Command Rail (Sidebar):** Fixed left sidebar (240px). Contains Navigation links and User Profile (anchored at the bottom).  
  * *Background:* Zinc-900.  
* **Sticky Header:** Height 56px. Contains Breadcrumbs (Claims / Decision Trees) and Primary Action (+ New Tree).  
  * *Interaction:* Includes Cmd+K global search trigger.

### **The Data Grid**

Replaces large white cards with a tight table structure to maximize information density.

* **Columns:**  
  1. **Tree Name:** Primary identifier.  
  2. **Type:** Badge (Outline style, not solid fill).  
  3. **Complexity:** Branch/Leaf count (Monospace font).  
  4. **Last Edited:** Date (Monospace font).  
  5. **Actions:** ... Context menu.  
* **Visuals:** Rows separated by 1px borders. Hovering a row highlights it in Zinc-900.

## **3\. The Visualizer: Infinite Canvas**

**Goal:** Replace pagination with an interactive, pan-and-zoom interface that respects the data topology.

### **The Canvas Environment**

* **Viewport:** Full-screen area (minus header).  
* **Background:** Zinc-950 with a subtle **Dot Grid pattern** (Zinc-800 dots) to indicate scale and "space".  
* **Interaction:** Infinite scrolling/panning. Cursor defaults to "Grab" hand.

### **Floating Controls**

* **Zoom Toolbar:** Floating pill container at the bottom-right.  
  * Controls: \- / Percentage / \+ / Fit to Screen.  
* **Minimap (Optional):** Small overlay at top-right showing the macro view of the tree structure.

## **4\. Evaluation Runner (Test Environment)**

**Goal:** Unify Input and Output into a single "IDE-like" workspace.

### **Layout Strategy: Split Screen**

* **Left Panel (Inspector):** Fixed width (320px-360px). Contains the Input Form.  
* **Right Panel (Results Canvas):** Flexible width. Contains the Tree Visualizer and Results.

### **Left Panel (The Inspector)**

* **Grouping:** Inputs are grouped logically (Identity, Features, Timing).  
* **Styling:** Dark technical inputs. Boolean checkboxes are grouped horizontally to save vertical space.  
* **Footer:** "Run Evaluation" button is fixed/sticky at the bottom of this panel.

### **Right Panel (The Results HUD)**

* **Sticky Header:** A "Heads Up Display" bar at the top replaces the old summary card.  
  * **Metrics:** Displays Fraud Probability (Bold), Score (Mono), and Risk Level (Badge) in a single horizontal row.  
* **The Trees:**  
  * **Visual Style:** White Cards (User Preference preserved).  
  * **Integration:** Cards float on the dark dot-grid canvas.  
  * **Refinement:** 1px gray border, subtle shadow. Internal connecting lines use sharp 90-degree angles.

## **5\. Datasets Registry**

**Goal:** Move from a "Consumer File Uploader" aesthetic to a "Professional Data Registry."

### **List View**

* **Structure:** Removes the "Card inside a Card" layout. Files sit directly on the background.  
* **Metadata Density:**  
  * **Dimensions Column:** Displays Row x Col count (e.g., 100R x 125C) in Monospace font.  
  * **Source/Tags:** Small text badges (Egypt, GIG) with borders.  
  * **Status:** Text status (Ready) with a color-coded indicator dot.  
* **Empty State:** Subtle dashed-border drop zone. No full-screen illustrations.

## **6\. Ingestion Flow (Upload Modal)**

**Goal:** Allow data upload without losing context (Page → Modal).

### **Modal Structure**

* **Context:** Triggers a **Centered Modal Dialog** with a backdrop blur overlay.  
* **Header:** Simple title "Ingest New Dataset".

### **Form Layout (2-Column Grid)**

* **Drop Zone:** Compact, wide dashed area. Displays supported formats (CSV, PARQUET) as small badges.  
* **Input Fields:**  
  * **Row 1:** Dataset Nickname (New field) \+ Insurance Company.  
  * **Row 2:** Region \+ Uploader Email (Read-only, visually dimmed).  
* **Footer:**  
  * **Primary Action:** "Begin Ingestion" (Rectangular button, White background, Black text).  
  * **Secondary:** "Cancel" (Ghost button).