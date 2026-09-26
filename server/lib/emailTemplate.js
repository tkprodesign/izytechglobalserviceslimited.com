/**
 * IZY Technologies — Branded HTML Email Template
 * Usage: buildEmail({ subject, preheader, bodyHtml, footerNote })
 */

const EMAIL_LOGO_URL = 'https://izytechglobalservices.com/favicon.png';
const COMPANY_LEGAL_NAME = 'Izy Technologies Global Services Limited';
const COMPANY_TAGLINE = 'Power the Future, Future-Ready Solutions, Today.';

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
    .header{background:#041627;padding:28px 40px;text-align:left}
    .logo-text{font-size:14px;font-weight:700;color:#ffffff;vertical-align:middle;letter-spacing:0.025em;text-transform:uppercase}
    .logo-sub{font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:0.18em;text-transform:uppercase;display:block;margin-top:3px}
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
              <td style="text-align:left">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0">
                  <tr>
                    <td>
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td><img src="${EMAIL_LOGO_URL}" width="36" height="36" alt="IZY Technologies" style="display:block;width:36px;height:36px" /></td>
                          <td style="width:12px"></td>
                          <td>
                            <p style="margin:0;font-size:12px;font-weight:700;color:#ffffff;font-family:'Inter',Arial,sans-serif">${COMPANY_LEGAL_NAME}</p>
                            <p style="margin:4px 0 0;font-size:9px;color:#F0A20E;font-family:'Inter',Arial,sans-serif">${COMPANY_TAGLINE}</p>
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
           <p class="footer-logo">${COMPANY_LEGAL_NAME}</p>
          <p class="footer-text">
             ${COMPANY_TAGLINE}<br/>
            Solar energy systems · Smart homes · Industrial wiring
          </p>
          <div class="footer-links">
            <a href="https://izytechglobalservices.com">Website</a>
            <a href="https://izytechglobalservices.com/contact">Contact</a>
            <a href="https://izytechglobalservices.com/services">Services</a>
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
       <table role="presentation" cellpadding="0" cellspacing="0"><tr><td><a href="https://izytechglobalservices.com/services" class="cta-btn">Explore Our Services →</a></td></tr></table>
    `,
  });
}

function contactNotification({ name, email, phone, service, subject, message }) {
  return buildEmail({
    subject: `New website enquiry from ${name}`,
    preheader: `${name} submitted a new enquiry through the IZY Technologies website.`,
    bodyHtml: `
      <h2 class="greeting">New Website Enquiry</h2>
      <p class="body-text">A visitor has submitted a new enquiry through the IZY Technologies website.</p>
      <div class="info-box">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Name</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(name)}</span></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Email</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><a href="mailto:${escHtml(email)}" style="font-size:13px;font-weight:600;color:#1a56db">${escHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Phone</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><a href="tel:${escHtml(phone)}" style="font-size:13px;font-weight:600;color:#1a56db">${escHtml(phone)}</a></td></tr>` : ''}
          ${service ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Service</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(service)}</span></td></tr>` : ''}
          ${subject ? `<tr><td style="padding:8px 0"><span style="font-size:13px;color:#5a6a82;font-weight:500">Subject</span></td><td style="padding:8px 0;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(subject)}</span></td></tr>` : ''}
        </table>
      </div>
      <hr class="divider"/>
      <p class="body-text" style="font-size:13px"><strong>Project details</strong></p>
      <p class="body-text" style="white-space:pre-wrap">${escHtml(message)}</p>
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

function siteAssessmentNotification({
  id, name, email, phone, service, propertyType, projectStage,
  addressLine1, addressLine2, city, state, landmark, preferredVisitDate,
  preferredVisitTime, details,
}) {
  const address = [addressLine1, addressLine2, city, state, landmark ? `Landmark: ${landmark}` : '']
    .filter(Boolean)
    .join(', ');
  return buildEmail({
    subject: `New site assessment request from ${name}`,
    preheader: `${name} requested a paid on-site assessment for ${service}.`,
    bodyHtml: `
      <h2 class="greeting">New Site Assessment Request</h2>
      <p class="body-text">A visitor has requested a paid on-site assessment. Review the project and address before sending the assessment charge.</p>
      <div class="info-box">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Request ID</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">#${escHtml(id)}</span></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Name</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(name)}</span></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Email</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><a href="mailto:${escHtml(email)}" style="font-size:13px;font-weight:600;color:#1a56db">${escHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Phone</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><a href="tel:${escHtml(phone)}" style="font-size:13px;font-weight:600;color:#1a56db">${escHtml(phone)}</a></td></tr>` : ''}
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Service</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(service)}</span></td></tr>
          ${propertyType ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Property</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(propertyType)}</span></td></tr>` : ''}
          ${projectStage ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Project stage</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(projectStage)}</span></td></tr>` : ''}
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Site address</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml(address)}</span></td></tr>
          ${preferredVisitDate || preferredVisitTime ? `<tr><td style="padding:8px 0"><span style="font-size:13px;color:#5a6a82;font-weight:500">Preferred visit</span></td><td style="padding:8px 0;text-align:right"><span style="font-size:13px;font-weight:600;color:#041627">${escHtml([preferredVisitDate, preferredVisitTime].filter(Boolean).join(' · '))}</span></td></tr>` : ''}
        </table>
      </div>
      <hr class="divider"/>
      <p class="body-text" style="white-space:pre-wrap"><strong>Project details</strong><br/>${escHtml(details)}</p>
    `,
  });
}

function siteAssessmentAutoReply({ name, service, publicToken }) {
  const proofUrl = `https://izytechglobalservices.com/assessment/${encodeURIComponent(publicToken)}`;
  return buildEmail({
    subject: `Your site assessment request is received — IZY Technologies`,
    preheader: `We received your on-site assessment request for ${service}.`,
    bodyHtml: `
      <h2 class="greeting">Hello ${escHtml(name)},</h2>
      <p class="body-text">We have received your request for an on-site assessment for <strong>${escHtml(service)}</strong>. Our team will review your project details and location before sending the assessment charge.</p>
      <div class="info-box">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Current status</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:12px;font-weight:600;color:#b45309;background:#fff4d6;padding:3px 10px;border-radius:20px">Under review</span></td></tr>
          <tr><td colspan="2" style="padding-top:12px"><p style="font-size:13px;color:#5a6a82;line-height:1.6;margin:0">Site assessments are chargeable for field projects. We will send payment instructions after review; a visit is scheduled after payment confirmation unless our team approves an exception.</p></td></tr>
        </table>
      </div>
      <p class="body-text" style="font-size:13px">You can use this secure request page later to check the status and submit payment proof:</p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td><a href="${proofUrl}" class="cta-btn">View Request Status →</a></td></tr></table>
    `,
  });
}

