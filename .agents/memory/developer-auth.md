---
name: Developer authentication
description: The developer panel uses a dedicated mailbox credential rather than the INFO notification account
---

The developer panel must authenticate with `developer@izytechglobalservices.com` and its dedicated password. `INFO_EMAIL` is reserved for company notifications and must not grant developer access.

**Why:** Separating panel access from the shared notification mailbox prevents an operational inbox credential from becoming an application administrator credential.

**How to apply:** Keep the developer address in `DEVELOPER_EMAIL` and its password in `DEVELOPER_EMAIL_PASSWORD`; preserve `INFO_EMAIL` for notification recipients and mail routing.

Technical control-panel tools, including email management and system tooling, are developer-only at both the frontend route and backend API layers. Admins retain business and content management access.

**Why:** An operations admin needs to manage business content without access to infrastructure-level tools or company-wide mailboxes.

**How to apply:** Keep technical navigation under the developer section and protect matching `/dev/*` frontend routes and `/api/dev/*` backend routes with the developer-role guard.