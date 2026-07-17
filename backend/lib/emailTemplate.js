/**
 * IZY Technologies — Branded HTML Email Template
 * Usage: buildEmail({ subject, preheader, bodyHtml, footerNote })
 */

function buildEmail({ subject = '', preheader = '', bodyHtml = '', footerNote = '' } = {}) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${escHtml(subject)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
    body{margin:0;padding:0;background:#f0f3f8;font-family:'Inter',Arial,sans-serif}
    .wrapper{background:#f0f3f8;padding:40px 16px}
    .container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(4,22,39,0.08)}
    .header{background:#041627;padding:32px 40px;text-align:center}
    .logo-badge{display:inline-flex;align-items:center;gap:12px}
    .logo-box{width:44px;height:44px;background:#1a56db;border-radius:10px;display:inline-block;line-height:44px;text-align:center;font-weight:700;font-size:14px;color:#ffffff;letter-spacing:0.5px;vertical-align:middle}
    .logo-text{font-size:18px;font-weight:700;color:#ffffff;vertical-align:middle;letter-spacing:-0.3px}
    .logo-sub{font-size:11px;color:#8fadc8;letter-spacing:0.5px;text-transform:uppercase;display:block;margin-top:2px}
    .accent-bar{height:4px;background:linear-gradient(90deg,#F0A20E 0%,#f6c24a 50%,#1a56db 100%)}
    .body{padding:40px}
    .greeting{font-size:22px;font-weight:700;color:#041627;margin:0 0 8px 0}
    .body-text{font-size:15px;line-height:1.7;color:#3a4a5c;margin:0 0 20px 0}
    .divider{border:none;border-top:1px solid #eef1f6;margin:28px 0}
    .cta-btn{display:inline-block;background:#1a56db;color:#ffffff !important;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.2px}
    .info-box{background:#f8faff;border:1px solid #dce8ff;border-radius:10px;padding:20px 24px;margin:20px 0}
    .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eef1f6;font-size:13px}
    .info-row:last-child{border-bottom:none}
    .info-label{color:#5a6a82;font-weight:500}
    .info-value{color:#041627;font-weight:600;text-align:right}
    .footer{background:#f8f9fb;border-top:1px solid #eef1f6;padding:28px 40px;text-align:center}
    .footer-logo{font-size:13px;font-weight:700;color:#041627;margin:0 0 6px 0}
    .footer-text{font-size:12px;color:#8fadc8;line-height:1.6;margin:0 0 16px 0}
    .footer-links{margin-bottom:12px}
    .footer-links a{font-size:12px;color:#1a56db;text-decoration:none;margin:0 8px}
    .footer-fine{font-size:11px;color:#aabaca;margin:0}
    .social-icons{margin:16px 0 0}
    @media only screen and (max-width:600px){
      .body{padding:28px 24px}
      .header{padding:24px}
      .footer{padding:24px}
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escHtml(preheader)}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>` : ''}
  <div class="wrapper">
    <table class="container" role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <!-- Header -->
      <tr>
        <td class="header">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="text-align:center">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
                  <tr>
                    <td>
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="logo-box">IZY</td>
                          <td style="width:12px"></td>
                          <td>
                            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;font-family:'Inter',Arial,sans-serif;letter-spacing:-0.3px">IZY Technologies</p>
                            <p style="margin:4px 0 0;font-size:11px;color:#8fadc8;font-family:'Inter',Arial,sans-serif;letter-spacing:0.5px;text-transform:uppercase">Global Services Limited</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Accent bar -->
      <tr><td class="accent-bar"></td></tr>
      <!-- Body -->
      <tr>
        <td class="body">
          ${bodyHtml}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td class="footer">
          <p class="footer-logo">IZY Technologies Global Services Limited</p>
          <p class="footer-text">
            Nigeria's premier energy solutions provider.<br/>
            Solar energy systems · Smart homes · Industrial wiring
          </p>
          <div class="footer-links">
            <a href="https://izytechglobalservices.com">Website</a>
            <a href="https://izytechglobalservices.com/#contact">Contact</a>
            <a href="https://izytechglobalservices.com/#services">Services</a>
          </div>
          ${footerNote ? `<p class="footer-fine">${escHtml(footerNote)}</p>` : ''}
          <p class="footer-fine" style="margin-top:8px">© ${new Date().getFullYear()} IZY Technologies Global Services Limited. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

function escHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/**
 * Pre-built template variants
 */
function contactAutoReply({ name, subject, message }) {
  return buildEmail({
    subject: `We've received your message — IZY Technologies`,
    preheader: `Thanks for reaching out, ${name}. We'll be in touch shortly.`,
    bodyHtml: `
      <h2 class="greeting">Hi ${escHtml(name)}, 👋</h2>
      <p class="body-text">Thank you for contacting <strong>IZY Technologies Global Services Limited</strong>. We've received your message and our team will get back to you within <strong>24–48 hours</strong>.</p>
      <div class="info-box">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          ${subject ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Subject</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(subject)}</span></td></tr>` : ''}
          <tr><td colspan="2" style="padding-top:12px"><p style="font-size:13px;color:#5a6a82;font-weight:500;margin:0 0 6px">Your message</p><p style="font-size:13px;color:#041627;line-height:1.6;margin:0;white-space:pre-wrap">${escHtml(message)}</p></td></tr>
        </table>
      </div>
      <hr class="divider"/>
      <p class="body-text" style="font-size:13px">While you wait, explore our services or call us directly:</p>
      <p class="body-text" style="font-size:13px">📞 <a href="tel:+2348101262814" style="color:#1a56db">+234 810 126 2814</a></p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td><a href="https://izytechglobalservices.com/#services" class="cta-btn">Explore Our Services →</a></td></tr></table>
    `,
  });
}

function quoteAutoReply({ name, service, company }) {
  return buildEmail({
    subject: `Your quote request is received — IZY Technologies`,
    preheader: `We've received your quote request for ${service}. Expect a response within 24–48 hours.`,
    bodyHtml: `
      <h2 class="greeting">Hi ${escHtml(name)}, 👋</h2>
      <p class="body-text">Thank you for your quote request. Our team has received your enquiry and will prepare a tailored proposal within <strong>24–48 hours</strong>.</p>
      <div class="info-box">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Service</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(service)}</span></td></tr>
          ${company ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Company</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(company)}</span></td></tr>` : ''}
          <tr><td style="padding:8px 0"><span style="font-size:13px;color:#5a6a82;font-weight:500">Status</span></td><td style="padding:8px 0;text-align:right"><span style="font-size:12px;font-weight:600;color:#1a56db;background:#dce8ff;padding:3px 10px;border-radius:20px">Under Review</span></td></tr>
        </table>
      </div>
      <hr class="divider"/>
      <p class="body-text" style="font-size:13px">Questions in the meantime? Reach us directly:</p>
      <p class="body-text" style="font-size:13px">📞 <a href="tel:+2348101262814" style="color:#1a56db">+234 810 126 2814</a></p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td><a href="https://izytechglobalservices.com" class="cta-btn">Visit Our Website →</a></td></tr></table>
    `,
  });
}

function customEmail({ toName, greeting, bodyHtml: body, ctaLabel, ctaUrl }) {
  return buildEmail({
    subject: '',
    bodyHtml: `
      <h2 class="greeting">${escHtml(greeting || `Hi ${toName || 'there'},`)}</h2>
      <div class="body-text">${body || ''}</div>
      ${ctaLabel && ctaUrl ? `<hr class="divider"/><table role="presentation" cellpadding="0" cellspacing="0"><tr><td><a href="${escHtml(ctaUrl)}" class="cta-btn">${escHtml(ctaLabel)} →</a></td></tr></table>` : ''}
    `,
  });
}

module.exports = { buildEmail, contactAutoReply, quoteAutoReply, customEmail };
