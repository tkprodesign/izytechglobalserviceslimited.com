'use strict';

const express = require('express');
const { generateCustomLetterPdf } = require('./lib/customLetterPdf');

const DEFAULT_REPORT = {
  recipientName: 'The Manager',
  recipientOrganization: 'The Alternative Bank',
  recipientLocation: 'Port Harcourt, Rivers State.',
  documentDate: '2026-09-22',
  title: 'SOLAR SYSTEM AUDIT REPORT',
  system: '6 kW Hybrid Inverter / 10 kWh Lithium Battery',
  finding: 'Undersized Solar Panel Array',
  connectedLoads: '- 5 Ceiling Fans\n- 2 Freezers\n- 1 HP Inverter Air Conditioner',
  operatingHours: 'The system is used mainly during the daytime and evening hours. The connected appliances are not operated simultaneously, and the actual load varies depending on the appliances in use.',
  observation: 'During system inspection, it was observed that the installed solar panel capacity is inadequate for the 10 kWh lithium battery and 6 kW hybrid inverter.\n\nThe available PV generation is insufficient to provide effective battery charging during the available sunlight hours. This is causing extended charging time and reduced battery availability.',
  recommendation: 'The existing solar panel array should be upgraded by increasing the total PV capacity to a suitable level for the inverter and battery system. This will improve charging performance and ensure the battery can be adequately charged during normal solar hours.',
  conclusion: 'The low PV capacity is the main cause of the poor battery charging performance. PV array upgrade is recommended.',
};

const REQUIRED_FIELDS = [
  'recipientName',
  'recipientOrganization',
  'recipientLocation',
  'documentDate',
  'title',
  'system',
  'finding',
  'connectedLoads',
  'operatingHours',
  'observation',
  'recommendation',
  'conclusion',
];

function cleanReport(body) {
  const source = body && typeof body === 'object' ? body : {};
  return Object.fromEntries(REQUIRED_FIELDS.map(field => [
    field,
    String(source[field] ?? DEFAULT_REPORT[field]).trim(),
  ]));
}

function filenamePart(value) {
  return String(value || 'custom-report')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'custom-report';
}

function createCustomDocumentsRouter({ requireDev }) {
  const router = express.Router();

  router.post('/api/dev/custom-documents/letterhead-pdf', requireDev, async (req, res) => {
    try {
      const report = cleanReport(req.body);
      const missing = REQUIRED_FIELDS.filter(field => !report[field]);
      if (missing.length) {
        return res.status(400).json({ error: `Complete the required fields: ${missing.join(', ')}` });
      }

      const pdf = await generateCustomLetterPdf(report);
      const filename = `${filenamePart(report.title)}_${report.documentDate || 'undated'}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(pdf);
    } catch (error) {
      console.error('Custom letterhead PDF error:', error.message);
      return res.status(500).json({ error: 'Could not generate the custom letterhead PDF.' });
    }
  });

  return router;
}

module.exports = { createCustomDocumentsRouter, DEFAULT_REPORT };