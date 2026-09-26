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
  tagline: 'Power the Future, Future-Ready Solutions, Today.',
  phone: '+234 810 126 2814',
  email: 'invoice@izytechglobalservices.com',
  infoEmail: 'info@izytechglobalservices.com',
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

const FOOTER_H = 58;
const CONTENT_BOTTOM_GAP = 14;
const ITEM_LINE_H = 11.5;

function wrapTextByWidth(doc, value, width) {
  const paragraphs = String(value || '').split(/\r?\n/);
  const lines = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }

    let current = '';
    for (const word of words) {
      // Split unusually long tokens so they cannot force PDFKit to create a
      // page while trying to wrap a single unbroken string.
      if (doc.widthOfString(word) > width) {
        if (current) {
          lines.push(current);
          current = '';
        }
        let chunk = '';
        for (const character of word) {
          const candidate = chunk + character;
          if (chunk && doc.widthOfString(candidate) > width) {
            lines.push(chunk);
            chunk = character;
          } else {
            chunk = candidate;
          }
        }
        if (chunk) current = chunk;
        continue;
      }

      const candidate = current ? current + ' ' + word : word;
      if (current && doc.widthOfString(candidate) > width) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }

  return lines.length ? lines : ['\u2014'];
}

function drawInvoiceTableHeader(doc, geometry, y) {
  const { M, RIGHT, qtyW, qtyX, unitW, unitX, amtW, amtX, descX } = geometry;
  const headH = 26;
  doc.rect(M, y, RIGHT - M, headH).fill('#f4f6fa');
  doc.fillColor(MUTED).font('bold').fontSize(8);
  doc.text('DESCRIPTION', descX, y + 9, { characterSpacing: 0.8 });
  doc.text('QTY', qtyX, y + 9, { width: qtyW, align: 'center', characterSpacing: 0.8 });
  doc.text('UNIT PRICE', unitX, y + 9, { width: unitW, align: 'right', characterSpacing: 0.8 });
  doc.text('AMOUNT', amtX, y + 9, { width: amtW, align: 'right', characterSpacing: 0.8 });
  return y + headH;
}

/**
 * Starts a continuation page. The first page carries the full customer or
 * manager header; later pages carry a compact identifier and table header.
 */
function startContinuationPage(doc, inv, geometry, includeTableHeader) {
  doc.addPage({ size: 'A4', margin: 0 });
  const { W, M, RIGHT } = geometry;
  doc.fillColor(NAVY).font('bold').fontSize(10)
    .text('INVOICE CONTINUED', M, 34, { characterSpacing: 1 });
  doc.fillColor(MUTED).font('body').fontSize(9)
    .text(String(inv.invoice_number || 'Invoice'), RIGHT - 180, 35, {
      width: 180,
      align: 'right',
    });
  doc.rect(M, 55, W - M * 2, 1).fill(LINE);

  let y = 72;
  return includeTableHeader ? drawInvoiceTableHeader(doc, geometry, y) : y;
}

/**
 * Generates the official IZY invoice PDF with logo, ₦ support (DejaVu), and
 * safe multi-page layout for both customer invoices and manager letters.
 * @returns {Promise<Buffer>}
 */
