'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const NAVY = '#041627';
const GOLD = '#F0A20E';
const BLUE = '#0b8fc8';
const SLATE = '#3a4a5c';
const MUTED = '#64748b';
const LINE = '#dbe4ec';

const COMPANY = {
  legal: 'Izy Technologies Global Services Limited',
  tagline: 'Power the Future, Future-Ready Solutions, Today.',
  phone: '+234 810 126 2814',
  email: 'invoice@izytechglobalservices.com',
  site: 'izytechglobalservices.com',
  address: '1 Pathfinder Close, Sandfield, Borikiri, Port Harcourt, Rivers State',
  registration: 'RC: 8705481',
};

const SERVER_ASSETS = path.join(process.cwd(), 'server', 'assets');
const LOGO_PATH = path.join(SERVER_ASSETS, 'izy-logo.png');
const FONT_REG = path.join(SERVER_ASSETS, 'fonts', 'DejaVuSans.ttf');
const FONT_BOLD = path.join(SERVER_ASSETS, 'fonts', 'DejaVuSans-Bold.ttf');

function naira(value, prefix = '\u20A6') {
  const amount = Number(value) || 0;
  return prefix + amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(value) {
  if (!value) return '\u2014';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-NG', {
    timeZone: 'Africa/Lagos',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function safe(value, fallback = '\u2014') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

/**
 * Generates a manager-facing proforma invoice for Alternative Bank.
 * This is intentionally separate from the official customer invoice PDF.
 */
function generateAltBankLetterPdf(inv) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
      info: {
        Title: `Alternative Bank Proforma Invoice - ${safe(inv.invoice_number, 'Invoice')}`,
        Author: COMPANY.legal,
        Subject: 'Customer proforma invoice',
      },
    });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const hasFontFiles = fs.existsSync(FONT_REG) && fs.existsSync(FONT_BOLD);
    let currencyPrefix = '\u20A6';
    try {
      if (hasFontFiles) {
        doc.registerFont('body', FONT_REG);
        doc.registerFont('bold', FONT_BOLD);
      } else {
        doc.registerFont('body', 'Helvetica');
        doc.registerFont('bold', 'Helvetica-Bold');
        currencyPrefix = 'NGN ';
      }
    } catch (_) {
      doc.registerFont('body', 'Helvetica');
      doc.registerFont('bold', 'Helvetica-Bold');
      currencyPrefix = 'NGN ';
    }

    const money = value => naira(value, currencyPrefix);
    const W = doc.page.width;
    const H = doc.page.height;
    const M = 48;
    const RIGHT = W - M;
    const CONTENT_W = W - M * 2;
    const FOOTER_H = 58;
    const BOTTOM = H - FOOTER_H - 28;

    let y = 0;
    let pageNumber = 0;

    function drawLogo(x, logoY, size) {
      doc.roundedRect(x, logoY, size, size, 9).fill('#ffffff');
      if (fs.existsSync(LOGO_PATH)) {
        try {
          doc.image(LOGO_PATH, x + 5, logoY + 5, { width: size - 10, height: size - 10 });
          return;
        } catch (_) {
          // Use the text fallback below when the image cannot be read.
        }
      }
      doc.roundedRect(x + 5, logoY + 5, size - 10, size - 10, 7).fill(GOLD);
      doc.fillColor(NAVY).font('bold').fontSize(17)
        .text('IZY', x + 5, logoY + 18, { width: size - 10, align: 'center' });
    }

    function drawFooter() {
      const footerY = H - FOOTER_H;
      doc.rect(0, footerY, W, FOOTER_H).fill(BLUE);
      doc.rect(0, footerY, W, 3).fill(GOLD);
      doc.fillColor('#ffffff').font('bold').fontSize(8)
        .text(`${COMPANY.phone}  ·  ${COMPANY.email}`, M, footerY + 18, {
          width: CONTENT_W,
          align: 'center',
        });
      doc.fillColor('#dff4ff').font('body').fontSize(7.2)
        .text(COMPANY.site, M, footerY + 34, { width: CONTENT_W, align: 'center' });
    }

    function drawPageChrome(isFirstPage = false) {
      doc.rect(0, 0, W, 8).fill(NAVY);
      doc.rect(0, 8, W, 3).fill(GOLD);
      drawFooter();
      if (!isFirstPage) {
        doc.fillColor(MUTED).font('body').fontSize(7.5)
          .text(`PROFORMA INVOICE  ·  ${safe(inv.invoice_number)}`, M, 27, {
            width: CONTENT_W,
            align: 'right',
            characterSpacing: 0.8,
          });
        y = 54;
      }
    }

    function addPage() {
      drawPageChrome(false);
      pageNumber += 1;
      return pageNumber;
    }

    function ensureSpace(amount) {
      if (y + amount > BOTTOM) {
        doc.addPage();
        addPage();
      }
    }

    function paragraph(text, options = {}) {
      const x = options.x ?? M;
      const width = options.width || CONTENT_W;
      const font = options.font || 'body';
      const size = options.size || 9.2;
      const color = options.color || SLATE;
      const lineGap = options.lineGap ?? 3;
      const gapAfter = options.gapAfter ?? 12;
      doc.font(font).fontSize(size);
      const height = doc.heightOfString(text, { width, lineGap });
      ensureSpace(height + gapAfter);
      doc.fillColor(color).text(text, x, y, { width, lineGap });
      y += height + gapAfter;
    }

    function labelValue(label, value, x, valueX, rowY, width) {
      doc.fillColor(MUTED).font('bold').fontSize(7.2).text(label.toUpperCase(), x, rowY, {
        characterSpacing: 0.5,
      });
      doc.fillColor(NAVY).font('body').fontSize(8.8).text(safe(value), valueX, rowY, { width });
    }

    // First-page header: a clean letterhead treatment, not a copy of the
    // supplied reference image.
    drawPageChrome(true);
    pageNumber = 1;
    const headerY = 28;
    const logoSize = 58;
    drawLogo(M, headerY, logoSize);
    doc.fillColor(NAVY).font('bold').fontSize(12)
      .text(COMPANY.legal, M + logoSize + 14, headerY + 2, { width: 285 });
    doc.fillColor(GOLD).font('body').fontSize(8)
      .text(COMPANY.tagline, M + logoSize + 14, headerY + 22, { width: 285 });
    doc.fillColor(MUTED).font('body').fontSize(7.5)
      .text(COMPANY.address, M + logoSize + 14, headerY + 37, { width: 285 });
    doc.fillColor(MUTED).font('body').fontSize(7.5)
      .text(COMPANY.registration, M + logoSize + 14, headerY + 49, { width: 285 });

    doc.fillColor(NAVY).font('bold').fontSize(12)
      .text('PROFORMA INVOICE', W - M - 170, headerY + 5, { width: 170, align: 'right', characterSpacing: 0.7 });
    doc.fillColor(BLUE).font('bold').fontSize(8.5)
      .text('ALTERNATIVE BANK', W - M - 170, headerY + 25, { width: 170, align: 'right', characterSpacing: 0.5 });
    doc.fillColor(MUTED).font('body').fontSize(7.5)
      .text(`Ref. ${safe(inv.invoice_number)}`, W - M - 170, headerY + 42, { width: 170, align: 'right' });

    doc.moveTo(M, 108).lineTo(RIGHT, 108).lineWidth(1).stroke(LINE);
    y = 128;

    // Recipient block.
    doc.fillColor(MUTED).font('bold').fontSize(7.5)
      .text('DATE ISSUED', M, y, { characterSpacing: 0.8 });
    doc.fillColor(NAVY).font('body').fontSize(9.2).text(fmtDate(inv.created_at), M, y + 13);

    const recipientX = W / 2 + 20;
    doc.fillColor(MUTED).font('bold').fontSize(7.5)
      .text('TO', recipientX, y, { characterSpacing: 0.8 });
    doc.fillColor(NAVY).font('bold').fontSize(9.5).text('The Manager', recipientX, y + 13);
    doc.fillColor(SLATE).font('body').fontSize(9)
      .text('Alternative Bank\nPort Harcourt, Rivers State.', recipientX, y + 27, { lineGap: 2 });
    y += 78;

    doc.fillColor(MUTED).font('bold').fontSize(7.5)
      .text('CUSTOMER', M, y, { characterSpacing: 0.7 });
    doc.fillColor(NAVY).font('body').fontSize(9.2)
      .text(safe(inv.customer_name), M, y + 13);
    doc.fillColor(MUTED).font('bold').fontSize(7.5)
      .text('CONTACT', W / 2 + 20, y, { characterSpacing: 0.7 });
    doc.fillColor(NAVY).font('body').fontSize(8.8)
      .text([inv.customer_phone, inv.customer_email].filter(Boolean).join('  ·  '), W / 2 + 20, y + 13, { width: W / 2 - M - 20 });
    y += 42;

    doc.fillColor(NAVY).font('bold').fontSize(13)
      .text(`IZY TECH PROFORMA INVOICE FOR ${String(safe(inv.title, 'ENERGY SOLUTION EQUIPMENT AND INSTALLATION'))
        .replace(/^proforma invoice\s*(for)?\s*/i, '')
        .trim()
        .toUpperCase()}`, M, y, {
        width: CONTENT_W,
        characterSpacing: 0.2,
      });
    const proformaTitle = `IZY TECH PROFORMA INVOICE FOR ${String(safe(inv.title, 'ENERGY SOLUTION EQUIPMENT AND INSTALLATION'))
      .replace(/^proforma invoice\s*(for)?\s*/i, '')
      .trim()
      .toUpperCase()}`;
    y += doc.heightOfString(proformaTitle, { width: CONTENT_W }) + 10;
    doc.moveTo(M, y).lineTo(M + 118, y).lineWidth(2).stroke(GOLD);
    y += 18;

    // Items table.
    ensureSpace(80);
    const tableX = M;
    const tableW = CONTENT_W;
    const qtyW = 40;
    const amountW = 92;
    const descW = tableW - qtyW - amountW;
    const headerH = 24;
    doc.rect(tableX, y, tableW, headerH).fill(NAVY);
    doc.fillColor('#ffffff').font('bold').fontSize(7.5);
    doc.text('DESCRIPTION', tableX + 10, y + 8, { characterSpacing: 0.6 });
    doc.text('QTY', tableX + descW, y + 8, { width: qtyW, align: 'center', characterSpacing: 0.6 });
    doc.text('AMOUNT', tableX + descW + qtyW + 8, y + 8, { width: amountW - 16, align: 'right', characterSpacing: 0.6 });
    y += headerH;

    const items = Array.isArray(inv.line_items) ? inv.line_items : [];
    items.forEach((item, index) => {
      const description = safe(item.description);
      doc.font('body').fontSize(8.5);
      const descHeight = doc.heightOfString(description, { width: descW - 20, lineGap: 1 });
      const rowH = Math.max(25, descHeight + 13);
      if (y + rowH > BOTTOM) {
        doc.addPage();
        addPage();
        y = 54;
        doc.rect(tableX, y, tableW, headerH).fill(NAVY);
        doc.fillColor('#ffffff').font('bold').fontSize(7.5);
        doc.text('DESCRIPTION', tableX + 10, y + 8, { characterSpacing: 0.6 });
        doc.text('QTY', tableX + descW, y + 8, { width: qtyW, align: 'center', characterSpacing: 0.6 });
        doc.text('AMOUNT', tableX + descW + qtyW + 8, y + 8, { width: amountW - 16, align: 'right', characterSpacing: 0.6 });
        y += headerH;
      }
      if (index % 2 === 0) doc.rect(tableX, y, tableW, rowH).fill('#fbfdfe');
      doc.fillColor(NAVY).font('body').fontSize(8.5)
        .text(description, tableX + 10, y + 8, { width: descW - 20, lineGap: 1 });
      doc.fillColor(SLATE).text(String(item.quantity ?? ''), tableX + descW, y + 8, { width: qtyW, align: 'center' });
      doc.fillColor(NAVY).font('bold').text(money(item.amount), tableX + descW + qtyW + 8, y + 8, { width: amountW - 16, align: 'right' });
      doc.moveTo(tableX, y + rowH).lineTo(tableX + tableW, y + rowH).lineWidth(0.5).stroke(LINE);
      y += rowH;
    });

    // Totals and charges.
    y += 12;
    ensureSpace(120);
    const totalsX = W - M - 208;
    const totalsValueX = W - M - 4;
    const totals = [
      ['Equipment / items', money(inv.subtotal)],
      ['Logistics', money(inv.logistics)],
      ['Service charge', money(inv.service_charge)],
    ];
    if (Number(inv.tax_amount) > 0) totals.push([safe(inv.tax_label, 'Tax'), money(inv.tax_amount)]);
    if (Number(inv.discount) > 0) totals.push(['Discount', '-' + money(inv.discount)]);
    doc.font('body').fontSize(8.8);
    totals.forEach(([label, value]) => {
      doc.fillColor(MUTED).text(label, totalsX, y, { width: 112, align: 'right' });
      doc.fillColor(SLATE).text(value, totalsValueX - 94, y, { width: 94, align: 'right' });
      y += 15;
    });
    doc.moveTo(totalsX, y).lineTo(totalsValueX, y).lineWidth(1).stroke(NAVY);
    y += 10;
    doc.fillColor(NAVY).font('bold').fontSize(11)
      .text('GRAND TOTAL', totalsX, y, { width: 135, align: 'right' })
      .text(money(inv.total), totalsValueX - 94, y, { width: 94, align: 'right' });
    y += 30;

    if (inv.notes) {
      ensureSpace(62);
      doc.fillColor(MUTED).font('bold').fontSize(7.5)
        .text('ADDITIONAL NOTES', M, y, { characterSpacing: 0.7 });
      y += 13;
      paragraph(String(inv.notes), { size: 8.7, gapAfter: 10 });
    }

    ensureSpace(88);
    doc.fillColor(MUTED).font('bold').fontSize(7.5)
      .text('PAYMENT DETAILS', M, y, { characterSpacing: 0.7 });
    y += 14;
    doc.fillColor(SLATE).font('body').fontSize(8.8);
    const paymentLines = [
      ['Account name', inv.bank_account_name],
      ['Account number', inv.bank_account_number],
      ['Bank', inv.bank_name],
    ].filter(([, value]) => value);
    paymentLines.forEach(([label, value]) => {
      doc.fillColor(MUTED).font('bold').text(`${label}:`, M, y);
      doc.fillColor(SLATE).font('body').text(safe(value), M + 84, y);
      y += 14;
    });

    doc.end();
  });
}

module.exports = { generateAltBankLetterPdf };