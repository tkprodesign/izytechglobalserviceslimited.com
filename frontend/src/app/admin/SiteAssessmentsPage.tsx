import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, ClipboardCheck, ExternalLink, FileImage, Loader2, Send } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { getToken } from "../../lib/auth";

const API = import.meta.env.VITE_API_URL ?? "";

type Assessment = {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  property_type: string;
  project_stage: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  landmark: string | null;
  preferred_visit_date: string | null;
  preferred_visit_time: string | null;
  details: string;
  attachments: { url: string; name: string; type: string }[];
  public_token: string;
  status: string;
  assessment_fee: string | number | null;
  payment_status: string;
  payment_instructions: string | null;
  payment_reference: string | null;
  payment_proof_url: string | null;
  payment_notes: string | null;
  scheduled_for: string | null;
  site_notes: string | null;
  created_at: string;
  updated_at: string;
};

const statuses = [
  ["new", "New"],
  ["under_review", "Under review"],
  ["charge_sent", "Charge sent"],
  ["payment_proof_submitted", "Payment proof submitted"],
  ["paid", "Paid"],
  ["scheduled", "Scheduled"],
  ["completed", "Completed"],
  ["proposal_sent", "Proposal sent"],
  ["cancelled", "Cancelled"],
];

const paymentStatuses = [
  ["not_requested", "Not requested"],
  ["pending", "Payment pending"],
  ["proof_submitted", "Proof submitted"],
  ["confirmed", "Confirmed"],
  ["rejected", "Rejected"],
];

