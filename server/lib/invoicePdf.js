'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const NAVY = '#041627';
const GOLD = '#F0A20E';
const SLATE = '#3a4a5c';
const MUTED = '#8fadc8';
const LINE = '#eef1f6';

const COMPANY = {
  legal: 'Izy Technologies Global Services Limited',
  tagline: 'Power The Future-Ready Solutions, Today',
  phone: '+234 810 126 2814',
  email: 'info@izytechglobalservices.com',
  site: 'izytechglobalservices.com',
  address: '1 Pathfinder Close, Sandfield, Borikiri, Port Harcourt, Rivers State',
  registration: 'RC: 8705481',
};

// Resolve from the project root because Next bundles this module into its API
// route at build time, changing __dirname away from server/lib in production.
const SERVER_ASSETS = path.join(process.cwd(), 'server', 'assets');
const LOGO_PATH = path.join(SERVER_ASSETS, 'izy-logo.png');
const FONT_REG = path.join(SERVER_ASSETS, 'fonts', 'DejaVuSans.ttf');
const FONT_BOLD = path.join(SERVER_ASSETS, 'fonts', 'DejaVuSans-Bold.ttf');

function naira(n, prefix = '\u20A6') {
  const v = Number(n) || 0;
  return prefix + v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '\u2014';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  // All invoice dates are Nigeria time (WAT) — never the server's timezone.
  return dt.toLocaleDateString('en-NG', {
    timeZone: 'Africa/Lagos',
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/**
 * Generates the official IZY invoice PDF with logo, ₦ support (DejaVu) and
 * a clean fixed-grid layout.
 * @returns {Promise<Buffer>}
 */
function generateInvoicePdf(inv) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Register brand fonts (₦ glyph lives in DejaVu, not in Helvetica).
    // Fall back to built-in Helvetica if the bundled files are missing so
    // invoice emails never hard-fail — naira renders as "N" in that case.
    const hasFontFiles = fs.existsSync(FONT_REG) && fs.existsSync(FONT_BOLD);
    let currencyPrefix = '\u20A6';
    try {
      if (hasFontFiles) {
        doc.registerFont('body', FONT_REG);
        doc.registerFont('bold', FONT_BOLD);
      } else {
        console.warn('Invoice PDF font files missing, using Helvetica fallback');
        doc.registerFont('body', 'Helvetica');
        doc.registerFont('bold', 'Helvetica-Bold');
        currencyPrefix = 'NGN ';
      }
    } catch (fontErr) {
      console.error('Invoice PDF font registration failed:', fontErr.message);
      doc.registerFont('body', 'Helvetica');
      doc.registerFont('bold', 'Helvetica-Bold');
      currencyPrefix = 'NGN ';
    }
    const money = value => naira(value, currencyPrefix);

    const W = doc.page.width;   // 595.28
    const H = doc.page.height;  // 841.89
    const M = 48;
    const RIGHT = W - M;

    /* ── Header band with logo ───────────────────────────────── */
    const headerH = 148;
    doc.rect(0, 0, W, headerH).fill(NAVY);

    // Logo
    const logoSize = 56;
    const logoY = 38;
    // Put the supplied mark on a light tile so it remains visible against the
    // navy header in PDF viewers that handle transparent PNGs differently.
    doc.roundedRect(M, logoY, logoSize, logoSize, 12).fill('#ffffff');
    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, M + 6, logoY + 6, { width: logoSize - 12, height: logoSize - 12 });
      } catch (_) {
        drawLogoFallback(doc, M, logoY, logoSize);
      }
    } else {
      console.warn('Invoice PDF logo asset missing, using fallback mark');
      drawLogoFallback(doc, M, logoY, logoSize);
    }

    // Full legal name and site tagline next to the logo.
    const tx = M + logoSize + 16;
    doc.fillColor('#ffffff').font('bold').fontSize(11.5)
      .text(COMPANY.legal, tx, logoY + 1, { width: 300 });
    doc.fillColor(GOLD).font('body').fontSize(7.5)
      .text(COMPANY.tagline, tx, logoY + 20, { width: 300 });
    doc.fillColor(MUTED).font('body').fontSize(8)
      .text(COMPANY.address, tx, logoY + 35, { width: 300, lineGap: 1 });
    doc.fillColor(MUTED).font('body').fontSize(7.5)
      .text(COMPANY.registration, tx, logoY + 51, { width: 300 });

    // Keep the invoice number in the header; the invoice title belongs above
    // the items table where it reads like the document title.
    const detailX = RIGHT - 168;
    const detailW = 168;
    doc.fillColor(MUTED).font('body').fontSize(7.5)
      .text('INVOICE NO.', detailX, 52, { width: detailW, align: 'right', characterSpacing: 1 });
    doc.fillColor('#ffffff').font('bold').fontSize(13)
      .text(inv.invoice_number, detailX, 65, { width: detailW, align: 'right' });

    // Gold accent bar
    doc.rect(0, headerH, W, 3).fill(GOLD);

    /* ── Meta row: dates (left) + status pill (right) ────────── */
    let y = headerH + 30;
    doc.font('body').fontSize(9);
    const metaRows = [
      ['ISSUE DATE', fmtDate(inv.created_at)],
      ['DUE DATE', fmtDate(inv.due_date)],
      ...(inv.status === 'paid' && inv.paid_date ? [['PAID ON', fmtDate(inv.paid_date)]] : []),
    ];
    const metaStart = y;
    for (const [label, value] of metaRows) {
      doc.fillColor(MUTED).text(label, M, y, { characterSpacing: 1.2 });
      doc.fillColor(SLATE).font('bold').text(value, M + 92, y);
      doc.font('body');
      y += 17;
    }

    // Status pill — vertically centred against the meta rows
    const pillLabel = inv.status === 'paid' ? 'PAID'
      : inv.status === 'overdue' ? 'OVERDUE'
      : inv.status === 'cancelled' ? 'CANCELLED' : 'UNPAID';
    const pillColor = inv.status === 'paid' ? '#16a34a'
      : inv.status === 'overdue' ? '#dc2626'
      : inv.status === 'cancelled' ? '#6b7280' : '#b45309';
    const pillW = 86, pillH = 24;
    const pillY = metaStart + 4;
    doc.roundedRect(RIGHT - pillW, pillY, pillW, pillH, 12).fill(pillColor);
    doc.fillColor('#ffffff').font('bold').fontSize(9)
      .text(pillLabel, RIGHT - pillW, pillY + 8, { width: pillW, align: 'center', characterSpacing: 1.5 });

    /* ── Bill to ─────────────────────────────────────────────── */
    y += 14;
    const billToY = Math.max(y, 216);
    doc.fillColor(MUTED).font('body').fontSize(8)
      .text('BILL TO', M, billToY, { characterSpacing: 1.2 });
    doc.fillColor(NAVY).font('bold').fontSize(12)
      .text(inv.customer_name || '', M, billToY + 15);
    doc.font('body').fillColor(SLATE).fontSize(9.5);
    let by = billToY + 34;
    if (inv.customer_email) { doc.text(inv.customer_email, M, by); by += 14; }
    if (inv.customer_phone) { doc.text(inv.customer_phone, M, by); by += 14; }
    if (inv.customer_address) {
      doc.text(inv.customer_address, M, by, { width: 300 });
      by += 14 * Math.ceil((inv.customer_address.length / 46));
    }

    /* ── Invoice title + items table (fixed grid) ─────────────── */
    // Column geometry is computed once so headers and cells can never drift.
    const qtyW = 52, unitW = 96, amtW = 110;
    const qtyX = RIGHT - (amtW + unitW + qtyW);
    const unitX = qtyX + qtyW;
    const amtX = unitX + unitW;
    const descX = M + 12;
    const descW = qtyX - descX - 12;

    let ty = Math.max(by + 24, 300);
    const invoiceTitle = String(inv.title || 'Invoice');
    doc.fillColor(NAVY).font('bold').fontSize(18)
      .text(invoiceTitle, M, ty, { width: W - M * 2, align: 'center' });
    ty += doc.heightOfString(invoiceTitle, { width: W - M * 2 }) + 10;
    doc.moveTo(M + 180, ty).lineTo(RIGHT - 180, ty).lineWidth(1).stroke(GOLD);
    ty += 14;

    // Header row
    const headH = 26;
    doc.rect(M, ty, W - M * 2, headH).fill('#f4f6fa');
    doc.fillColor(MUTED).font('bold').fontSize(8);
    doc.text('DESCRIPTION', descX, ty + 9, { characterSpacing: 0.8 });
    doc.text('QTY', qtyX, ty + 9, { width: qtyW, align: 'center', characterSpacing: 0.8 });
    doc.text('UNIT PRICE', unitX, ty + 9, { width: unitW, align: 'right', characterSpacing: 0.8 });
    doc.text('AMOUNT', amtX, ty + 9, { width: amtW, align: 'right', characterSpacing: 0.8 });
    ty += headH;

    // Body rows — cursor-based so multi-line descriptions stay aligned
    (inv.line_items || []).forEach((item, i) => {
      const desc = String(item.description || '\u2014');
      doc.font('body').fontSize(9.5);
      const descH = doc.heightOfString(desc, { width: descW, lineGap: 1 });
      const rowH = Math.max(28, descH + 16);

      if (i % 2 === 1) doc.rect(M, ty, W - M * 2, rowH).fill('#fafbfd');

      const baseline = ty + 8;
      doc.fillColor(NAVY).text(desc, descX, baseline, { width: descW, lineGap: 1 });
      doc.fillColor(SLATE)
        .text(String(item.quantity ?? ''), qtyX, baseline, { width: qtyW, align: 'center' })
        .text(money(item.unit_price), unitX, baseline, { width: unitW, align: 'right' });
      doc.fillColor(NAVY).font('bold')
        .text(money(item.amount), amtX, baseline, { width: amtW, align: 'right' });

      doc.moveTo(M, ty + rowH).lineTo(RIGHT, ty + rowH).lineWidth(0.5).stroke(LINE);
      ty += rowH;
    });

    /* ── Totals (fixed two-column block, right-aligned) ──────── */
    ty += 18;
    const totLabelW = 92, totValW = 155, totGap = 12;
    const totValX = RIGHT - totValW;
    const totLabelX = totValX - totGap - totLabelW;

    const totalRow = (label, value, opts = {}) => {
      doc.font(opts.bold ? 'bold' : 'body').fontSize(opts.size || 10);
      doc.fillColor(opts.color || (opts.bold ? NAVY : SLATE))
        .text(label, totLabelX, ty, { width: totLabelW, align: 'right' });
      doc.text(value, totValX, ty, { width: totValW, align: 'right' });
      ty += (opts.size || 10) + 10;
    };

    totalRow('Subtotal', money(inv.subtotal));
    totalRow('Logistics', money(inv.logistics));
    totalRow('Service Charge', money(inv.service_charge));
    totalRow(inv.tax_label || 'VAT', money(inv.tax_amount));
    if (Number(inv.discount) > 0) totalRow('Discount', '-' + money(inv.discount), { color: '#dc2626' });

    doc.moveTo(totLabelX, ty).lineTo(RIGHT, ty).lineWidth(1).stroke(NAVY);
    ty += 12;
    totalRow('TOTAL', money(inv.total), { bold: true, size: 14 });

    /* ── Notes ───────────────────────────────────────────────── */
    if (inv.notes) {
      ty += 10;
      doc.fillColor(MUTED).font('bold').fontSize(8)
        .text('NOTES', M, ty, { characterSpacing: 1 });
      const notesText = String(inv.notes);
      const notesWidth = W - M * 2;
      doc.fillColor(SLATE).font('body').fontSize(9)
        .text(notesText, M, ty + 14, { width: notesWidth, lineGap: 2 });
      ty += 14 + doc.heightOfString(notesText, { width: notesWidth, lineGap: 2 });
    }

    if (inv.bank_account_name || inv.bank_account_number || inv.bank_name) {
      ty += 10;
      doc.fillColor(MUTED).font('bold').fontSize(8)
        .text('PAYMENT DETAILS', M, ty, { characterSpacing: 1 });
      doc.fillColor(SLATE).font('body').fontSize(9);
      ty += 14;
      const paymentWidth = W - M * 2;
      const paymentLine = text => {
        doc.text(text, M, ty, { width: paymentWidth, lineGap: 1 });
        ty += doc.heightOfString(text, { width: paymentWidth, lineGap: 1 }) + 4;
      };
      if (inv.bank_account_name) {
        paymentLine('Account Name: ' + String(inv.bank_account_name));
      }
      if (inv.bank_account_number) {
        paymentLine('Account Number: ' + String(inv.bank_account_number));
      }
      if (inv.bank_name) paymentLine('Bank: ' + String(inv.bank_name));
    }

    /* ── Footer on every page ────────────────────────────────── */
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const pageH = doc.page.height;
      doc.rect(0, pageH - 42, W, 42).fill('#f8f9fb');
      doc.rect(0, pageH - 42, W, 1).fill(LINE);
      doc.fillColor(MUTED).font('body').fontSize(7.5)
        .text(COMPANY.legal + '  \u00b7  ' + COMPANY.address, M, pageH - 29, { width: W - M * 2, align: 'center' });
      doc.fillColor(MUTED).fontSize(7)
        .text(COMPANY.registration + '  \u00b7  Thank you for your business.  \u00b7  ' + COMPANY.phone + '  \u00b7  ' + COMPANY.email, M, pageH - 17, { width: W - M * 2, align: 'center' });
    }

    doc.end();
  });
}

function drawLogoFallback(doc, x, y, size) {
  doc.roundedRect(x, y, size, size, 10).fill(GOLD);
  doc.fillColor(NAVY).font('bold').fontSize(22)
    .text('IZY', x, y + 16, { width: size, align: 'center' });
}

module.exports = { generateInvoicePdf };
