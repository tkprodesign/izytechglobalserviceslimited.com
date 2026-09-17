'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const BLUE = '#08a4d9';
const NAVY = '#102238';
const GOLD = '#f0a20e';
const GRID = '#606b73';
const TEXT = '#111820';

const COMPANY = {
  legal: 'IZY TECHNOLOGIES GLOBAL SERVICES LIMITED',
  tagline: 'Power The Future, Future Ready Solutions, Today',
  phone: '08101262814',
  email: 'info@izytechglobalservices.com',
  address: 'Address: No. 1 Pathfinder Close, Borikiri, Port Harcourt, Rivers State',
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

function safe(value, fallback = '\u2014') {
  const text = String(value ?? '').trim();
  return text || fallback;
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

function cleanTitle(value) {
  return safe(value, 'ENERGY SOLUTION EQUIPMENT AND INSTALLATION')
    .replace(/^izy\s+tech\s*/i, '')
    .replace(/^proforma\s+invoice\s*(for)?\s*/i, '')
    .trim()
    .toUpperCase();
}

function generateAltBankLetterPdf(inv) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
      info: {
        Title: `IZY Tech Proforma Invoice - ${safe(inv.invoice_number, 'Invoice')}`,
        Author: COMPANY.legal,
        Subject: 'Customer proforma invoice',
      },
    });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    let currencyPrefix = '\u20A6';
    const hasFontFiles = fs.existsSync(FONT_REG) && fs.existsSync(FONT_BOLD);
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
    const pageX = 28;
    const pageY = 24;
    const pageW = W - pageX * 2;
    const pageH = H - pageY * 2;
    const left = pageX + 22;
    const right = pageX + pageW - 22;
    const contentW = right - left;
    const footerH = 57;
    const footerY = pageY + pageH - footerH;

    // The reference uses a white invoice sheet framed by a bright cyan line.
    doc.roundedRect(pageX, pageY, pageW, pageH, 15).fill('#ffffff');
    doc.roundedRect(pageX, pageY, pageW, pageH, 15).lineWidth(2.2).stroke(BLUE);

    // Letterhead.
    const logoSize = 58;
    const logoX = left + 5;
    const logoY = pageY + 10;
    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, logoX, logoY, { width: logoSize, height: logoSize });
      } catch (_) {
        doc.roundedRect(logoX, logoY, logoSize, logoSize, 8).fill(GOLD);
        doc.fillColor(NAVY).font('bold').fontSize(18)
          .text('IZY', logoX, logoY + 20, { width: logoSize, align: 'center' });
      }
    }

    const companyX = logoX + logoSize + 9;
    const companyW = right - companyX - 4;
    doc.fillColor('#1475b9').font('bold').fontSize(12.2)
      .text(COMPANY.legal, companyX, logoY + 5, { width: companyW, align: 'center' });
    doc.fillColor(GOLD).font('bold').fontSize(8.2)
      .text(COMPANY.tagline, companyX, logoY + 23, { width: companyW, align: 'center' });
    doc.fillColor(TEXT).font('bold').fontSize(6.7)
      .text(COMPANY.address, companyX - 5, logoY + 39, { width: companyW + 10, align: 'center' });
    doc.fillColor('#b82025').font('bold').fontSize(6.7)
      .text(COMPANY.registration, right - 67, logoY + 4, { width: 67, align: 'right' });

    // Date row at the top-right, as in the reference.
    const dateY = pageY + 88;
    doc.fillColor(TEXT).font('bold').fontSize(8.2)
      .text('Date Issued:', right - 180, dateY, { width: 74, align: 'right' });
    doc.fillColor(TEXT).font('body').fontSize(8.2)
      .text(fmtDate(inv.created_at), right - 98, dateY, { width: 98, align: 'right' });

    // Recipient block.
    const recipientY = pageY + 113;
    doc.fillColor(TEXT).font('bold').fontSize(10.5)
      .text('The Manager,\nThe Alternative Bank,\nPort Harcourt-Rivers State.', left, recipientY, {
        width: 220,
        lineGap: 1.5,
      });

    // Title belongs directly above the product table.
    const title = `IZY TECH PROFORMA INVOICE FOR ${cleanTitle(inv.title)}`;
    const titleY = pageY + 193;
    doc.fillColor(TEXT).font('bold').fontSize(9.2)
      .text(title, left - 7, titleY, { width: contentW + 14, lineGap: 1 });
    const titleH = doc.heightOfString(title, { width: contentW + 14, lineGap: 1 });

    // Fixed five-column table: S/N, PRODUCT, UNITS, UNIT PRICE, TOTAL AMOUNT.
    const tableX = left + 4;
    const tableW = contentW - 8;
    const columns = [
      { label: 'S/N', width: 38 },
      { label: 'PRODUCT', width: 154 },
      { label: 'UNITS', width: 72 },
      { label: 'UNIT PRICE ₦', width: 112 },
      { label: 'TOTAL AMOUNT', width: tableW - 38 - 154 - 72 - 112 },
    ];
    const headerY = titleY + titleH + 7;
    const headerH = 29;
    const rowFontSize = 7.6;
    const rowPad = 7;
    let tableY = headerY;

    function drawRow(cells, rowH, options = {}) {
      const fill = options.fill;
      if (fill) doc.rect(tableX, tableY, tableW, rowH).fill(fill);
      doc.rect(tableX, tableY, tableW, rowH).lineWidth(0.55).stroke(GRID);
      let x = tableX;
      cells.forEach((cell, index) => {
        if (index > 0) doc.moveTo(x, tableY).lineTo(x, tableY + rowH).lineWidth(0.45).stroke(GRID);
        const column = columns[index];
        const text = String(cell ?? '');
        const align = options.align?.[index] || (index === 0 || index === 2 ? 'center' : index >= 3 ? 'right' : 'left');
        doc.fillColor(options.color || TEXT).font(options.font || 'body').fontSize(options.size || rowFontSize)
          .text(text, x + (align === 'left' ? 5 : 2), tableY + rowPad, {
            width: column.width - (align === 'left' ? 10 : 4),
            align,
            lineGap: 0.5,
          });
        x += column.width;
      });
      tableY += rowH;
    }

    drawRow(['S/N', 'PRODUCT', 'UNITS', 'UNIT PRICE\n₦', 'TOTAL AMOUNT'], headerH, {
      fill: '#ffffff',
      font: 'bold',
      size: 7.3,
      color: TEXT,
      align: ['center', 'center', 'center', 'center', 'center'],
    });

    const items = Array.isArray(inv.line_items) ? inv.line_items : [];
    items.forEach((item, index) => {
      const description = safe(item.description);
      doc.font('body').fontSize(rowFontSize);
      const productW = columns[1].width - 10;
      const descriptionH = doc.heightOfString(description, { width: productW, lineGap: 0.5 });
      const rowH = Math.max(25, descriptionH + 13);
      drawRow([
        index + 1,
        description,
        safe(item.quantity, ''),
        money(item.unit_price),
        money(item.amount),
      ], rowH, {
        fill: index % 2 === 1 ? '#fbfbfb' : '#ffffff',
        align: ['center', 'left', 'center', 'right', 'right'],
      });
    });

    function totalRow(label, value, bold = false) {
      drawRow(['', '', '', label, value], 22, {
        font: bold ? 'bold' : 'body',
        size: bold ? 8 : 7.8,
        align: ['center', 'left', 'center', 'right', 'right'],
      });
    }

    totalRow('Total', money(inv.subtotal), false);
    totalRow('Service Charge', money(inv.service_charge), false);
    totalRow('Logistic', money(inv.logistics), false);
    const displayedTotal = Number(inv.subtotal || 0)
      + Number(inv.service_charge || 0)
      + Number(inv.logistics || 0)
      - Number(inv.discount || 0);
    totalRow('GRAND TOTAL', money(displayedTotal), true);

    // Notes and payment details are kept below the table, inside the page frame.
    let detailY = tableY + 18;
    if (inv.notes) {
      const notes = String(inv.notes).toUpperCase();
      doc.fillColor(TEXT).font('bold').fontSize(7.8)
        .text(notes, left + 2, detailY, { width: contentW - 4, lineGap: 1.5 });
      detailY += doc.heightOfString(notes, { width: contentW - 4, lineGap: 1.5 }) + 4;
    }

    const paymentLines = [
      ['Account Name:', inv.bank_account_name],
      ['Account Number:', inv.bank_account_number],
      ['Bank:', inv.bank_name],
    ].filter(([, value]) => value);
    if (paymentLines.length) {
      detailY += 8;
      doc.fillColor(TEXT).font('bold').fontSize(8)
        .text('PAYMENT DETAILS:', left + 2, detailY);
      detailY += 12;
      paymentLines.forEach(([label, value]) => {
        doc.fillColor(TEXT).font('body').fontSize(7.8)
          .text(`${label} ${safe(value)}`, left + 2, detailY, { width: contentW - 4 });
        detailY += 11;
      });
    }

    // Letterhead footer: the screenshot uses a cyan band with contact icons.
    doc.rect(pageX + 1, footerY, pageW - 2, footerH - 1).fill(BLUE);
    doc.circle(pageX + 24, footerY, 23).fill('#ffffff');
    doc.circle(pageX + pageW - 24, footerY, 23).fill('#ffffff');
    doc.circle(pageX + pageW * 0.36, footerY + 34, 8).fill('#ffffff');
    doc.fillColor(BLUE).font('bold').fontSize(8)
      .text('i', pageX + pageW * 0.36 - 2, footerY + 29, { width: 4, align: 'center' });
    doc.circle(pageX + pageW * 0.66, footerY + 34, 8).fill('#ffffff');
    doc.fillColor(BLUE).font('bold').fontSize(7)
      .text('@', pageX + pageW * 0.66 - 5, footerY + 30, { width: 10, align: 'center' });
    doc.fillColor('#ffffff').font('bold').fontSize(7.7)
      .text(COMPANY.phone, pageX + pageW * 0.36 + 12, footerY + 30);
    doc.text(COMPANY.email, pageX + pageW * 0.66 + 12, footerY + 30);

    doc.end();
  });
}

module.exports = { generateAltBankLetterPdf };