function generateInvoicePdf(inv, options = {}) {
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
    const includeStatusPill = options.includeStatusPill !== false;

    const W = doc.page.width;   // 595.28
    const M = 48;
    const RIGHT = W - M;
    const geometry = {
      W, M, RIGHT,
      qtyW: 52,
      unitW: 96,
      amtW: 110,
    };
    geometry.qtyX = RIGHT - (geometry.amtW + geometry.unitW + geometry.qtyW);
    geometry.unitX = geometry.qtyX + geometry.qtyW;
    geometry.amtX = geometry.unitX + geometry.unitW;
    geometry.descX = M + 12;
    geometry.descW = geometry.qtyX - geometry.descX - 12;
    const contentBottom = () => doc.page.height - FOOTER_H - CONTENT_BOTTOM_GAP;

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

    if (includeStatusPill) {
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
    }

    /* ── Recipient ───────────────────────────────────────────── */
    y += 14;
    const billToY = Math.max(y, 216);
    const recipient = options.recipient;
    let recipientBottom = billToY + 34;
    doc.fillColor(MUTED).font('body').fontSize(8)
      .text(recipient?.label || 'BILL TO', M, billToY, { characterSpacing: 1.2 });

    if (recipient) {
      const lines = Array.isArray(recipient.lines) ? recipient.lines : [recipient.lines];
      const recipientText = lines.filter(Boolean).join('\n');
      doc.fillColor(NAVY).font('bold').fontSize(12)
        .text(recipientText, M, billToY + 15, { width: 300, lineGap: 1 });
      recipientBottom = billToY + 15
        + doc.heightOfString(recipientText, { width: 300, lineGap: 1 });

      if (options.includeCustomerDetails) {
        const customerLines = [
          ['Email', inv.customer_email],
          ['Phone', inv.customer_phone],
          ['Address', inv.customer_address],
        ].filter(([, value]) => String(value || '').trim());
        const customerName = String(inv.customer_name || '').trim();
        if (customerName || customerLines.length) {
          const detailsY = recipientBottom + 14;
          doc.fillColor(MUTED).font('body').fontSize(8)
            .text('CUSTOMER DETAILS', M, detailsY, { characterSpacing: 1.2 });
          let detailY = detailsY + 15;
          if (customerName) {
            doc.fillColor(NAVY).font('bold').fontSize(10.5)
              .text(customerName, M, detailY, { width: 300 });
            detailY += doc.heightOfString(customerName, { width: 300 }) + 4;
          }
          doc.fillColor(SLATE).font('body').fontSize(9);
          for (const [label, value] of customerLines) {
            const line = `${label}: ${String(value).trim()}`;
            doc.text(line, M, detailY, { width: 300 });
            detailY += doc.heightOfString(line, { width: 300 }) + 3;
          }
          recipientBottom = detailY;
        }
      }
    } else {
      doc.fillColor(NAVY).font('bold').fontSize(12)
        .text(inv.customer_name || '', M, billToY + 15);
      doc.font('body').fillColor(SLATE).fontSize(9.5);
      let by = billToY + 34;
      const customerEmail = String(inv.customer_email || '').trim();
      const customerPhone = String(inv.customer_phone || '').trim();
      const customerAddress = String(inv.customer_address || '').trim();
      if (customerEmail) { doc.text(customerEmail, M, by); by += 14; }
      if (customerPhone) { doc.text(customerPhone, M, by); by += 14; }
      if (customerAddress) {
        doc.text(customerAddress, M, by, { width: 300 });
        by += 14 * Math.ceil((customerAddress.length / 46));
      }
      recipientBottom = by;
    }

    /* ── Invoice title + items table ──────────────────────────── */
    let ty = Math.max(recipientBottom + 24, 300);
    const invoiceTitle = String(inv.title || 'Invoice');
    doc.fillColor(NAVY).font('bold').fontSize(18)
      .text(invoiceTitle, M, ty, { width: W - M * 2, align: 'center' });
    ty += doc.heightOfString(invoiceTitle, { width: W - M * 2 }) + 10;
    doc.moveTo(M + 180, ty).lineTo(RIGHT - 180, ty).lineWidth(1).stroke(GOLD);
    ty += 14;
    ty = drawInvoiceTableHeader(doc, geometry, ty);

    const invoiceRows = Array.isArray(inv.sections) && inv.sections.length
      ? inv.sections.flatMap(section => [
        { sectionTitle: section.title },
        ...(Array.isArray(section.items) ? section.items : []),
      ])
      : (inv.line_items || []);

    // Rows are laid out against the usable page area. This prevents PDFKit's
    // implicit text pagination from separating the row content from its
    // background and from placing the footer between line items.
    let itemRowIndex = 0;
    invoiceRows.forEach(item => {
      if (item.sectionTitle) {
        if (ty + 26 > contentBottom()) {
          ty = startContinuationPage(doc, inv, geometry, true);
        }
        doc.rect(M, ty, RIGHT - M, 26).fill('#eef1f6');
        doc.fillColor(NAVY).font('bold').fontSize(9)
          .text(String(item.sectionTitle).toUpperCase(), geometry.descX, ty + 9, {
            characterSpacing: 0.8,
            lineBreak: false,
          });
        ty += 26;
        return;
      }

      const i = itemRowIndex;
      itemRowIndex += 1;
      doc.font('body').fontSize(9.5);
      const desc = String(item.description || '\u2014');
      const descriptionLines = wrapTextByWidth(doc, desc, geometry.descW);
      let lineIndex = 0;
      let firstChunk = true;

      while (lineIndex < descriptionLines.length) {
        if (ty + 28 > contentBottom()) {
          ty = startContinuationPage(doc, inv, geometry, true);
        }

        const availableLines = Math.max(
          1,
          Math.floor((contentBottom() - ty - 16) / ITEM_LINE_H),
        );
        const chunk = descriptionLines.slice(lineIndex, lineIndex + availableLines);
        const rowH = Math.max(28, chunk.length * ITEM_LINE_H + 16);

        if (i % 2 === 1) doc.rect(M, ty, RIGHT - M, rowH).fill('#fafbfd');

        const baseline = ty + 8;
        doc.fillColor(NAVY).font('body').fontSize(9.5);
        chunk.forEach((line, lineOffset) => {
          doc.text(line || ' ', geometry.descX, baseline + lineOffset * ITEM_LINE_H, {
            width: geometry.descW,
            lineBreak: false,
          });
        });

        // Keep the numeric cells on the first part of a split description.
        if (firstChunk) {
          doc.fillColor(SLATE)
            .text(String(item.quantity ?? ''), geometry.qtyX, baseline, {
              width: geometry.qtyW,
              align: 'center',
              lineBreak: false,
            })
            .text(money(item.unit_price), geometry.unitX, baseline, {
              width: geometry.unitW,
              align: 'right',
              lineBreak: false,
            });
          doc.fillColor(NAVY).font('bold')
            .text(money(item.amount), geometry.amtX, baseline, {
              width: geometry.amtW,
              align: 'right',
              lineBreak: false,
            });
        }

        doc.moveTo(M, ty + rowH).lineTo(RIGHT, ty + rowH).lineWidth(0.5).stroke(LINE);
        ty += rowH;
        lineIndex += chunk.length;
        firstChunk = false;

        if (lineIndex < descriptionLines.length) {
          ty = startContinuationPage(doc, inv, geometry, true);
        }
      }
    });

    /* ── Totals (fixed two-column block, right-aligned) ──────── */
    const totalRows = [
      ['Subtotal', money(inv.subtotal), 10],
      ['Logistics', money(inv.logistics), 10],
      ['Service Charge', money(inv.service_charge), 10],
      [inv.tax_label || 'VAT', money(inv.tax_amount), 10],
      ...(Number(inv.discount) > 0 ? [['Discount', '-' + money(inv.discount), 10]] : []),
    ];
    const totalBlockHeight = 18
      + totalRows.reduce((sum, [, , size]) => sum + size + 10, 0)
      + 12 + 14 + 10 + 10;
    if (ty + totalBlockHeight > contentBottom()) {
      ty = startContinuationPage(doc, inv, geometry, false);
    }
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

    for (const [label, value] of totalRows) {
      totalRow(label, value, label === 'Discount' ? { color: '#dc2626' } : {});
    }

    doc.moveTo(totLabelX, ty).lineTo(RIGHT, ty).lineWidth(1).stroke(NAVY);
    ty += 12;
    totalRow('TOTAL', money(inv.total), { bold: true, size: 14 });

    /* ── Notes ───────────────────────────────────────────────── */
    doc.font('body').fontSize(9);
    const notesText = String(inv.notes || '');
    const notesLines = notesText ? wrapTextByWidth(doc, notesText, W - M * 2) : [];
    if (notesLines.length) {
      const notesBlockHeight = 10 + 14 + notesLines.length * ITEM_LINE_H;
      if (ty + notesBlockHeight > contentBottom()) {
        ty = startContinuationPage(doc, inv, geometry, false);
      }
      ty += 10;
      doc.fillColor(MUTED).font('bold').fontSize(8)
        .text('NOTES', M, ty, { characterSpacing: 1 });
      doc.fillColor(SLATE).font('body').fontSize(9);
      notesLines.forEach((line, index) => {
        doc.text(line || ' ', M, ty + 14 + index * ITEM_LINE_H, {
          width: W - M * 2,
          lineBreak: false,
        });
      });
      ty += 14 + notesLines.length * ITEM_LINE_H;
    }

    if (inv.bank_account_name || inv.bank_account_number || inv.bank_name) {
      doc.font('body').fontSize(9);
      const paymentLines = [
        ...(inv.bank_account_name ? wrapTextByWidth(doc, 'Account Name: ' + String(inv.bank_account_name), W - M * 2) : []),
        ...(inv.bank_account_number ? wrapTextByWidth(doc, 'Account Number: ' + String(inv.bank_account_number), W - M * 2) : []),
        ...(inv.bank_name ? wrapTextByWidth(doc, 'Bank: ' + String(inv.bank_name), W - M * 2) : []),
      ];
      const paymentBlockHeight = 10 + 14 + paymentLines.length * (ITEM_LINE_H + 4);
      if (ty + paymentBlockHeight > contentBottom()) {
        ty = startContinuationPage(doc, inv, geometry, false);
      }
      ty += 10;
      doc.fillColor(MUTED).font('bold').fontSize(8)
        .text('PAYMENT DETAILS', M, ty, { characterSpacing: 1 });
      doc.fillColor(SLATE).font('body').fontSize(9);
      ty += 14;
      for (const line of paymentLines) {
        doc.text(line || ' ', M, ty, { width: W - M * 2, lineBreak: false });
        ty += ITEM_LINE_H + 4;
      }
    }

    /* ── Footer on every page ────────────────────────────────── */
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const pageH = doc.page.height;
      doc.rect(0, pageH - FOOTER_H, W, FOOTER_H).fill('#f8f9fb');
      doc.rect(0, pageH - FOOTER_H, W, 1).fill(LINE);
      // Keep each footer line intentional and non-wrapping. A wrapped footer
      // line at the bottom of the page makes PDFKit create a second page.
      // Calculate the x positions ourselves instead of passing a width to
      // PDFKit. Its width wrapper can auto-create a new page when this loop
      // is drawing near the bottom of a switched-to buffered page.
      const centeredFooterLine = (text, fontSize, y) => {
        doc.fontSize(fontSize);
        doc.text(text, (W - doc.widthOfString(text)) / 2, y, { lineBreak: false });
      };
      doc.fillColor(MUTED).font('body');
      centeredFooterLine(COMPANY.legal, 9.5, pageH - 48);
      centeredFooterLine(COMPANY.address, 9, pageH - 35);
      const footerContactParts = [
        COMPANY.registration,
        ...(options.hideCompanyContact ? [] : [COMPANY.phone]),
        ...(options.includeFooterEmails
          ? [COMPANY.email, COMPANY.infoEmail]
          : (options.hideCompanyContact ? [] : [COMPANY.email])),
        COMPANY.site,
      ];
      centeredFooterLine(footerContactParts.join('  \u00b7  '), 8.75, pageH - 22);
      const pageLabel = `Page ${i - range.start + 1} of ${range.count}`;
      doc.fontSize(8).text(pageLabel, RIGHT - doc.widthOfString(pageLabel), pageH - 9, {
        lineBreak: false,
      });
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