function fmt(value: string | null) {
  return value ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

function datetimeInput(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function statusLabel(value: string) {
  return statuses.find(([key]) => key === value)?.[1] || value.replaceAll("_", " ");
}

export function SiteAssessmentsPage() {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selected, setSelected] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingCharge, setSendingCharge] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fee, setFee] = useState("");
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState("new");
  const [paymentStatus, setPaymentStatus] = useState("not_requested");
  const [scheduledFor, setScheduledFor] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [siteNotes, setSiteNotes] = useState("");

  async function loadList(selectId?: number) {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/admin/site-assessments`, { headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load site assessments.");
      const rows = result.data || [];
      setAssessments(rows);
      const nextId = selectId || selected?.id || rows[0]?.id;
      if (nextId) await loadDetail(nextId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load site assessments.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: number) {
    setDetailLoading(true);
    try {
      const response = await fetch(`${API}/api/admin/site-assessments/${id}`, { headers });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load request.");
      const row = result.data as Assessment;
      setSelected(row);
      setStatus(row.status);
      setPaymentStatus(row.payment_status);
      setFee(row.assessment_fee ? String(row.assessment_fee) : "");
      setInstructions(row.payment_instructions || "");
      setScheduledFor(datetimeInput(row.scheduled_for));
      setPaymentReference(row.payment_reference || "");
      setPaymentNotes(row.payment_notes || "");
      setSiteNotes(row.site_notes || "");
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Could not load request.");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    loadList();
  }, [token]);

  async function save(changes: Record<string, unknown> = {}) {
    if (!selected) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API}/api/admin/site-assessments/${selected.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus,
          assessmentFee: fee || null,
          paymentInstructions: instructions,
          paymentReference,
          paymentNotes,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
          siteNotes,
          ...changes,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save request.");
      setSelected(result.data);
      setAssessments(rows => rows.map(row => row.id === result.data.id ? result.data : row));
      setNotice("Request updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save request.");
    } finally {
      setSaving(false);
    }
  }

  async function sendCharge() {
    if (!selected || !fee || !instructions.trim()) {
      setError("Enter the assessment fee and payment instructions before sending.");
      return;
    }
    setSendingCharge(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API}/api/admin/site-assessments/${selected.id}/send-charge`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentFee: fee, paymentInstructions: instructions, currency: "NGN" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send charge.");
      setSelected(result.data);
      setAssessments(rows => rows.map(row => row.id === result.data.id ? result.data : row));
      setStatus(result.data.status);
      setPaymentStatus(result.data.payment_status);
      setNotice("Assessment charge sent to the customer.");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send charge.");
    } finally {
      setSendingCharge(false);
    }
  }

  async function confirmPayment() {
    await save({ paymentStatus: "confirmed", status: "paid" });
    setPaymentStatus("confirmed");
    setStatus("paid");
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-[1500px] mx-auto">
        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-px bg-[#F0A20E]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C8971A]">Field Operations</span>
            </div>
            <h1 className="text-2xl font-bold text-[#041627]" style={{ fontFamily: "var(--font-display)" }}>Site Assessments</h1>
            <p className="text-sm text-[#5a6a82] mt-1">Review requests, send manual charges, verify receipts, and schedule visits.</p>
          </div>
          <button type="button" onClick={() => loadList()} className="px-3 py-2 text-sm border border-gray-200 bg-white text-[#5a6a82] hover:border-[#F0A20E]/50">Refresh</button>
        </div>

        {error && <p role="alert" className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 text-sm"><AlertCircle size={15} /> {error}</p>}
        {notice && <p role="status" className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 text-sm"><CheckCircle size={15} /> {notice}</p>}

        <div className="grid xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#041627]">Incoming requests</p>
              <span className="text-xs text-[#8fadc8]">{assessments.length} total</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: "#1a56db" }} /></div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-16 px-5 text-sm text-[#8fadc8]"><ClipboardCheck className="mx-auto mb-3 opacity-50" />No site assessment requests yet.</div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-220px)] overflow-y-auto">
                {assessments.map(row => (
                  <button key={row.id} type="button" onClick={() => loadDetail(row.id)} className={`w-full text-left px-5 py-4 hover:bg-[#f8fafc] ${selected?.id === row.id ? "bg-[#fffaf0] border-l-2 border-[#F0A20E]" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-[#041627] truncate">{row.name}</span>
                      <span className="text-[10px] text-[#8fadc8] flex-shrink-0">{fmt(row.created_at)}</span>
                    </div>
                    <p className="text-xs text-[#5a6a82] truncate mt-1">{row.service} · {row.city}, {row.state}</p>
                    <span className="inline-flex mt-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide bg-[#f0f3f8] text-[#5a6a82]">{statusLabel(row.status)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 shadow-sm">
            {!selected || detailLoading ? (
              <div className="min-h-[500px] flex flex-col items-center justify-center text-[#8fadc8]">
                {detailLoading ? <Loader2 className="animate-spin mb-3" style={{ color: "#1a56db" }} /> : <ClipboardCheck size={40} className="mb-3 opacity-40" />}
                <p className="text-sm">{detailLoading ? "Loading request..." : "Select a request to review"}</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#041627]" style={{ fontFamily: "var(--font-display)" }}>{selected.name}</h2>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-[#5a6a82]">
                      <a className="text-[#1a56db]" href={`mailto:${selected.email}`}>{selected.email}</a>
                      <a className="text-[#1a56db]" href={`tel:${selected.phone}`}>{selected.phone}</a>
                    </div>
                  </div>
                  <a href={`/assessment/${selected.public_token}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-[#1a56db]">Customer page <ExternalLink size={13} /></a>
                </div>

                <div className="p-6 grid lg:grid-cols-2 gap-6">
                  <section className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8fadc8] mb-2">Project</p>
                      <p className="text-sm font-semibold text-[#041627]">{selected.service}</p>
                      <p className="text-sm text-[#5a6a82] mt-1">{selected.property_type} · {selected.project_stage}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8fadc8] mb-2">Site address</p>
                      <p className="text-sm text-[#041627] leading-relaxed">{[selected.address_line_1, selected.address_line_2, selected.city, selected.state].filter(Boolean).join(", ")}</p>
                      {selected.landmark && <p className="text-xs text-[#5a6a82] mt-1">Landmark: {selected.landmark}</p>}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8fadc8] mb-2">Preferred visit</p>
                      <p className="text-sm text-[#041627]">{selected.preferred_visit_date || selected.preferred_visit_time ? `${selected.preferred_visit_date || "Date flexible"} · ${selected.preferred_visit_time || "Time flexible"}` : "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8fadc8] mb-2">Project details</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#5a6a82]">{selected.details}</p>
                    </div>
                    {selected.attachments?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#8fadc8] mb-2">Site photos</p>
                        <div className="flex flex-wrap gap-2">{selected.attachments.map(file => <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f0f3f8] text-xs text-[#1a56db]"><FileImage size={13} />{file.name}</a>)}</div>
                      </div>
                    )}
                  </section>

                  <section className="space-y-4">
                    <div className="p-4 bg-[#f8faff] border border-[#dce8ff]">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5a6a82] mb-3">Workflow</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <label className="text-xs text-[#5a6a82]">Request status<select value={status} onChange={event => setStatus(event.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 bg-white text-sm text-[#041627]"><option value="">Select status</option>{statuses.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                        <label className="text-xs text-[#5a6a82]">Payment status<select value={paymentStatus} onChange={event => setPaymentStatus(event.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 bg-white text-sm text-[#041627]">{paymentStatuses.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                      </div>
                      <button type="button" onClick={() => save()} disabled={saving} className="mt-3 px-3 py-2 text-xs font-semibold text-white bg-[#1a56db] disabled:opacity-50">{saving ? "Saving..." : "Save workflow"}</button>
                    </div>

                    <div className="p-4 border border-[#f0e0b9] bg-[#fffaf0]">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#b45309] mb-3">Send assessment charge</p>
                      <label className="block text-xs text-[#5a6a82]">Fee (NGN)<input type="number" min="1" step="0.01" value={fee} onChange={event => setFee(event.target.value)} placeholder="50000" className="w-full mt-1 px-3 py-2 border border-gray-200 bg-white text-sm text-[#041627]" /></label>
                      <label className="block text-xs text-[#5a6a82] mt-3">Payment instructions<textarea rows={4} value={instructions} onChange={event => setInstructions(event.target.value)} placeholder="Bank name, account name, account number, and what to use as reference..." className="w-full mt-1 px-3 py-2 border border-gray-200 bg-white text-sm text-[#041627] resize-none" /></label>
                      <button type="button" onClick={sendCharge} disabled={sendingCharge} className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#041627] disabled:opacity-50" style={{ background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)" }}>{sendingCharge ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}{sendingCharge ? "Sending..." : "Send charge email"}</button>
                    </div>

                    {selected.payment_proof_url && (
                      <div className="p-4 border border-emerald-200 bg-emerald-50">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">Payment proof received</p>
                        <a href={selected.payment_proof_url} target="_blank" rel="noreferrer" className="text-sm text-emerald-800 underline">Open receipt or invoice</a>
                        <input value={paymentReference} onChange={event => setPaymentReference(event.target.value)} placeholder="Payment reference" className="w-full mt-3 px-3 py-2 border border-emerald-200 bg-white text-sm" />
                        <button type="button" onClick={confirmPayment} disabled={saving || paymentStatus === "confirmed"} className="mt-3 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 disabled:opacity-50">{paymentStatus === "confirmed" ? "Payment confirmed" : "Confirm payment"}</button>
                      </div>
                    )}

                    <div className="p-4 border border-gray-100">
                      <label className="block text-xs text-[#5a6a82]">Scheduled visit (Admin override allowed)<input type="datetime-local" value={scheduledFor} onChange={event => setScheduledFor(event.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 text-sm text-[#041627]" /></label>
                      <label className="block text-xs text-[#5a6a82] mt-3">Payment review notes<textarea rows={2} value={paymentNotes} onChange={event => setPaymentNotes(event.target.value)} placeholder="Internal payment notes..." className="w-full mt-1 px-3 py-2 border border-gray-200 text-sm text-[#041627] resize-none" /></label>
                      <label className="block text-xs text-[#5a6a82] mt-3">Site / operations notes<textarea rows={3} value={siteNotes} onChange={event => setSiteNotes(event.target.value)} placeholder="Technician, access instructions, assessment outcome..." className="w-full mt-1 px-3 py-2 border border-gray-200 text-sm text-[#041627] resize-none" /></label>
                      <button type="button" onClick={() => save()} disabled={saving} className="mt-3 px-3 py-2 text-xs font-semibold border border-gray-200 text-[#5a6a82] disabled:opacity-50">{saving ? "Saving..." : "Save notes and schedule"}</button>
                    </div>
                  </section>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 text-xs text-[#8fadc8]">Request received {fmt(selected.created_at)} · Last updated {fmt(selected.updated_at)}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}