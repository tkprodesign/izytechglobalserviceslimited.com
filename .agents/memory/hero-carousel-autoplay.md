---
name: Hero carousel autoplay
description: The full-screen hero carousel must not pause on pointer hover or disable autoplay when reduced motion is enabled.
---

Keep autoplay independent from pointer hover and reduced-motion preferences; use reduced motion to shorten or remove transitions, not to stop slide changes.

**Why:** The hero occupies the initial viewport, so hover-pausing made desktop autoplay appear broken, while the preview’s reduced-motion setting separately prevented any timer from starting.

**How to apply:** Reserve pausing for the explicit carousel control and intentional keyboard-focus behavior, and verify the timer in a reduced-motion preview.