function assessmentChargeEmail({ name, service, fee, currency = 'NGN', instructions, publicToken }) {
  const proofUrl = `https://izytechglobalservices.com/assessment/${encodeURIComponent(publicToken)}`;
  return buildEmail({
    subject: `Site assessment charge — IZY Technologies`,
    preheader: `Payment instructions for your ${service} site assessment.`,
    bodyHtml: `
      <h2 class="greeting">Hello ${escHtml(name)},</h2>
      <p class="body-text">We have reviewed your request for a site assessment for <strong>${escHtml(service)}</strong>. To arrange the field visit, please settle the assessment charge below.</p>
      <div class="info-box">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:8px 0;border-bottom:1px solid #eef1f6"><span style="font-size:13px;color:#5a6a82;font-weight:500">Assessment fee</span></td><td style="padding:8px 0;border-bottom:1px solid #eef1f6;text-align:right"><span style="font-size:16px;font-weight:700;color:#041627">${escHtml(currency)} ${escHtml(fee)}</span></td></tr>
          <tr><td colspan="2" style="padding-top:14px"><p style="font-size:13px;color:#5a6a82;font-weight:500;margin:0 0 6px">Payment instructions</p><p style="font-size:13px;color:#041627;line-height:1.6;margin:0;white-space:pre-wrap">${escHtml(instructions)}</p></td></tr>
        </table>
      </div>
      <p class="body-text" style="font-size:13px">After payment, upload your receipt or invoice using the request page below. Our team will manually verify it and confirm your visit.</p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td><a href="${proofUrl}" class="cta-btn">Submit Payment Proof →</a></td></tr></table>
    `,
  });
}

/**
 * Invoice email — looks like an invoice inside a real branded email.
 * Summary table in the body + full PDF invoice attached separately.
 */
