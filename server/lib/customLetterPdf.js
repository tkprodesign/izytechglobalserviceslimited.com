'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const NAVY = '#041627';
const GOLD = '#F0A20E';
const SLATE = '#3a4a5c';
const MUTED = '#8fadc8';
const LINE = '#eef1f6';
const FOOTER_H = 58;
const CONTENT_BOTTOM_GAP = 18;

const COMPANY = {
  legal: 'Izy Technologies Global Services Limited',
  tagline: 'Power the Future, Future-Ready Solutions, Today.',
  phone: '+234 810 126 2814',
  email: 'info@izytechglobalservices.com',
  site: 'izytechglobalservices.com',
  address: '1 Pathfinder Close, Sandfield, Borikiri, Port Harcourt, Rivers State',
  registration: 'RC: 8705481',
};

const SERVER_ASSETS = path.join(process.cwd(), 'server', 'assets');
const LOGO_PATH = path.join(SERVER_ASSETS, 'izy-logo.png');
const FONT_REG = path.join(SERVER_ASSETS, 'fonts', 'DejaVuSans.ttf');
const FONT_BOLD = path.join(SERVER_ASSETS, 'fonts', 'DejaVuSans-Bold.ttf');

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
      const candidate = current ? `${current} ${word}` : word;
      if (current && doc.widthOfString(candidate) > width) {
        lines.push(current);
        current = word;
      } else if (!current && doc.widthOfString(word) > width) {
        let chunk = '';
        for (const character of word) {
          const next = chunk + character;
          if (chunk && doc.widthOfString(next) > width) {
            lines.push(chunk);
            chunk = character;
          } else {
            chunk = next;
          }
        }
        current = chunk;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }

  return lines.length ? lines : ['—'];
}

function formatDocumentDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-NG', {
    timeZone: 'Africa/Lagos',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function registerFonts(doc) {
  if (fs.existsSync(FONT_REG) && fs.existsSync(FONT_BOLD)) {
    doc.registerFont('body', FONT_REG);
    doc.registerFont('bold', FONT_BOLD);
  } else {
    doc.registerFont('body', 'Helvetica');
    doc.registerFont('bold', 'Helvetica-Bold');
  }
}

function drawLogoFallback(doc, x, y, size) {
  doc.roundedRect(x, y, size, size, 10).fill(GOLD);
  doc.fillColor(NAVY).font('bold').fontSize(22)
    .text('IZY', x, y + 16, { width: size, align: 'center' });
}

function drawLetterheadHeader(doc, geometry, continuation = false) {
  const { W, M, RIGHT } = geometry;

  if (continuation) {
    doc.fillColor(NAVY).font('bold').fontSize(10)
      .text('REPORT CONTINUED', M, 34, { characterSpacing: 1 });
    doc.fillColor(MUTED).font('body').fontSize(9)
      .text(COMPANY.legal, RIGHT - 230, 35, { width: 230, align: 'right' });
    doc.rect(M, 55, W - M * 2, 1).fill(LINE);
    return 75;
  }

  const headerH = 148;
  doc.rect(0, 0, W, headerH).fill(NAVY);

  const logoSize = 56;
  const logoY = 38;
  doc.roundedRect(M, logoY, logoSize, logoSize, 12).fill('#ffffff');
  if (fs.existsSync(LOGO_PATH)) {
    try {
      doc.image(LOGO_PATH, M + 6, logoY + 6, {
        width: logoSize - 12,
        height: logoSize - 12,
      });
    } catch (_) {
      drawLogoFallback(doc, M, logoY, logoSize);
    }
  } else {
    drawLogoFallback(doc, M, logoY, logoSize);
  }

  const tx = M + logoSize + 16;
  doc.fillColor('#ffffff').font('bold').fontSize(11.5)
    .text(COMPANY.legal, tx, logoY + 1, { width: 300 });
  doc.fillColor(GOLD).font('body').fontSize(7.5)
    .text(COMPANY.tagline, tx, logoY + 20, { width: 300 });
  doc.fillColor(MUTED).font('body').fontSize(8)
    .text(COMPANY.address, tx, logoY + 35, { width: 300, lineGap: 1 });
  doc.fillColor(MUTED).font('body').fontSize(7.5)
    .text(COMPANY.registration, tx, logoY + 51, { width: 300 });

  const detailX = RIGHT - 168;
  const detailW = 168;
  doc.fillColor(MUTED).font('body').fontSize(7.5)
    .text('OFFICIAL REPORT', detailX, 52, {
      width: detailW,
      align: 'right',
      characterSpacing: 1,
    });
  doc.fillColor('#ffffff').font('bold').fontSize(13)
    .text('IZY / REPORT', detailX, 65, { width: detailW, align: 'right' });
  doc.rect(0, headerH, W, 3).fill(GOLD);

  return headerH + 30;
}

