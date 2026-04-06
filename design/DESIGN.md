# Design System Specification: Editorial Financial Intelligence

## 1. Overview & Creative North Star
### The Creative North Star: "The Architectural Ledger"
In corporate finance, clarity is often mistaken for austerity. This design system rejects the "flat blue dashboard" trope in favor of **The Architectural Ledger**. We treat data with the reverence of a high-end editorial publication, blending the precision of financial reporting with the sophisticated depth of modern architecture. 

The system moves beyond standard templates through **Intentional Asymmetry** and **Tonal Depth**. By utilizing a sophisticated layering of whites and cool grays, we create a sense of physical space. Data is not just displayed; it is "housed" within a structured environment that feels authoritative, premium, and human-centric.

---

## 2. Color & Surface Strategy
Our palette is rooted in a "Global White" philosophy, using a sophisticated range of surface tones to define hierarchy without the "clutter" of traditional borders.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** Within this system, 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
*   **Implementation:** To separate a sidebar from a main content area, use `surface-container-low` (#f6f3f2) against the `surface` (#fcf9f8) background.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of heavy-stock vellum. Use the following tiers to create "nested" depth:
*   **Canvas:** `surface` (#fcf9f8) – The foundation.
*   **Sectioning:** `surface-container-low` (#f6f3f2) – Secondary zones or sidebars.
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) – Primary content nodes.
*   **Active Overlays:** `surface-bright` (#fcf9f8) – Elevated elements.

### The "Glass & Gradient" Rule
To elevate the "Corporate Finance" aesthetic, floating elements (modals, dropdowns) should utilize **Glassmorphism**. 
*   **Token Usage:** Use `surface` at 80% opacity with a `24px` backdrop-blur. 
*   **Signature Textures:** For high-value CTAs or data highlights, use a subtle linear gradient from `primary` (#003d9b) to `primary_container` (#0052cc) at a 135-degree angle. This provides a "liquid ink" depth that flat hex codes lack.

---

## 3. Typography: The Editorial Scale
We leverage the system's native Inter-type stacks to ensure performance, but we apply an editorial hierarchy that favors dramatic scale shifts.

*   **Display (Display-LG/MD):** Used for "Big Numbers" and high-level KPIs. These should feel like headlines in a financial journal—bold and authoritative.
*   **Headline (Headline-SM):** Used for section titles. Pair these with generous top-padding to create "breathing room."
*   **Monospace for Data:** All tabular data, currency, and percentages must utilize a monospace font-variant-numeric (tabular-nums) to ensure vertical alignment of decimal points.
*   **The Hierarchy Rule:** Never use two font sizes that are adjacent in the scale (e.g., Title-MD and Title-LG) in the same component. Jump a level to ensure the eye understands the hierarchy immediately.

---

## 4. Elevation & Depth
Traditional drop shadows are too "software-generic." We use **Ambient Shadows** and **Tonal Layering**.

### The Layering Principle
Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural lift. This is our preferred method of elevation.

### Ambient Shadows
When a floating effect is required (e.g., a "Command Palette" or "Floating Action Menu"):
*   **Blur:** 32px to 64px.
*   **Opacity:** 4% - 8%.
*   **Color:** Use a tinted version of `on_surface` (#1c1b1b) rather than pure black to mimic natural light.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input fields), use a **Ghost Border**:
*   **Token:** `outline_variant` (#c3c6d6) at **15% opacity**. 
*   **Strict Rule:** 100% opaque, high-contrast borders are forbidden as they "trap" the data and make the interface feel dated.

---

## 5. Components

### Buttons
*   **Primary:** Linear gradient (`primary` to `primary_container`), `rounded-md` (4px), with a subtle white inner-glow (1px, 10% opacity) on the top edge.
*   **Tertiary:** No background, `primary` text. Interaction is signaled by a `surface-container-high` background shift on hover.

### Input Fields
*   **Styling:** `surface-container-lowest` background, `rounded-sm` (4px) corners. 
*   **State:** On focus, the "Ghost Border" transitions to 100% `primary` opacity, but only at 1px thickness.

### Cards & Data Lists
*   **No Dividers:** Forbid the use of horizontal divider lines. Use `16px` or `24px` of vertical whitespace (the "Gutter") to separate list items.
*   **Selection:** Active states are indicated by a `2px` vertical "accent bar" of `primary` color on the left edge of the container, rather than a full background fill.

### Additional Signature Component: The "Data Sheet"
A specialized container for financial tables. It uses a `surface-container-low` header row and alternating `surface` and `surface-container-lowest` rows. No vertical lines.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme whitespace. If a section feels "finished," add 16px more padding.
*   **Do** use `secondary` (#4c5d8d) for labels to create a sophisticated tonal contrast against `on_surface` values.
*   **Do** ensure all "Money" values use `label-md` or `body-md` in Monospace for perfect alignment.

### Don't:
*   **Don't** use pure black (#000000). Use `on_surface` (#1c1b1b) to keep the aesthetic "ink-like" and premium.
*   **Don't** use shadows to define cards. Use background color shifts.
*   **Don't** use 8px rounding on inputs. Keep them at 4px (`rounded-sm`) to maintain a "sharp" professional edge, while reserving 8px (`rounded-lg`) for larger widgets.