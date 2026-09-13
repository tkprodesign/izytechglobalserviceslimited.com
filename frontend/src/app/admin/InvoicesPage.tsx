import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { DashboardLayout } from './DashboardLayout';
import { getToken, removeToken } from '../../lib/auth';
import { ngDate, ngDateTime } from '../../lib/ngtime';
import { jsPDF } from 'jspdf';
import {
  FileText, Plus, Trash2, Send, Eye, Edit2, Pencil, ChevronDown, X, Download,
  Loader2, CheckCircle, Clock, AlertCircle, Search, Filter,
  Mail, PlusCircle,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  line_items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_label: string;
  tax_amount: number;
  discount: number;
  total: number;
  notes: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

type FormState = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  line_items: LineItem[];
  tax_rate: string;
  tax_label: string;
  discount: string;
  notes: string;
  due_date: string;
  status: string;
};

function defaultValue(): FormState {
  return {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    line_items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }],
    tax_rate: '7.50',
    tax_label: 'VAT (7.5%)',
    discount: '0',
    notes: '',
    due_date: '',
    status: 'unpaid',
  };
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function naira(n: number): string {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

function fmtDate(d: string | null) {
  return ngDate(d);
}

function statusColor(status: string) {
  switch (status) {
    case 'paid': return '#16a34a';
    case 'overdue': return '#dc2626';
    case 'cancelled': return '#6b7280';
    default: return '#b45309';
  }
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    unpaid: 'Unpaid',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  };
  return labels[status] ?? status;
}

/* ── PDF Export ────────────────────────────────────────────────────────────── */

