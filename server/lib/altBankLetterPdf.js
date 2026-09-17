'use strict';

const { generateInvoicePdf } = require('./invoicePdf');

function generateAltBankLetterPdf(inv) {
  return generateInvoicePdf(inv, {
    recipient: {
      label: 'TO',
      lines: [
        'The Manager',
        'The Alternative Bank',
        'Port Harcourt, Rivers State.',
      ],
    },
    includeStatusPill: false,
  });
}

module.exports = { generateAltBankLetterPdf };