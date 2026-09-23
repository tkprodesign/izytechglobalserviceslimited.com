'use strict';

const express = require('express');
const { generateCustomLetterPdf } = require('./lib/customLetterPdf');

const DEFAULT_REPORT = {
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
};

const REPORT_FIELDS = [
  'recipientName',
  'recipientOrganization',
  'recipientLocation',
  'documentDate',
  'title',
  'customerName',
  'system',
  'finding',
  'connectedLoads',
  'operatingHours',
  'observation',
  'recommendation',
  'conclusion',
];

const REQUIRED_FIELDS = REPORT_FIELDS.filter(field => (
  !['recipientName', 'recipientOrganization', 'recipientLocation'].includes(field)
));

function cleanReport(body) {
  const source = body && typeof body === 'object' ? body : {};
  return Object.fromEntries(REPORT_FIELDS.map(field => [
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