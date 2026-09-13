'use strict';

const PDFDocument = require('pdfkit');

const NAVY = '#041627';
const GOLD = '#F0A20E';
const BLUE = '#1a56db';
const SLATE = '#3a4a5c';
const MUTED = '#8fadc8';
const LINE = '#eef1f6';

const COMPANY = {
  name: 'Izy Tech Services',
  legal: 'Izy Technologies Global Services Limited',
  phone: '+234 810 126 2814',
  email: 'info@izytechglobalservices.com',
  site: 'izytechglobalservices.com',
  address: '1 Pathfinder Close, Sandfield, Borikiri, Port Harcourt, Rivers State',
};

function naira(n) {
  const v = Number(n) || 0;
  return '\u20A6' + v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '\u2014';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function esc(s = '') {
  return String(s);
}

/**
 * Generates the official IZY invoice PDF.
 * @returns {Promise<Buffer>}
 */
function generateInvoicePdf(inv) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width;
    const M = 46;

    /* ── Header band ─────────────────────────────────────────── */
    doc.rect(0, 0, W, 118).fill(NAVY);
    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(20)
      .text(COMPANY.name.toUpperCase(), M, 34, { characterSpacing: 1 });
    doc.fillColor('#ffffff').font('Helvetica').fontSize(9.5)
      .text(COMPANY.legal.toUpperCase(), M, 60, { characterSpacing: 1.2 });
    doc.fillColor(MUTED).fontSize(8)
      .text(COMPANY.address, M, 78, { width: W - M * 2 - 160 });
    doc.fillColor(MUTED).fontSize(8)
      .text(COMPANY.phone + '  ·  ' + COMPANY.email + '  ·  ' + COMPANY.site, M, 92);

    // Gold accent bar
    doc.rect(0, 118, W, 3).fill(GOLD);

    // Invoice number block (right)
    doc.fillColor(MUTED).font('Helvetica').fontSize(8)
      .text('INVOICE NO.', W - 170, 34, { width: 124, align: 'right', characterSpacing: 1 });
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(13)
      .text(inv.invoice_number, W - 170, 46, { width: 124, align: 'right' });

    /* ── Meta: dates + status ────────────────────────────────── */
    let y = 148;
    doc.font('Helvetica').fontSize(9);
    const metaRows = [
      ['Issue date', fmtDate(inv.created_at)],
      ['Due date', fmtDate(inv.due_date)],
      ...(inv.status === 'paid' && inv.paid_date ? [['Payment date', fmtDate(inv.paid_date)]] : []),
    ];
    for (const [label, value] of metaRows) {
      doc.fillColor(MUTED).text(label.toUpperCase(), M, y, { characterSpacing: 0.8 });
      doc.fillColor(SLATE).font('Helvetica-Bold').text(value, M + 92, y);
      doc.font('Helvetica');
      y += 16;
    }

    // Status pill
    const pill = inv.status === 'paid' ? 'PAID' : inv.status === 'overdue' ? 'OVERDUE' : inv.status === 'cancelled' ? 'CANCELLED' : 'UNPAID';
    const pillColor = inv.status === 'paid' ? '#16a34a' : inv.status === 'overdue' ? '#dc2626' : inv.status === 'cancelled' ? '#6b7280' : '#b45309';
    const pillW = 84;
    doc.roundedRect(W - M - pillW, 148, pillW, 22, 11).fill(pillColor);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
      .text(pill, W - M - pillW, 155, { width: pillW, align: 'center', characterSpacing: 1.5 });

    /* ── Bill to ─────────────────────────────────────────────── */
    y = Math.max(y, 186) + 10;
    doc.fillColor(MUTED).font('Helvetica').fontSize(8)
      .text('BILL TO', M, y, { characterSpacing: 1.2 });
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12)
      .text(esc(inv.customer_name), M, y + 14);
    doc.fillColor(SLATE).font('Helvetica').fontSize(9.5);
    let by = y + 32;
    if (inv.customer_email) { doc.text(inv.customer_email, M, by); by += 14; }
    if (inv.customer_phone) { doc.text(inv.customer_phone, M, by); by += 14; }
    if (inv.customer_address) {
      doc.text(esc(inv.customer_address), M, by, { width: 280 });
      by += 14 * Math.ceil(esc(inv.customer_address).length / 45);
    }

    /* ── Line items table ────────────────────────────────────── */
    let ty = Math.max(by + 16, 250);
    const colX = { desc: M, qty: W - M - 170, unit: W - M - 110, amt: W - M };

    doc.rect(M, ty, W - M * 2, 24).fill('#f4f6fa');
    doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8);
    doc.text('DESCRIPTION', colX.desc + 10, ty + 8, { characterSpacing: 0.8 });
    doc.text('QTY', colX.qty, ty + 8, { width: 40, align: 'center', characterSpacing: 0.8 });
    doc.text('UNIT PRICE', colX.unit, ty + 8, { width: 90, align: 'right', characterSpacing: 0.8 });
    doc.text('AMOUNT', colX.amt - 90, ty + 8, { width: 90, align: 'right', characterSpacing: 0.8 });

    ty += 24;
    doc.font('Helvetica').fontSize(9.5);
    (inv.line_items || []).forEach((item, i) => {
      const desc = esc(item.description || '—');
      const descLines = doc.heightOfString(desc, { width: colX.qty - colX.desc - 20 });
      const rowH = Math.max(26, descLines + 14);

      if (i % 2 === 1) {
        doc.rect(M, ty, W - M * 2, rowH).fill('#fafbfd');
      }
      doc.fillColor(NAVY).font('Helvetica')
        .text(desc, colX.desc + 10, ty + 7, { width: colX.qty - colX.desc - 20 });
      doc.fillColor(SLATE)
        .text(String(item.quantity), colX.qty, ty + 7, { width: 40, align: 'center' })
        .text(naira(item.unit_price), colX.unit, ty + 7, { width: 90, align: 'right' });
      doc.fillColor(NAVY).font('Helvetica-Bold')
        .text(naira(item.amount), colX.amt - 90, ty + 7, { width: 90, align: 'right' });
      doc.font('Helvetica');

      doc.moveTo(M, ty + rowH).lineTo(W - M, ty + rowH).lineWidth(0.5).stroke(LINE);
      ty += rowH;
    });

    /* ── Totals ──────────────────────────────────────────────── */
    ty += 16;
    const totX = W - M - 220;
    const row = (label, value, opts = {}) => {
      doc.fillColor(opts.bold ? NAVY : SLATE).font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(opts.size || 9.5)
        .text(label, totX, ty, { width: 110, align: 'left' });
      doc.fillColor(opts.color || (opts.bold ? NAVY : SLATE))
        .text(value, totX + 110, ty, { width: 110, align: 'right' });
      ty += (opts.size || 9.5) + 9;
    };

    row('Subtotal', naira(inv.subtotal));
    if (Number(inv.discount) > 0) row('Discount', '-' + naira(inv.discount), { color: '#dc2626' });
    row(inv.tax_label || 'VAT', naira(inv.tax_amount));

    doc.moveTo(totX, ty).lineTo(W - M, ty).lineWidth(1).stroke(NAVY);
    ty += 10;
    row('TOTAL', naira(inv.total), { bold: true, size: 13 });

    /* ── Notes ───────────────────────────────────────────────── */
    if (inv.notes) {
      ty += 8;
      doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8)
        .text('NOTES', M, ty, { characterSpacing: 1 });
      doc.fillColor(SLATE).font('Helvetica').fontSize(9)
        .text(esc(inv.notes), M, ty + 13, { width: W - M * 2, lineGap: 2 });
    }

    /* ── Footer on every page ────────────────────────────────── */
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const H = doc.page.height;
      doc.rect(0, H - 40, W, 40).fill('#f8f9fb');
      doc.rect(0, H - 40, W, 1).fill(LINE);
      doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
        .text(COMPANY.legal + '  ·  ' + COMPANY.address, M, H - 27, { width: W - M * 2, align: 'center' });
      doc.fillColor(MUTED).fontSize(7)
        .text('Thank you for your business.  ·  ' + COMPANY.phone + '  ·  ' + COMPANY.email, M, H - 16, { width: W - M * 2, align: 'center' });
    }

    doc.end();
  });
}

module.exports = { generateInvoicePdf };
