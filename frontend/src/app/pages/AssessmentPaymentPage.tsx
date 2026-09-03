import { useEffect, useState, type ChangeEvent } from "react";
import { AlertCircle, CheckCircle, FileImage, Loader2, Upload } from "lucide-react";
import { useParams } from "react-router";
import { PageLayout } from "../components/PageLayout";
import { uploadAssessmentImage, type AssessmentAttachment } from "../components/SiteAssessmentForm";

const API = import.meta.env.VITE_API_URL ?? "";

interface AssessmentStatus {
  requestId: number;
  name: string;
  service: string;
  status: string;
  paymentStatus: string;
  assessmentFee: string | number | null;
  paymentInstructions: string | null;
  preferredVisitDate: string | null;
  preferredVisitTime: string | null;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  new: "Request received",
  under_review: "Under review",
  charge_sent: "Payment requested",
  payment_proof_submitted: "Payment proof under review",
  paid: "Payment confirmed",
  scheduled: "Visit scheduled",
  completed: "Assessment completed",
  proposal_sent: "Proposal sent",
  cancelled: "Request cancelled",
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export function AssessmentPaymentPage() {
  const { token = "" } = useParams();
  const [assessment, setAssessment] = useState<AssessmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [attachment, setAttachment] = useState<AssessmentAttachment | null>(null);
  const [reference, setReference] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/site-assessments/${encodeURIComponent(token)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Assessment request not found.");
      setAssessment(result.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Assessment request not found.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      setAttachment(await uploadAssessmentImage(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload receipt.");
    } finally {
      setUploading(false);
    }
  }

  async function submitProof() {
    if (!attachment) {
      setError("Please upload a receipt or invoice image first.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API}/api/site-assessments/${encodeURIComponent(token)}/payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: attachment.url, name: attachment.name, reference }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit payment proof.");
      setSuccess("Payment proof submitted. Our team will verify it manually and update your request.");
      setAttachment(null);
      setReference("");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit payment proof.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmitProof = assessment?.paymentStatus === "pending" || assessment?.paymentStatus === "rejected";
  const displayStatus = assessment ? statusLabels[assessment.status] || assessment.status.replaceAll("_", " ") : "";

  return (
    <PageLayout>
      <div className="min-h-[75vh] bg-[#f5f6f8] px-6 py-24">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: "#1a56db" }} /></div>
          ) : error && !assessment ? (
            <div className="bg-white border border-gray-100 p-8 text-center">
              <AlertCircle className="mx-auto mb-3" style={{ color: "#b91c1c" }} />
              <h1 className="text-xl font-bold text-[#041627]" style={{ fontFamily: "var(--font-display)" }}>Request not found</h1>
              <p className="text-sm text-[#041627]/50 mt-2">{error}</p>
            </div>
          ) : assessment ? (
            <div className="bg-white border border-gray-100 shadow-sm">
              <div className="px-7 py-8 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-px bg-[#F0A20E]" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-[#C8971A]" style={{ fontFamily: "var(--font-ui)" }}>Site Assessment</span>
                </div>
                <h1 className="text-3xl font-bold text-[#041627]" style={{ fontFamily: "var(--font-display)" }}>Hello {assessment.name.split(" ")[0]},</h1>
                <p className="text-sm text-[#041627]/50 mt-2">Request #{assessment.requestId} · {assessment.service}</p>
                <div className="inline-flex items-center gap-2 mt-5 px-3 py-2 text-sm font-semibold text-[#041627] bg-[#fff4d6]">
                  <span className="w-2 h-2 rounded-full bg-[#F0A20E]" /> {displayStatus}
                </div>
              </div>

              <div className="px-7 py-7 space-y-6">
                {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-700"><AlertCircle size={15} /> {error}</p>}
                {success && <p role="status" className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle size={15} /> {success}</p>}

                {assessment.paymentInstructions && assessment.paymentStatus !== "confirmed" && (
                  <div className="p-5 bg-[#f8faff] border border-[#dce8ff]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5a6a82] mb-2">Assessment charge</p>
                    {assessment.assessmentFee && <p className="text-2xl font-bold text-[#041627] mb-3" style={{ fontFamily: "var(--font-display)" }}>NGN {Number(assessment.assessmentFee).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>}
                    <p className="text-sm text-[#041627]/70 whitespace-pre-wrap leading-relaxed">{assessment.paymentInstructions}</p>
                  </div>
                )}

                {canSubmitProof && (
                  <div>
                    <h2 className="text-lg font-bold text-[#041627] mb-1" style={{ fontFamily: "var(--font-display)" }}>Submit payment proof</h2>
                    <p className="text-sm text-[#041627]/50 mb-4">Upload a clear image of your receipt or invoice. Our team will verify it manually.</p>
                    <label className="flex items-center justify-center gap-2 px-4 py-4 border border-dashed border-gray-300 text-[#041627]/55 hover:border-[#F0A20E]/60 cursor-pointer">
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {uploading ? "Uploading..." : "Choose receipt or invoice image"}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} disabled={uploading} />
                    </label>
                    {attachment && (
                      <div className="flex items-center justify-between mt-3 px-3 py-2 bg-gray-50 text-sm text-[#041627]/70">
                        <span className="flex items-center gap-2"><FileImage size={14} /> {attachment.name}</span>
                        <button type="button" onClick={() => setAttachment(null)} className="text-xs text-red-700">Remove</button>
                      </div>
                    )}
                    <input value={reference} onChange={event => setReference(event.target.value)} placeholder="Payment reference (optional)" className="w-full mt-3 px-4 py-3 border border-gray-200 text-sm text-[#041627] focus:outline-none focus:border-[#F0A20E]/60" />
                    <button type="button" onClick={submitProof} disabled={submitting || uploading || !attachment} className="mt-4 w-full py-3 font-bold text-[#041627] disabled:opacity-50" style={{ background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)", fontFamily: "var(--font-ui)" }}>
                      {submitting ? "SUBMITTING..." : "SUBMIT PAYMENT PROOF"}
                    </button>
                  </div>
                )}

                {assessment.paymentStatus === "confirmed" && (
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 text-emerald-800 text-sm">
                    <CheckCircle size={17} className="mt-0.5 flex-shrink-0" />
                    <p>Payment has been confirmed. Our team will contact you with the site visit schedule.</p>
                  </div>
                )}
                {assessment.scheduledFor && (
                  <div className="p-4 border border-[#dce8ff] text-sm text-[#041627]/70">
                    <strong className="text-[#041627]">Scheduled visit:</strong> {formatDate(assessment.scheduledFor)}
                  </div>
                )}
                <p className="text-xs text-[#041627]/35">Last updated {formatDate(assessment.updatedAt)}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
}