function invoiceEmail({ invoice, bodyHtml }) {
  const inv = invoice;
  const naira = n => '\u20A6' + (Number(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-NG', {
    timeZone: 'Africa/Lagos',
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '\u2014';

  const paid = inv.status === 'paid';
  const overdue = inv.status === 'overdue';
  const hasPaymentDetails = Boolean(inv.bank_account_name || inv.bank_account_number || inv.bank_name);
  const pillColor = paid ? '#16a34a' : overdue ? '#dc2626' : inv.status === 'cancelled' ? '#6b7280' : '#b45309';
  const pillLabel = paid ? 'PAID' : overdue ? 'OVERDUE' : inv.status === 'cancelled' ? 'CANCELLED' : 'UNPAID';

  const flatItemRows = (inv.line_items || []).map(item => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #eef1f6;font-size:13px;color:#041627">${escHtml(item.description || '\u2014')}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eef1f6;font-size:13px;color:#5a6a82;text-align:center">${escHtml(String(item.quantity))}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eef1f6;font-size:13px;color:#5a6a82;text-align:right">${naira(item.unit_price)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eef1f6;font-size:13px;color:#041627;font-weight:600;text-align:right">${naira(item.amount)}</td>
        </tr>`).join('');
  const itemRows = Array.isArray(inv.sections) && inv.sections.length
    ? inv.sections.map((section, index) => `
        <tr>
          <td colspan="4" style="padding:11px 14px 7px;background:#eaf2ff;border-bottom:1px solid #dbeafe;font-size:12px;color:#1d4ed8;font-weight:700;text-transform:uppercase;letter-spacing:.04em">
            Section ${index + 1}: ${escHtml(section.title || `Section ${index + 1}`)}
          </td>
        </tr>
        ${(section.line_items || []).map(item => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #eef1f6;font-size:13px;color:#041627">${escHtml(item.description || '\u2014')}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eef1f6;font-size:13px;color:#5a6a82;text-align:center">${escHtml(String(item.quantity))}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eef1f6;font-size:13px;color:#5a6a82;text-align:right">${naira(item.unit_price)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eef1f6;font-size:13px;color:#041627;font-weight:600;text-align:right">${naira(item.amount)}</td>
        </tr>`).join('')}
        <tr>
          <td colspan="3" style="padding:6px 14px 10px;font-size:11px;color:#5a6a82;text-align:right">
            Logistics ${naira(section.logistics)} &middot; Service charge ${naira(section.service_charge)}
          </td>
          <td style="padding:6px 14px 10px;font-size:11px;color:#041627;font-weight:600;text-align:right">${naira(section.total)}</td>
        </tr>`).join('')
    : flatItemRows;

  const body = bodyHtml || `
      <h2 class="greeting">Hello ${escHtml(inv.customer_name)},</h2>
      <p class="body-text">${paid
        ? 'Please find your payment confirmation and receipt for the invoice below. A PDF copy is attached for your records.'
        : 'Please find invoice <strong>' + escHtml(inv.invoice_number) + '</strong> below for your kind attention. The complete invoice is attached to this email as a PDF document.'}</p>

       <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 18px 0">
        <tr>
          <td style="vertical-align:top;padding-right:12px">
            <p style="margin:0;font-size:11px;color:#8fadc8;font-weight:600;letter-spacing:0.08em">INVOICE ${escHtml(inv.invoice_number)}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#5a6a82">Issued ${fmtDate(inv.created_at)}${inv.due_date ? ' &middot; Due ' + fmtDate(inv.due_date) : ''}</p>
          </td>
          <td style="vertical-align:top;text-align:right;white-space:nowrap">
            <span style="display:inline-block;font-size:12px;font-weight:700;color:#ffffff;background:${pillColor};padding:5px 14px;border-radius:20px;letter-spacing:0.08em">${pillLabel}</span>
          </td>
        </tr>
      </table>

       <h2 style="margin:24px 0 14px;text-align:center;font-size:22px;line-height:1.25;color:#041627;font-weight:700">${escHtml(inv.title || 'Invoice')}</h2>

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #eef1f6;border-radius:10px;overflow:hidden">
        <thead>
          <tr style="background:#f8faff">
            <th style="padding:10px 14px;text-align:left;font-size:11px;color:#5a6a82;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Description</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;color:#5a6a82;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Qty</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;color:#5a6a82;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Unit Price</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;color:#5a6a82;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr><td colspan="2" style="padding:8px 14px;font-size:12px;color:#5a6a82">Subtotal</td><td colspan="2" style="padding:8px 14px;font-size:12px;color:#041627;text-align:right">${naira(inv.subtotal)}</td></tr>
           <tr><td colspan="2" style="padding:4px 14px;font-size:12px;color:#5a6a82">Logistics</td><td colspan="2" style="padding:4px 14px;font-size:12px;color:#041627;text-align:right">${naira(inv.logistics)}</td></tr>
           <tr><td colspan="2" style="padding:4px 14px;font-size:12px;color:#5a6a82">Service Charge</td><td colspan="2" style="padding:4px 14px;font-size:12px;color:#041627;text-align:right">${naira(inv.service_charge)}</td></tr>
          <tr><td colspan="2" style="padding:4px 14px;font-size:12px;color:#5a6a82">${escHtml(inv.tax_label || 'VAT')}</td><td colspan="2" style="padding:4px 14px;font-size:12px;color:#041627;text-align:right">${naira(inv.tax_amount)}</td></tr>
           ${Number(inv.discount) > 0 ? `<tr><td colspan="2" style="padding:4px 14px;font-size:12px;color:#dc2626">Discount</td><td colspan="2" style="padding:4px 14px;font-size:12px;color:#dc2626;text-align:right">-${naira(inv.discount)}</td></tr>` : ''}
          <tr style="background:#f8faff"><td colspan="2" style="padding:12px 14px;font-size:14px;color:#041627;font-weight:700;border-top:2px solid #041627">TOTAL</td><td colspan="2" style="padding:12px 14px;font-size:14px;color:#041627;font-weight:700;text-align:right;border-top:2px solid #041627">${naira(inv.total)}</td></tr>
        </tfoot>
      </table>

      ${inv.notes ? `<div class="info-box" style="margin-top:18px"><p style="font-size:13px;color:#3a4a5c;margin:0"><strong>Note:</strong> ${escHtml(inv.notes)}</p></div>` : ''}
       ${hasPaymentDetails ? `<div style="margin-top:18px;padding:14px 16px;border:1px solid #eef1f6;border-radius:10px;background:#f8faff">
         <p style="margin:0 0 8px;font-size:11px;color:#5a6a82;font-weight:700;letter-spacing:0.06em;text-transform:uppercase">Payment Details</p>
         <p style="margin:3px 0;font-size:12px;color:#3a4a5c">Account Name: ${escHtml(inv.bank_account_name || '')}</p>
         <p style="margin:3px 0;font-size:12px;color:#3a4a5c">Account Number: ${escHtml(inv.bank_account_number || '')}</p>
         <p style="margin:3px 0;font-size:12px;color:#3a4a5c">Bank: ${escHtml(inv.bank_name || '')}</p>
       </div>` : ''}

      <hr class="divider"/>
      <p class="body-text" style="font-size:13px">${paid
        ? 'Thank you for your payment. If you have any questions about this invoice, simply reply to this email or call us.'
        : 'To settle this invoice or if you have any questions, simply reply to this email or call us directly:'}</p>
      ${paid ? '' : `<p class="body-text" style="font-size:13px">\ud83d\udcde <a href="tel:+2348101262814" style="color:#1a56db">+234 810 126 2814</a></p>`}
      <p style="font-size:12px;color:#8fadc8;margin:16px 0 0">📎 PDF invoice attached \u2014 ${escHtml(inv.invoice_number)}.pdf</p>`;

  return buildEmail({
     subject: `Invoice ${inv.invoice_number} from Izy Technologies Global Services Limited${paid ? ' \u2014 Paid' : ''}`,
    preheader: paid
      ? `Payment confirmed for invoice ${inv.invoice_number} \u2014 ${naira(inv.total)}`
      : `Invoice ${inv.invoice_number} \u2014 ${naira(inv.total)}${inv.due_date ? ', due ' + fmtDate(inv.due_date) : ''}`,
    bodyHtml: body,
     footerNote: 'This invoice was sent by Izy Technologies Global Services Limited. Reply to this email with any questions.',
  });
}

function customEmail({ subject = '', preheader = '', toName, greeting, bodyHtml: body, ctaLabel, ctaUrl }) {
  return buildEmail({
    subject,
    preheader,
    bodyHtml: `
      <h2 class="greeting">${escHtml(greeting || `Hi ${toName || 'there'},`)}</h2>
      <div class="body-text">${body || ''}</div>
      ${ctaLabel && ctaUrl ? `<hr class="divider"/><table role="presentation" cellpadding="0" cellspacing="0"><tr><td><a href="${escHtml(ctaUrl)}" class="cta-btn">${escHtml(ctaLabel)} →</a></td></tr></table>` : ''}
    `,
  });
}

function plainTextToHtml(text = '') {
  return `<p class="body-text">${escHtml(text).replace(/\r\n?|\n/g, '<br/>')}</p>`;
}

module.exports = {
  buildEmail,
  contactAutoReply,
  contactNotification,
  quoteAutoReply,
  siteAssessmentNotification,
  siteAssessmentAutoReply,
  assessmentChargeEmail,
  invoiceEmail,
  customEmail,
  plainTextToHtml,
};