function drawFooters(doc, geometry) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    const pageH = doc.page.height;
    doc.rect(0, pageH - FOOTER_H, geometry.W, FOOTER_H).fill('#f8f9fb');
    doc.rect(0, pageH - FOOTER_H, geometry.W, 1).fill(LINE);

    const centered = (text, size, y) => {
      doc.fontSize(size);
      doc.text(text, (geometry.W - doc.widthOfString(text)) / 2, y, { lineBreak: false });
    };

    doc.fillColor(MUTED).font('body');
    centered(COMPANY.legal, 9.5, pageH - 48);
    centered(COMPANY.address, 9, pageH - 35);
    centered(`${COMPANY.registration}  ·  ${COMPANY.phone}  ·  ${COMPANY.email}  ·  ${COMPANY.site}`, 8.75, pageH - 22);

    const pageLabel = `Page ${i - range.start + 1} of ${range.count}`;
    doc.fontSize(8).text(pageLabel, geometry.RIGHT - doc.widthOfString(pageLabel), pageH - 9, {
      lineBreak: false,
    });
  }
}

/**
 * Generates a custom report on the same A4 letterhead used by invoices and
 * Alternative Bank correspondence.
 */
function generateCustomLetterPdf(input = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    registerFonts(doc);

    const W = doc.page.width;
    const M = 48;
    const RIGHT = W - M;
    const geometry = { W, M, RIGHT };
    const contentBottom = () => doc.page.height - FOOTER_H - CONTENT_BOTTOM_GAP;
    const report = {
      recipientName: '',
      recipientOrganization: '',
      recipientLocation: '',
      documentDate: '2026-09-23',
      title: 'SOLAR SYSTEM AUDIT REPORT',
      customerName: 'Mr Stephen Ukaegbu',
      system: '6 kW Hybrid Inverter / 10 kWh Lithium Battery',
      finding: 'Undersized Solar Panel Array',
      connectedLoads: '- 5 Ceiling Fans\n- 2 Freezers\n- 1 HP Inverter Air Conditioner',
      operatingHours: 'The system is used mainly during the daytime and evening hours. The connected appliances are not operated simultaneously, and the actual load varies depending on the appliances in use.',
      observation: 'During system inspection, it was observed that the installed solar panel capacity is adequate for the 10 kWh lithium battery and 6 kW hybrid inverter under the current operating conditions.\n\nHowever, an enhancement of the existing PV capacity will improve battery charging performance and further increase the uptime of the inverter and battery system for the customer.',
      recommendation: 'The existing solar panel array should be enhanced by increasing the total PV capacity to increase the uptime of the inverter and battery system. This will improve charging performance and further extend the available operating hours of the system during normal solar hours.',
      conclusion: 'The current PV capacity needs to be increased to meet the desired capacity of the customer for increased uptime hours. A PV upgrade by increasing the quantity of solar panels is recommended.',
      ...input,
    };

    let y = drawLetterheadHeader(doc, geometry);

    doc.fillColor(MUTED).font('body').fontSize(8)
      .text('DATE', M, y, { characterSpacing: 1.2 });
    doc.fillColor(SLATE).font('bold').fontSize(10)
      .text(formatDocumentDate(report.documentDate), M + 92, y);
    y += 32;

    const recipientText = [
      report.recipientName,
      report.recipientOrganization,
      report.recipientLocation,
    ].filter(Boolean).join('\n');
    if (recipientText) {
      doc.fillColor(MUTED).font('body').fontSize(8)
        .text('TO', M, y, { characterSpacing: 1.2 });
      doc.fillColor(NAVY).font('bold').fontSize(12)
        .text(recipientText, M, y + 15, { width: 330, lineGap: 1 });
      y += 15 + doc.heightOfString(recipientText, { width: 330, lineGap: 1 }) + 28;
    } else {
      y += 12;
    }

    doc.fillColor(NAVY).font('bold').fontSize(18)
      .text(String(report.title).toUpperCase(), M, y, { width: W - M * 2, align: 'center' });
    y += doc.heightOfString(String(report.title).toUpperCase(), { width: W - M * 2 }) + 10;
    doc.moveTo(M + 150, y).lineTo(RIGHT - 150, y).lineWidth(1).stroke(GOLD);
    y += 20;

    const infoH = 78;
    if (y + infoH > contentBottom()) {
      doc.addPage({ size: 'A4', margin: 0 });
      y = drawLetterheadHeader(doc, geometry, true);
    }
    doc.rect(M, y, RIGHT - M, infoH).fill('#f4f6fa');
    doc.fillColor(MUTED).font('bold').fontSize(7.5).text('CUSTOMER', M + 14, y + 12, { characterSpacing: 1 });
    doc.fillColor(NAVY).font('body').fontSize(10).text(String(report.customerName || '—'), M + 14, y + 26, {
      width: RIGHT - M - 28,
      lineBreak: false,
    });
    doc.fillColor(MUTED).font('bold').fontSize(7.5).text('SYSTEM', M + 14, y + 47, { characterSpacing: 1 });
    doc.fillColor(NAVY).font('body').fontSize(10).text(String(report.system), M + 14, y + 61, {
      width: 205,
      lineBreak: false,
    });
    doc.fillColor(MUTED).font('bold').fontSize(7.5).text('FAULT', M + 250, y + 47, { characterSpacing: 1 });
    doc.fillColor(NAVY).font('body').fontSize(10).text(String(report.finding), M + 250, y + 61, {
      width: RIGHT - (M + 250) - 14,
      lineBreak: false,
    });
    y += infoH + 28;

    const drawSection = (heading, body) => {
      const width = RIGHT - M;
      doc.font('body').fontSize(10.5);
      const lines = wrapTextByWidth(doc, body, width);
      const sectionHeight = 23 + lines.length * 15 + 20;
      if (y + sectionHeight > contentBottom()) {
        doc.addPage({ size: 'A4', margin: 0 });
        y = drawLetterheadHeader(doc, geometry, true);
      }

      doc.rect(M, y + 2, 4, 14).fill(GOLD);
      doc.fillColor(NAVY).font('bold').fontSize(11)
        .text(heading.toUpperCase(), M + 13, y, { characterSpacing: 0.7 });
      y += 23;
      doc.fillColor(SLATE).font('body').fontSize(10.5);
      lines.forEach((line, index) => {
        doc.text(line || ' ', M, y + index * 15, { lineBreak: false });
      });
      y += lines.length * 15 + 20;
    };

    drawSection('Connected Loads', report.connectedLoads);
    drawSection('Operating Hours', report.operatingHours);
    drawSection('Observation', report.observation);
    drawSection('Recommendation', report.recommendation);
    drawSection('Conclusion', report.conclusion);

    drawFooters(doc, geometry);
    doc.end();
  });
}

module.exports = { generateCustomLetterPdf };