# Design System: MarsWalk Explorer (Stitch Edition)

## 1. Visual Theme & Atmosphere
A restrained, high-density aerospace mission control interface built with asymmetric dual-zone hierarchy and perpetual micro-telemetry. The atmosphere is clinical, tactile, and deeply atmospheric—reminiscent of the JPL Mars 2020 Mission Control combined with a modern astronautics flight computer. Deep carbon-zinc canvas, whisper-thin borders, and a single calibrated Mars vermilion accent.

- **Density:** 8/10 (Cockpit Dense — mission-critical telemetry, precise numbers, monospace figures)
- **Variance:** 7/10 (Offset Asymmetric — split cockpit hero, structured dual-zone layout, zero centered generic templates)
- **Motion:** 6/10 (Fluid Spring Physics — `stiffness: 120, damping: 22`, perpetual telemetry pulses, tactile push states)

---

## 2. Color Palette & Roles
- **Deep Space Carbon** (`#07080B`) — Primary global background canvas (never pure `#000000`)
- **Cockpit Glass Surface** (`#0E1117`) — Container, card, and modular console background with 85% opacity backdrop blur
- **Tactical Surface Surface** (`#151922`) — Active selection states, hover tiers, and nested instrument bays
- **Mars Vermilion Accent** (`#F25C3B`) — Primary focal accent, active target markers, laser reticles, critical action triggers (saturation < 80%)
- **MOLA Gold / Amber** (`#F5A623`) — Elevation readings, sol calendar indicators, celestial coordinates
- **Cyber Cyan** (`#00E5BA`) — Real-time atmospheric pressure, life support telemetry, active communication links
- **Primary Chalk** (`#F3F4F6`) — Primary headlines, high-contrast display text
- **Muted Regolith** (`#9CA3AF`) — Secondary descriptive copy, scientific annotations (max 65ch per line)
- **Whisper Line** (`rgba(255, 255, 255, 0.08)`) — Structural dividers, 1px reticle grids, bounding frames

---

## 3. Typographic Architecture
- **Display Headlines:** `Rajdhani` / `Orbitron` — Track-tight (`tracking-tight`), uppercase, weight-driven hierarchy (600/700/800).
- **Body & Editorial:** `Space Grotesk` / sans-serif — Relaxed leading, maximum 65 characters per line, clean spatial padding.
- **Data & Telemetry:** `JetBrains Mono` / monospace — Used strictly for all coordinates, sol dates, pressures, elevations, wavelengths, and sensor readouts.
- **Inline Image Typography:** Contextual micro-visuals (curated 20px-32px Martian geological swatches and rover optics) embedded inline within headlines to punctuate key phrases.
- **Banned:** `Inter` in creative headings, generic serif fonts, oversized center-aligned generic headlines.

---

## 4. Component Stylings
- **Buttons:** Tactile `-1px` translate with active scale down (`active:scale-[0.98]`). Primary buttons use calibrated gradient without neon blowouts. Secondary buttons use cockpit glass with whisper borders.
- **Flight Computer Deck:** Asymmetric dual-zone card with live interactive destination switcher, instant coordinate feed, high-res orbital preview, and fly-to triggers.
- **Telemetry HUD Pills:** Horizontal or grid micro-badges with 1px border, monospace data, and pulsing live sensor pings.
- **System Feature Blocks:** Asymmetric 2-column or 4-bay tactical grid with icon badges, technical parameter list, and micro-hover elevation.

---

## 5. Layout Principles
- **Asymmetric Split Hero:** 60/40 desktop split. Left column anchors mission identity, inline typography, and primary flight triggers. Right column houses the interactive Tactical Surface Computer.
- **Clean Spatial Zones:** Zero overlapping text or absolute chaos. Every widget has a distinct coordinate and border container.
- **Mobile Collapse (< 768px):** Clean single-column vertical flow with full touch target compliance (min 44px) and zero horizontal overflow.
- **No Filler Clichés:** No "Scroll down to explore", bouncing chevrons, or fake statistics.

---

## 6. Motion & Interaction
- Spring physics on all interactive element transitions (`stiffness: 140, damping: 20`).
- Perpetual micro-animations: Live blinking chronometer dot, scanning radar sweep, subtle orbital float.
- Hardware-accelerated CSS transforms (`transform`, `opacity`) for smooth 60fps responsiveness.
