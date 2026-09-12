---
name: Hero carousel layout
description: Stable layout behavior for the homepage hero carousel and its statistics bar
---

The hero carousel must reserve normal-flow space for the tallest slide while rendering only the active slide visibly. The stats bar must remain after that reserved content, never as an absolute overlay that can cover a heading, description, action, or partnership details.

**Why:** The slides do not contain the same amount of content. Anchoring the stats bar to the viewport bottom made it appear stable but covered the lower part of the active slide on short screens.

**How to apply:** Keep slide panels in a shared layout grid so their intrinsic heights establish one stable content region. Let the hero grow beyond the viewport when necessary rather than clipping content or layering the stats bar over it.