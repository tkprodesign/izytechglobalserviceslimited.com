import { useState } from 'react';

import { Plus, Trash2, PlusCircle } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Row {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Section {
  title: string;
  description: string | null;
  rows: Row[];
}

type SectionTree = Section[];

interface SectionsEditorProps {
  sections: SectionTree;
  onChange: (next: { sections: SectionTree } & Record<string, unknown>) => void;
  onAddSection(): void;
  onRemoveSection(index: number): void;
  onAddRow(sectionIndex: number): void;
  onRemoveRow(sectionIndex: number, rowIndex: number): void;
  onRowChange(sectionIndex: number, rowIndex: number, field: keyof Row, value: string | number): void;
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

const currency = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG');

function naira(n: number): string {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export function SectionsEditor({
  sections,
  onChange,
  onAddSection,
  onRemoveSection,
  onAddRow,
  onRemoveRow,
  onRowChange,
}: SectionsEditorProps) {
  const [expanded, setExpanded] = useState<number | null>(sections.findIndex(s => Array.isArray(s.rows) && s.rows.length > 0) === -1 ? null : 0);

  function toggleSection(index: number) {
    setExpanded(prev => prev === index ? null : index);
  }

  function sectionTitle(section: Section) {
    return section.title.trim() || `Section ${sections.indexOf(section) + 1}`;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="rounded-xl border overflow-hidden" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => toggleSection(sectionIndex)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
            style={{ color: '#0f172a' }}
          >
            <div className="flex items-center gap-2">
              <PlusCircle size={14} style={{ color: '#f26522' }} />
              <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                {sectionTitle(section)}
              </span>
              {section.description ? (
                <span className="text-xs truncate max-w-[200px] md:max-w-none" style={{ color: '#64748b' }} title={section.description}>
                  — {section.description}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums" style={{ color: '#64748b' }}>
                {Array.isArray(section.rows) ? section.rows.reduce((sum, r) => sum + Number(r.amount || 0), 0) : 0} ₦
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {Array.isArray(section.rows) ? section.rows.filter(r => (r.description || '').trim()).length : 0} items
              </span>
              <button
                type="button"
                onClick={() => onRemoveSection(sectionIndex)}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500"
                style={{ color: '#dc2626' }}
                title="Remove section"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </button>

          {expanded === sectionIndex ? (
            <div className="px-4 pb-4 space-y-3 border-t border-border/30">
              {/* Section row editor */}
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Section title</label>
                  <input
                    value={section.title}
                    onChange={(e) => onRowChange(sectionIndex, -1, 'title' as keyof Row, e.target.value)}
                    placeholder="e.g. Solar Installation"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]20"
                    style={{ borderColor: '#e2e8f0', background: '#fff' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Section description (optional)</label>
                  <input
                    value={section.description ?? ''}
                    onChange={(e) => onRowChange(sectionIndex, -1, 'description', e.target.value)}
                    placeholder="Short label shown on the invoice"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]20"
                    style={{ borderColor: '#e2e8f0', background: '#fff' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onAddRow(sectionIndex)}
                  className="p-2 rounded-lg hover:bg-blue-50 transition-colors text-[#2563eb]"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Row editor */}
              <div className="space-y-2">
                {Array.isArray(section.rows) ? (
                  section.rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2 items-start rounded-lg border p-3" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                      <div className="flex-1 min-w-0">
                        <input
                          value={row.description}
                          onChange={(e) => onRowChange(sectionIndex, rowIndex, 'description', e.target.value)}
                          placeholder="Description of product/service"
                          className="w-full px-2.5 py-2 text-sm rounded border outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]20"
                          style={{ borderColor: '#e2e8f0', background: '#fff', color: '#0f172a' }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.quantity}
                            onChange={(e) => onRowChange(sectionIndex, rowIndex, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qty"
                            className="w-full px-2.5 py-2 text-xs rounded border outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]20"
                            style={{ borderColor: '#e2e8f0', background: '#fff', color: '#0f172a' }}
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.unit_price}
                            onChange={(e) => onRowChange(sectionIndex, rowIndex, 'unit_price', parseFloat(e.target.value) || 0)}
                            placeholder="Unit price"
                            className="w-full px-2.5 py-2 text-xs rounded border outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]20"
                            style={{ borderColor: '#e2e8f0', background: '#fff', color: '#0f172a' }}
                          />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 mt-5">
                        <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{currency(row.amount)}</p>
                        <button
                          type="button"
                          onClick={() => onRemoveRow(sectionIndex, rowIndex)}
                          className="text-xs mt-1 hover:text-red-500 transition-colors"
                          style={{ color: '#94a3b8' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No rows yet — add rows below.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        onClick={onAddSection}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold text-[#f26522] hover:bg-[#fffbeb] transition-colors border-[#fde68a]"
        style={{ borderColor: '#fde68a', background: '#fff' }}
      >
        <Plus size={14} /> Add section
      </button>
    </div>
  );
}
