---
name: Invoice PDF pagination
description: Durable requirements for customer and Alternative Bank invoice PDFs, optional customer contacts, and pagination
---

Both customer invoices and manager/Alternative Bank PDFs use the same server-side PDF generator, with the manager version changing the recipient block. Large invoices must paginate explicitly: reserve the footer area, check each row before drawing, repeat a compact continuation/table header, and keep totals and payment details in safe blocks.

Customer email and phone are optional invoice fields. Omit missing contact lines from both the customer invoice and Alternative Bank PDF, and only offer/send invoice email when an address is present. This decision was confirmed by the CEO on 2026-09-25.

**Why:** The CEO wants invoices to be usable when customers do not provide contact details. PDFKit can also implicitly create pages when text overflows, separating row backgrounds from text; width-wrapped footer text can create blank trailing pages on buffered pages.

**How to apply:** Keep row and section coordinates below the reserved footer boundary. For buffered-page footers, calculate centered/right-aligned x positions manually and use non-wrapping text without a width wrapper. Test both customer and manager PDF paths with and without customer email/phone, and with many items; verify page count, continuation markers, final items, totals, and no blank pages.