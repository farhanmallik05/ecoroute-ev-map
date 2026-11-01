# Design System: EcoRoute EV Intelligent Corridor & Elevation Planner

## 1. Visual Theme & Atmosphere
A high-precision, dark-tech cartographic interface designed for high-altitude EV corridor intelligence. The visual atmosphere balances the clinical discipline of Swiss topographical charts with the luxury minimalism of modern aerospace telemetry.
- **Density:** Cockpit Balanced (Density: 5) — High information density in floating panels without obstructing the primary cartographic canvas.
- **Variance:** Offset Asymmetric (Variance: 7) — Left-anchored floating telemetry drawers offset against a dominant 3D geospatial canvas and bottom elevation splines.
- **Motion:** Fluid Spring Physics (Motion: 6) — Natural mass-based damping (`stiffness: 120, damping: 18`) for drawer expansions, modal transitions, and stall occupancy updates.

## 2. Color Palette & Roles
- **OLED Void** (`#06080d`) — Base cartographic atmosphere and deep canvas background
- **Machined Graphite** (`#0e131f`) — Outer bezel container shell and backdrop blur substrate
- **Titanium Surface** (`#141b2d`) — Inner card core fill and modal dialog surfaces
- **Emerald Pulse** (`#10b981`) — Primary brand accent for available chargers, eco-savings, and battery health
- **Mint Radiance** (`#34d399`) — High-contrast secondary accent for active routes and highlights
- **Amber Warning** (`#f59e0b`) — Stall queue delay warning and high elevation grade indicators
- **Crimson Critical** (`#ef4444`) — Severe cold-weather range degradation (<20°F) and occupied stall alerts
- **Ghost Hairline** (`rgba(255, 255, 255, 0.08)`) — 1px structural borders and double-bezel concentric rings
- **Inner Refraction** (`rgba(255, 255, 255, 0.12)`) — Subtle inner top highlight shadow simulating edge glass bevels

*(Rule: Strictly one primary accent color for active states. Saturation locked < 80%. Pure black #000000 strictly banned.)*

## 3. Typography Rules
- **Display / Headers:** `Plus Jakarta Sans`, SemiBold (600) to ExtraBold (800) with `-0.03em` tracking-tight. High presence, controlled line-height (`leading-[1.1]`).
- **Body / Interface:** `Plus Jakarta Sans`, Regular (400) to Medium (500), `leading-relaxed`, max 65 characters per line.
- **Telemetry & Numbers:** `JetBrains Mono` with `tabular-nums` for all elevation feet, battery percentages, charging rates (kW), and queue wait times.
- **Banned:** Generic browser system fonts, unstyled Inter, generic serif fonts in UI controls.

## 4. Component Stylings
- **The Double-Bezel (Doppelrand):**
  - *Outer Shell:* `p-1.5 rounded-[1.75rem] bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-2xl shadow-2xl`
  - *Inner Core:* `rounded-[calc(1.75rem-0.375rem)] bg-[#0e131f]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] p-5`
- **Floating Island Navigation:** Detached from viewport top (`mt-4 mx-auto w-max rounded-full border border-white/10 bg-[#0e131f]/85 backdrop-blur-xl px-5 py-2.5 shadow-2xl`).
- **Nested Island Buttons:** Fully rounded pills (`rounded-full px-5 py-2.5 font-medium`) with trailing icon nested in its own discrete circular enclosure (`w-7 h-7 rounded-full bg-white/10 flex items-center justify-center`). Tactile active push: `active:scale-[0.98]`.
- **Elevation Spline Graph:** Smooth cubic Bezier spline with gradient fill (`from-emerald-500/25 via-emerald-500/5 to-transparent`), hover crosshair pins, and grade color coding.
- **Stall Status Badges:** Hardware indicator badges (`AVAILABLE_NOW`, `SHORT_WAIT`, `HIGH_DEMAND`) with glowing live pulse pings.

## 5. Layout Principles
- **Spatial Separation:** Map occupies 100% viewport (`min-h-[100dvh]`). Controls float on systemic z-index layers with safe padding (`p-4 md:p-6`).
- **Asymmetric Balance:** Primary route planning drawer docked to left (`w-96 max-w-[calc(100vw-2rem)]`), analytics HUD floating top-right, elevation profile docked bottom-center.
- **Mobile Graceful Degradation (< 768px):** All floating drawers collapse to swipeable bottom sheet panels with full width (`w-full`) and touch-safe targets (≥ 44px).

## 6. Motion Philosophy
- Custom timing functions: `cubic-bezier(0.32, 0.72, 0, 1)`.
- GPU-accelerated transforms (`transform`, `opacity`) strictly. Never animate `top`, `left`, `width`, or `height`.
- Micro-interactions: Live pulse animations on charging station pins and subtle status badges.

## 7. Anti-Patterns (Banned)
- ❌ No `#000000` pure black background
- ❌ No default AI purple/blue gradient buttons
- ❌ No unstyled default HTML range sliders
- ❌ No layout jumping on mobile (`min-h-[100dvh]` enforced)
- ❌ No circular loading spinners — sleek skeleton shimmers only

