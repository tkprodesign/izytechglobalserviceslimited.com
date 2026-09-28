type Row = { description: string; quantity: number; unit_price: number; amount: number };
type Section = { title: string; description: string | null; rows: Row[]; logistics: string; service_charge: string };
type InvoiceItems = { sections: Section[]; line_items: Row[]; logistics: string; service_charge: string };

/** Move existing flat items and charges into the first section without losing edits. */
export function appendInvoiceSection<T extends InvoiceItems>(form: T): T {
  const sections = form.sections.map(section => ({ ...section, rows: section.rows.map(row => ({ ...row })) }));
  if (!sections.length && (form.line_items.some(row => row.description.trim() || row.unit_price || row.amount)
      || Number(form.logistics) || Number(form.service_charge))) {
    sections.push({ title: 'Section 1', description: '', rows: form.line_items.map(row => ({ ...row })),
      logistics: form.logistics, service_charge: form.service_charge });
  }
  sections.push({ title: '', description: '', logistics: '0', service_charge: '0',
    rows: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }] });
  return { ...form, sections, line_items: [], logistics: '0', service_charge: '0' };
}