async function generateInvoicePdf(inv: Invoice) {
  const doc = new jsPDF();
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  const x = margin;

  // Header stripe
  doc.setFillColor(15, 23, 46);
  doc.rect(0, 0, pageW, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('IZY TECH SERVICES', x, 20);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Technology and Energy Solutions', x, 26);

  // Invoice title & number
  doc.setTextColor(15, 23, 46);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('INVOICE', pageW - margin, 20, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Invoice #' + inv.invoice_number, pageW - margin, 26, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(x, 40, pageW - margin, 40);

  // Status badge
  const statusY = 46;
  const statusColorNum = (inv.status === 'paid' ? [22, 163, 74] : inv.status === 'overdue' ? [220, 38, 38] : [180, 83, 9]);
  doc.setFillColor(...statusColorNum);
  doc.roundedRect(pageW - margin - 40, statusY - 3, 40, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(statusLabel(inv.status).toUpperCase(), pageW - margin - 20, statusY + 1.5, { align: 'center' });

  // Bill to / Details
  doc.setTextColor(51, 65, 81);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);

  const col2X = x + contentW / 2 + 8;
  let y = 62;

  // Bill to
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('BILL TO', x, y);
  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 46);
  doc.text(inv.customer_name, x, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(inv.customer_email, x, y);
  y += 5;
  if (inv.customer_phone) { doc.text(inv.customer_phone, x, y); y += 5; }
  if (inv.customer_address) {
    const addrLines = wrapText(inv.customer_address, 80);
    addrLines.forEach(line => { doc.text(line, x, y); y += 4.5; });
  }

  // Details
  y = 62;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('INVOICE DETAILS', col2X, y);
  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Invoice:', col2X, y);
  doc.setTextColor(15, 23, 46);
  doc.setFont('Helvetica', 'bold');
  doc.text(inv.invoice_number, col2X + 32, y);
  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Date:', col2X, y);
  doc.setTextColor(15, 23, 46);
  doc.text(ngDate(inv.created_at), col2X + 22, y);
  if (inv.due_date) {
    y += 5;
    doc.setTextColor(100, 116, 139);
    doc.text('Due:', col2X, y);
    doc.setTextColor(15, 23, 46);
    doc.text(fmtDate(inv.due_date), col2X + 22, y);
  }

  // Divider
  y = Math.max(doc.getY() + 14, 100);
  doc.setDrawColor(226, 232, 240);
  doc.line(x, y, pageW - margin, y);
  y += 10;

  // Table header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const colW = [contentW * 0.50, contentW * 0.08, contentW * 0.17, contentW * 0.17];
  const colXPositions = [x, x + colW[0], x + colW[0] + colW[1], x + colW[0] + colW[1] + colW[2]];
  doc.text('Description', colXPositions[0] + 2, y);
  doc.text('Qty', colXPositions[1] + 4, y, { align: 'center' });
  doc.text('Unit Price', colXPositions[2] + 4, y, { align: 'right' });
  doc.text('Amount', colXPositions[3] + 2, y, { align: 'right' });
  y += 7;

  // Table rows
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 81);
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.2);

  for (const item of inv.line_items) {
    const descLines = wrapText(item.description || '(no description)', 95);
    descLines.forEach((line, i) => {
      doc.text(line, colXPositions[0] + 2, y + i * 5);
    });
    const descH = descLines.length * 5;
    doc.text(item.quantity.toString(), colXPositions[1] + 4, y + descH / 2, { align: 'center' });
    doc.text(naira(item.unit_price), colXPositions[2] + 4, y + descH / 2, { align: 'right' });
    doc.text(naira(item.amount), colXPositions[3] + 2, y + descH / 2, { align: 'right' });
    doc.line(colXPositions[0], y + descH + 1, pageW - margin, y + descH + 1);
    y += descH + 4;
    if (y > 250) {
      doc.addPage();
      y = 20;
      doc.setFont('Helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
      doc.text('Description', colXPositions[0] + 2, y);
      doc.text('Qty', colXPositions[1] + 4, y, { align: 'center' });
      doc.text('Unit Price', colXPositions[2] + 4, y, { align: 'right' });
      doc.text('Amount', colXPositions[3] + 2, y, { align: 'right' });
      y += 7;
      doc.setFont('Helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(51, 65, 81);
    }
  }

  // Totals section
  y += 8;
  const totalStartX = pageW - margin - 70;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(totalStartX - 4, y, pageW - margin, y);
  y += 8;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal', totalStartX, y);
  doc.text(naira(inv.subtotal), pageW - margin, y, { align: 'right' });
  y += 6;

  doc.text(inv.tax_label, totalStartX, y);
  doc.text(naira(inv.tax_amount), pageW - margin, y, { align: 'right' });
  y += 6;

  if (Number(inv.discount) > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('Discount', totalStartX, y);
    doc.text('-' + naira(inv.discount), pageW - margin, y, { align: 'right' });
    y += 6;
    doc.setTextColor(100, 116, 139);
  }

  doc.setDrawColor(15, 23, 46);
  doc.setLineWidth(0.8);
  doc.line(totalStartX - 4, y, pageW - margin, y);
  y += 8;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 46);
  doc.text('TOTAL DUE', totalStartX, y);
  doc.text(naira(inv.total), pageW - margin, y, { align: 'right' });

  // Footer
  const footerY = 270;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(x, footerY - 10, pageW - margin, footerY - 10);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('Izy Technologies Global Services Limited', x, footerY);
  doc.text('+234 810 126 2814  |  info@izytechglobalservices.com', x, footerY + 4);
  doc.text('Mon-Sat, 8am-6pm', x, footerY + 8);

  return doc;
}

function wrapText(text: string, maxChars: number): string[] {
  if (!text.trim()) return ['-'];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ['-'];
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */

export function InvoicesPage() {
  const token = getToken();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultValue());

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sending, setSending] = useState<number | null>(null);
  const [sent, setSent] = useState<number | null>(null);
  const [sendingError, setSendingError] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API + '/api/admin/invoices', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setInvoices(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [token]);

  function setField(key: keyof FormState, value: string | LineItem[] | number) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addLineItem() {
    setForm(f => ({
      ...f,
      line_items: [...f.line_items, { description: '', quantity: 1, unit_price: 0, amount: 0 }],
    }));
  }

  function removeLineItem(index: number) {
    setForm(f => ({
      ...f,
      line_items: f.line_items.filter((_, i) => i !== index),
    }));
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    setForm(f => {
      const items = [...f.line_items];
      items[index] = { ...items[index], [field]: value };
      // Recalculate amounts
      for (let i = 0; i < items.length; i++) {
        items[i] = {
          ...items[i],
          amount: (items[i].quantity || 0) * (items[i].unit_price || 0),
        };
      }
      return { ...f, line_items: items };
    });
  }

  function resetForm() {
    setForm(defaultValue());
    setEditing(false);
    setEditingId(null);
    setMobileView('list');
  }

  function openEdit(inv: Invoice) {
    setForm({
      customer_name: inv.customer_name,
      customer_email: inv.customer_email,
      customer_phone: inv.customer_phone,
      customer_address: inv.customer_address,
      line_items: JSON.parse(JSON.stringify(inv.line_items || [])),
      tax_rate: String(inv.tax_rate ?? 7.5),
      tax_label: inv.tax_label || 'VAT (7.5%)',
      discount: String(inv.discount ?? 0),
      notes: inv.notes || '',
      due_date: inv.due_date || '',
      status: inv.status,
    });
    setEditing(true);
    setEditingId(inv.id);
    setMobileView('editor');
  }

  async function handleSave() {
    const lineItems = form.line_items.filter(li =>
      (li.description || '').trim() && (li.quantity || 0) > 0 && (li.unit_price || 0) > 0
    );

    const payload = {
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim(),
      customer_phone: form.customer_phone.trim(),
      customer_address: form.customer_address.trim(),
      line_items: lineItems,
      tax_rate: parseFloat(form.tax_rate) || 7.5,
      tax_label: form.tax_label.trim() || 'VAT (7.5%)',
      discount: parseFloat(form.discount) || 0,
      notes: form.notes.trim(),
      due_date: form.due_date || null,
      status: form.status,
    };

    try {
      const url = editingId ? API + '/api/admin/invoices/' + editingId : API + '/api/admin/invoices';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setEditing(false);
      setEditingId(null);
      setMobileView('list');
      // The backend auto-emails the invoice (with PDF attached) to the customer
      // address on every create/update — surface the outcome to the user.
      if (data.email_sent) {
        setSent(editingId || (data.data && data.data.id) || 0);
        setTimeout(() => setSent(null), 4000);
      } else {
        setError(
          'Invoice saved, but the email to ' + (payload.customer_email || 'the customer') +
          ' could not be sent' + (data.email_error ? ': ' + data.email_error : '.') +
          ' Use the send button on the invoice to retry.'
        );
      }
      loadInvoices();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function handleDelete(inv: Invoice) {
    if (!confirm('Delete invoice ' + inv.invoice_number + '? This cannot be undone.')) return;
    try {
      const res = await fetch(API + '/api/admin/invoices/' + inv.id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      loadInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function handleSend(inv: Invoice) {
    setSending(inv.id);
    setSendingError('');
    try {
      const res = await fetch(API + '/api/admin/invoices/' + inv.id + '/send', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setSent(inv.id);
      setTimeout(() => setSent(null), 3000);
    } catch (err) {
      setSendingError(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(null);
    }
  }

  async function handleDownloadPdf(inv: Invoice) {
    setGeneratingPdf(true);
    try {
      const doc = await generateInvoicePdf(inv);
      doc.save('Invoice_' + inv.invoice_number + '.pdf');
    } catch (err) {
      setError('PDF generation failed: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setGeneratingPdf(false);
    }
  }

  function filteredInvoices() {
    let list = invoices;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(inv =>
        inv.customer_name.toLowerCase().includes(q) ||
        inv.customer_email.toLowerCase().includes(q) ||
        inv.invoice_number.toLowerCase().includes(q)
      );
    }
    if (filterStatus) {
      list = list.filter(inv => inv.status === filterStatus);
    }
    return list;
  }

  // Calculate form totals
  const formSubtotal = form.line_items.reduce((s, i) => s + i.amount, 0);
  const formTaxRate = parseFloat(form.tax_rate) || 7.5;
  const formTaxAmount = Math.round(formSubtotal * formTaxRate) / 100;
  const formDiscount = parseFloat(form.discount) || 0;
  const formTotal = formSubtotal + formTaxAmount - formDiscount;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto" style={{ background: '#f8fafc', minHeight: 'calc(100vh - 3.5rem)' }}>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Invoices</h1>
              <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                Create, manage, and send invoices to customers.
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setMobileView('editor'); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              <PlusCircle size={15} />
              New Invoice
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-4" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* ═══ Invoice List ═══ */}
        <div className={`rounded-2xl border overflow-hidden ${mobileView === 'editor' ? 'hidden' : ''}`} style={{ background: '#fff', borderColor: '#e2e8f0' }}>
          {/* Filters */}
          <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, or invoice #"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
              />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a', minWidth: 120 }}
              >
                <option value="">All statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={22} className="animate-spin" style={{ color: '#2563eb' }} />
            </div>
          ) : filteredInvoices().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                <FileText size={20} style={{ color: '#cbd5e1' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                {search || filterStatus ? 'No matching invoices' : 'No invoices yet'}
              </p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                {search || filterStatus ? 'Try a different search' : 'Create your first invoice to start billing customers'}
              </p>
            </div>
          ) : (
            <>
            {/* ── Mobile: stacked cards (no horizontal scroll needed) ── */}
            <div className="md:hidden divide-y" style={{ borderColor: '#e2e8f0' }}>
              {filteredInvoices().map(inv => (
                <div key={inv.id} className="p-4" style={{ borderColor: '#e2e8f0' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{inv.invoice_number}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Due {fmtDate(inv.due_date) || '—'}</p>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: statusColor(inv.status) + '16', color: statusColor(inv.status) }}
                    >
                      {inv.status === 'paid' ? <CheckCircle size={11} /> : inv.status === 'overdue' ? <AlertCircle size={11} /> : inv.status === 'cancelled' ? null : <Clock size={11} />}
                      {statusLabel(inv.status)}
                    </span>
                  </div>

                  <div className="mt-2 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#0f172a' }}>{inv.customer_name}</p>
                    <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{inv.customer_email}</p>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between gap-3">
                    <p className="text-base font-bold" style={{ color: '#0f172a' }}>{naira(inv.total)}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Created {ngDate(inv.created_at)}</p>
                  </div>
                  {Number(inv.discount) > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: '#dc2626' }}>-{naira(inv.discount)} discount</p>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPdf(inv)}
                      disabled={generatingPdf}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-40 active:bg-blue-50"
                      style={{ borderColor: '#e2e8f0', color: '#2563eb' }}
                    >
                      <Download size={13} /> PDF
                    </button>
                    <button
                      onClick={() => openEdit(inv)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors active:bg-gray-100"
                      style={{ borderColor: '#e2e8f0', color: '#334155' }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleSend(inv)}
                      disabled={sending === inv.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-40 active:bg-green-50"
                      style={{ borderColor: '#e2e8f0', color: '#16a34a' }}
                    >
                      <Mail size={13} className={sending === inv.id ? 'animate-pulse' : ''} /> Send
                    </button>
                    {inv.status !== 'cancelled' && (
                      <button
                        onClick={() => handleDelete(inv)}
                        disabled={sending === inv.id}
                        className="ml-auto p-2 rounded-lg border transition-colors disabled:opacity-40 active:bg-red-50"
                        style={{ borderColor: '#e2e8f0', color: '#dc2626' }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop: table ── */}
            <table className="w-full hidden md:table">
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Invoice</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Customer</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: '#94a3b8' }}>Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Total</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: '#94a3b8' }}>Date</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices().map(inv => (
                  <tr key={inv.id} className="border-t hover:bg-gray-50/80 transition-colors" style={{ borderColor: '#e2e8f0' }}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{inv.invoice_number}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{fmtDate(inv.due_date) || 'No due date'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium" style={{ color: '#0f172a' }}>{inv.customer_name}</p>
                      <p className="text-xs truncate max-w-[180px] md:max-w-none" style={{ color: '#94a3b8' }}>{inv.customer_email}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: statusColor(inv.status) + '16', color: statusColor(inv.status) }}
                      >
                        {inv.status === 'paid' ? <CheckCircle size={11} /> : inv.status === 'overdue' ? <AlertCircle size={11} /> : inv.status === 'cancelled' ? null : <Clock size={11} />}
                        {statusLabel(inv.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{naira(inv.total)}</p>
                      {Number(inv.discount) > 0 && <p className="text-xxs mt-0.5" style={{ color: '#dc2626' }}>-{naira(inv.discount)} discount</p>}
                    </td>
                    <td className="px-5 py-3 text-right hidden md:table-cell">
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{ngDate(inv.created_at)}</p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownloadPdf(inv)}
                          disabled={generatingPdf}
                          className="p-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-40"
                          title="Download PDF"
                        >
                          <Download size={14} style={{ color: '#2563eb' }} />
                        </button>
                        <button
                          onClick={() => openEdit(inv)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} style={{ color: '#64748b' }} />
                        </button>
                        <button
                          onClick={() => handleSend(inv)}
                          disabled={sending === inv.id}
                          className="p-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-40"
                          title="Send by email"
                        >
                          <Mail size={14} style={{ color: '#16a34a' }} className={sending === inv.id ? 'animate-pulse' : ''} />
                        </button>
                        {inv.status !== 'cancelled' && (
                          <button
                            onClick={() => handleDelete(inv)}
                            disabled={sending === inv.id}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 size={14} style={{ color: '#dc2626' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          )}
        </div>

        {/* ═══ Mobile stats strip ═══ */}
        {mobileView === 'list' && invoices.length > 0 && (
          <div className="md:hidden mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Total Invoices', value: invoices.length, color: '#2563eb' },
              { label: 'Pending', value: invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length, color: '#b45309' },
              { label: 'Paid', value: invoices.filter(i => i.status === 'paid').length, color: '#16a34a' },
              { label: 'Total Revenue', value: naira(invoices.reduce((s, i) => s + (i.status === 'paid' ? i.total : 0), 0)), color: '#6366f1' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border p-4" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
                <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>{stat.label}</p>
                <p className="text-lg font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ═══ Editor ═══ */}
        <div className={`rounded-2xl border overflow-hidden bg-white ${mobileView === 'list' ? 'hidden' : ''}`} style={{ borderColor: '#e2e8f0' }}>
          {/* Editor header */}
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-center gap-2">
              <FileText size={15} style={{ color: '#2563eb' }} />
              <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                {editing ? 'Edit Invoice' : 'New Invoice'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileView('list')}
                className="flex md:hidden items-center gap-1 text-xs font-medium"
                style={{ color: '#2563eb' }}
              >
                <ChevronDown size={14} className="rotate-90" /> Back
              </button>
              {editing && (
                <button
                  onClick={resetForm}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={15} style={{ color: '#94a3b8' }} />
                </button>
              )}
            </div>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-20rem)]">
            {/* Customer details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Customer Name *</label>
                <input
                  value={form.customer_name}
                  onChange={e => setField('customer_name', e.target.value)}
                  placeholder="e.g. Acme Energy Ltd"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Customer Email *</label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={e => setField('customer_email', e.target.value)}
                  placeholder="billing@company.com"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Phone</label>
                <input
                  value={form.customer_phone}
                  onChange={e => setField('customer_phone', e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Address</label>
                <input
                  value={form.customer_address}
                  onChange={e => setField('customer_address', e.target.value)}
                  placeholder="123 Adetokunbo Ademola St, VI Lagos"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                />
              </div>
            </div>

            {/* Due date & status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Due Date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setField('due_date', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Status</label>
                <select
                  value={form.status}
                  onChange={e => setField('status', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Taxes */}
            <div className="bg-[#fefce8] rounded-xl border p-4" style={{ borderColor: '#fde68a' }}>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} style={{ color: '#ca8a04' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#92400e' }}>Tax (Nigerian VAT)</span>
              </div>
              <p className="text-xs mb-3" style={{ color: '#78350f' }}>
                Standard VAT rate in Nigeria is 7.5% on the supply of goods and services. Government revenue minus withholding.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#92400e' }}>Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.tax_rate}
                    onChange={e => setField('tax_rate', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50"
                    style={{ borderColor: '#fde68a', background: '#fff', color: '#92400e' }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#92400e' }}>Tax Label</label>
                  <input
                    value={form.tax_label}
                    onChange={e => setField('tax_label', e.target.value)}
                    placeholder="VAT (7.5%)"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50"
                    style={{ borderColor: '#fde68a', background: '#fff', color: '#92400e' }}
                  />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Line Items</label>
                <button
                  onClick={addLineItem}
                  className="text-xs font-medium flex items-center gap-1 rounded-lg hover:bg-blue-50 transition-colors"
                  style={{ color: '#2563eb' }}
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>

              <div className="space-y-2">
                {form.line_items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start rounded-lg border p-3" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                    <div className="flex-1 min-w-0">
                      <input
                        value={item.description}
                        onChange={e => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Description of service or product"
                        className="w-full px-2.5 py-2 text-sm rounded border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 mb-2"
                        style={{ borderColor: '#e2e8f0', background: '#fff', color: '#0f172a' }}
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={e => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qty"
                            className="w-full px-2.5 py-2 text-xs rounded border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                            style={{ borderColor: '#e2e8f0', background: '#fff', color: '#0f172a' }}
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={e => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            placeholder="Unit price"
                            className="w-full px-2.5 py-2 text-xs rounded border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                            style={{ borderColor: '#e2e8f0', background: '#fff', color: '#0f172a' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 mt-5">
                      <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{naira(item.amount)}</p>
                      <button
                        onClick={() => removeLineItem(index)}
                        className="text-xs mt-1 hover:text-red-500 transition-colors"
                        style={{ color: '#94a3b8' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Discount (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount}
                  onChange={e => setField('discount', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  placeholder="Payment terms, delivery instructions..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl border p-4" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#64748b' }}>Subtotal</span>
                  <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>{naira(formSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#64748b' }}>{form.tax_label}</span>
                  <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>{naira(formTaxAmount)}</span>
                </div>
                {Number(form.discount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-red-600">Discount</span>
                    <span className="text-sm font-semibold text-red-600">-{naira(formDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#e2e8f0' }}>
                  <span className="text-base font-bold" style={{ color: '#0f172a' }}>Total Due</span>
                  <span className="text-base font-bold" style={{ color: '#2563eb' }}>{naira(formTotal)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2.5 text-sm rounded-lg font-medium hover:bg-gray-100 transition-colors"
                style={{ color: '#64748b' }}
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                {editing && (
                  <button
                    onClick={() => {
                      const inv = invoices.find(i => i.id === editingId);
                      if (inv) handleDelete(inv);
                    }}
                    className="p-2.5 rounded-lg text-sm font-medium text-white flex items-center gap-1 hover:bg-red-600 transition-colors"
                    style={{ background: '#dc2626' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 text-sm rounded-lg font-semibold text-white flex items-center gap-2 disabled:opacity-50 transition-all hover:shadow-md"
                  style={{
                    background: editingId && form.status === 'paid'
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  }}
                >
                  <PlusCircle size={14} />
                  {editing ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pending send indicator */}
        {sending && <p className="text-center text-sm mt-3 text-amber-600">Sending invoice email…</p>}
        {sent && <p className="text-center text-sm mt-3 text-green-600 flex items-center justify-center gap-2"><CheckCircle size={14} /> Invoice emailed to the customer with PDF attached</p>}
        {sendingError && <p className="text-center text-sm mt-3 text-red-600 flex items-center justify-center gap-2"><AlertCircle size={14} /> {sendingError}</p>}
        {generatingPdf && <p className="text-center text-sm mt-3 text-blue-600">Generating PDF…</p>}
      </div>
    </DashboardLayout>
  );
}
