# Coding agent guidance

This repository uses a compass-style heading/facing/rotation convention for ships and other objects:

- **0°/360° points to North (up on screen).**
- **Angles increase clockwise**: 90° East (right), 180° South (down), 270° West (left).
- Headings and bearings are stored in **degrees** unless explicitly noted otherwise.

## How to work with headings, facing, and rotation
- When using math/trigonometry helpers (`sin`, `cos`, `atan2`, rotation matrices, vector math), convert to a math-friendly angle where 0° is +X (East) and angles increase counterclockwise:
  - `mathDeg = (90 - compassDeg) mod 360`
  - `compassDeg = (90 - mathDeg) mod 360` to convert back.
- For screen/renderer APIs that expect 0° pointing right and increase clockwise (common in 2D canvas/SVG), the same conversion applies because Y grows downward.
- Name variables explicitly (e.g., `compassHeadingDeg`, `mathAngleRad`) and keep conversions in small helpers; avoid silent frame changes.
- Normalize angles to `[0, 360)` (or `(-180, 180]` for deltas) after calculations to avoid drift.

## Expectations for contributions
- Preserve this compass-style convention for stored headings/facing/rotations; perform conversions only at boundaries (rendering, physics, AI steering, trig-heavy utilities, or external data).
- When adding new APIs that accept/return headings, facing values, or rotations, document the expected frame in comments/docstrings and add a short example mapping (0°→North, 90°→East, etc.).
- Add tests for any new conversion helpers or heading/facing/rotation math to lock in the convention.

If you are unsure which convention a piece of code uses, prefer the compass-style defaults above and add clarifying comments rather than changing stored data.
