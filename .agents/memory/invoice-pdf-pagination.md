---
name: Invoice PDF pagination
description: Durable constraints for the shared customer invoice and manager/Alternative Bank PDF layouts
---

Both customer invoices and manager/Alternative Bank PDFs use the same server-side PDF generator, with the manager version changing the recipient block. Large invoices must paginate explicitly: reserve the footer area, check each row before drawing, repeat a compact continuation/table header, and keep totals and payment details in safe blocks.

**Why:** PDFKit can implicitly create pages when text overflows, which separates row backgrounds and table flow from the actual text. Its width-based text wrapper can also create blank trailing pages when footer text is drawn after switching between buffered pages.

**How to apply:** Keep row and section coordinates below the reserved footer boundary. For buffered-page footers, calculate centered/right-aligned x positions manually and use non-wrapping text without a width wrapper. Test both customer and manager PDF paths with many items and verify page count, continuation markers, final items, totals, and no blank pages.