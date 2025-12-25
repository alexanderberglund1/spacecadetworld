---
layout: post.njk
title: "2025-12-23 — first prototype "
date: 2025-12-23
---

Patch 0.2: Got the first playable version running. Nothing fancy.

---

## What exists now

- N-body gravity
- Fixed time step that behaves most of the time
- Camera follow and simple inspection

---

## Problems

- Scale handling is fragile when zooming far out
- UI readability collapses at extreme zoom
- Defaults are still guesswork

---

## Next

- Orbit prediction, even if inaccurate
- Velocity vectors that don’t clutter the screen
- Better rules for scale and camera limits