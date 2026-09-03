---
name: Resend inbound email routing
description: Inbound company mail is routed to Resend Receiving through the root MX record
---

# Resend inbound email routing

The root domain’s inbound mail is intentionally routed to Resend Receiving. The active MX target is `inbound-smtp.us-east-1.amazonaws.com` with priority 0; the verified `send` subdomain record is separate and must remain intact.

**Why:** The previous Spaceship MX records prevented Resend Receiving from accepting mail for the company domain.

**How to apply:** Keep the root MX on Resend when maintaining the Admin Email Manager’s receiving flow. Do not restore the old Spaceship MX records unless inbound mail is deliberately migrated back.