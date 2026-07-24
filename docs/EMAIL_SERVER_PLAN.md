# Self-Hosted Email Server Plan

## Overview

A free-forever custom email infrastructure for IZY Technologies, replacing Spacemail.
All five domain mailboxes remain fully accessible via IMAP so the admin/dev email console continues to work without code changes.

---

## Architecture

```
Inbound mail flow:
Other mail servers → port 25 → Oracle VM (Postfix) → Dovecot (IMAP) → backend (imapflow)

Outbound mail flow:
Backend (nodemailer) → port 587 → Brevo SMTP relay → recipients
```

| Layer | Service | Cost |
|---|---|---|
| Server | Oracle Cloud Always Free VM (ARM or x86) | Free forever |
| Mail stack | Mailcow (Docker — Postfix + Dovecot + webmail + anti-spam) | Free (self-hosted) |
| Outbound relay | Brevo free tier (300 emails/day) | Free forever |
| DNS / domain | Your existing domain + Cloudflare DNS | Domain renewal only |

---

## Why This Combination

- **Oracle Free VM**: inbound port 25 is openable via security list rules; only *outbound* port 25 is blocked by Oracle to prevent spam.
- **Brevo relay**: sidesteps the outbound port 25 block — nodemailer connects to Brevo on port 587, Brevo delivers to recipients over port 25 from their own IPs.
- **Mailcow**: easiest all-in-one Docker mail stack — Postfix (receive), Dovecot (IMAP), SOGo (webmail), ClamAV, rspamd. One install script.
- **No code changes needed**: backend already uses imapflow (IMAP) and nodemailer (SMTP) — just swap credentials.

---

## Mailboxes to Create

| Address | Backend env var | Purpose |
|---|---|---|
| info@izytechglobalservices.com | `INFO_EMAIL` | General enquiries |
| admin@izytechglobalservices.com | `ADMIN_EMAIL` | Admin panel access |
| careers@izytechglobalservices.com | `CAREERS_EMAIL` | Job applications |
| sales@izytechglobalservices.com | `SALES_EMAIL` | Sales enquiries |
| support@izytechglobalservices.com | `SUPPORT_EMAIL` | Customer support |
| noreply@izytechglobalservices.com | `NOREPLY_EMAIL` | Outbound only (Brevo) |

---

## Setup Steps (When Ready)

### 1. Provision Oracle Cloud VM
- Sign up at cloud.oracle.com (free account, credit card required for verification — not charged)
- Create an **Always Free** Compute instance (Ubuntu 22.04 LTS recommended, ARM shape)
- Note the public IP address

### 2. Configure DNS
Add these records to your domain (Cloudflare DNS):

```
MX    @    mail.izytechglobalservices.com    priority 10
A     mail  <Oracle VM public IP>
TXT   @    "v=spf1 include:sendinblue.com ~all"          ← SPF (Brevo handles sending)
```

DKIM and DMARC records come after Mailcow is installed (it generates the DKIM key).

### 3. Open Port 25 on Oracle
In Oracle Cloud Console → Networking → VCN → Security Lists:
- Add ingress rule: TCP port 25, source 0.0.0.0/0
- Also open ports: 80, 443, 587, 993, 995

### 4. Install Mailcow on the VM
```bash
# SSH into Oracle VM
ssh ubuntu@<oracle-vm-ip>

# Install Docker
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone Mailcow
cd /opt
sudo git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized

# Generate config (enter your mail hostname when prompted: mail.izytechglobalservices.com)
sudo ./generate_config.sh

# Start Mailcow
sudo docker compose pull
sudo docker compose up -d
```

### 5. Configure Mailcow
- Access webui at `https://mail.izytechglobalservices.com` (default login: admin / moohoo)
- Change admin password immediately
- Create the 5 mailboxes (addresses listed above)
- Copy the **DKIM public key** from Mailcow → Configuration → ARC/DKIM Keys
- Add the DKIM TXT record to Cloudflare DNS

### 6. Add DMARC Record
```
TXT   _dmarc   "v=DMARC1; p=quarantine; rua=mailto:admin@izytechglobalservices.com"
```

### 7. Set Up Brevo for Outbound
- Sign up at brevo.com (free — 300 emails/day)
- Go to SMTP & API → SMTP
- Note the SMTP credentials

### 8. Update Backend Secrets
Replace Spacemail credentials with new values in Replit Secrets:

| Secret | New value |
|---|---|
| `IMAP_HOST` | `mail.izytechglobalservices.com` |
| `IMAP_PORT` | `993` |
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `INFO_EMAIL_PASSWORD` | *(new Mailcow password)* |
| `ADMIN_EMAIL_PASSWORD` | *(new Mailcow password)* |
| `CAREERS_EMAIL_PASSWORD` | *(new Mailcow password)* |
| `SALES_EMAIL_PASSWORD` | *(new Mailcow password)* |
| `SUPPORT_EMAIL_PASSWORD` | *(new Mailcow password)* |
| `RESEND_API_KEY` | *(replace with Brevo SMTP key if using Brevo API)* |

### 9. Verify
- Send a test email to each mailbox from an external address
- Check deliverability at mail-tester.com (aim for 9+/10)
- Confirm imapflow connects and console shows inbox

---

## Ongoing Maintenance

| Task | Frequency | How |
|---|---|---|
| OS security updates | Monthly | `sudo apt update && sudo apt upgrade` |
| SSL cert renewal | Automatic | Mailcow uses Let's Encrypt (auto-renews) |
| Check spam/blocklist | Quarterly | mxtoolbox.com/blacklists |
| Brevo quota check | As needed | brevo.com dashboard |

---

## Estimated Setup Time

2–4 hours, mostly waiting for DNS to propagate (up to 48 hours, usually under 1 hour on Cloudflare).

---

## References

- [Mailcow docs](https://docs.mailcow.email)
- [Oracle Always Free resources](https://www.oracle.com/cloud/free/)
- [Brevo SMTP docs](https://developers.brevo.com/docs/smtp-auth)
- [mail-tester.com](https://www.mail-tester.com) — deliverability checker
