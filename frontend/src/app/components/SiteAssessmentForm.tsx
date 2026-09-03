import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, CheckCircle, FileImage, Loader2, MapPin, Send, Upload } from "lucide-react";
import { useSearchParams } from "react-router";
import { api, type SiteAssessmentPayload } from "../../lib/api";

const API = import.meta.env.VITE_API_URL ?? "";

const services = [
  "Solar Energy Systems",
  "Industrial Wiring",
  "Smart Home Automation",
  "CCTV & Security",
  "IT & Tech Services",
  "General Electrical",
  "Multiple Services",
];

const propertyTypes = ["Residential", "Commercial", "Industrial", "Estate / Multi-unit", "Institutional", "Other"];
const projectStages = ["Planning / budgeting", "New construction", "Renovation / upgrade", "Existing fault or assessment", "Ready to start"];

export type AssessmentAttachment = { url: string; name: string; type: string };

export async function uploadAssessmentImage(file: File): Promise<AssessmentAttachment> {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) throw new Error("Please upload a JPEG, PNG, WebP, or GIF image.");
  if (file.size <= 0 || file.size > 10 * 1024 * 1024) throw new Error("Images must be no larger than 10 MB.");

  const start = await fetch(`${API}/api/site-assessments/uploads/direct-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, fileSize: file.size }),
  });
  const upload = await start.json();
  if (!start.ok) throw new Error(upload.error || "Could not start upload.");

  const formData = new FormData();
  formData.append("file", file);
  const result = await fetch(upload.uploadURL, { method: "POST", body: formData });
  const resultBody = await result.json().catch(() => ({}));
  if (!result.ok || resultBody.success === false) {
    throw new Error(resultBody.errors?.[0]?.message || "Image upload failed.");
  }
  return { url: upload.url, name: file.name, type: file.type };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fieldClass(dark: boolean) {
  return dark
    ? "w-full px-4 py-3 border border-white/10 bg-transparent text-white placeholder:text-white/25 focus:outline-none focus:border-[#F0A20E]/60 focus:ring-1 focus:ring-[#F0A20E]/25 transition-all text-sm"
    : "w-full px-4 py-3 border border-gray-200 bg-white text-[#041627] placeholder:text-[#041627]/25 focus:outline-none focus:border-[#F0A20E]/60 focus:ring-1 focus:ring-[#F0A20E]/25 transition-all text-sm";
}

export function SiteAssessmentForm({ dark = false }: { dark?: boolean }) {
  const [searchParams] = useSearchParams();
  const [requestKind, setRequestKind] = useState<"site_assessment" | "general">("site_assessment");
  const [form, setForm] = useState<SiteAssessmentPayload>({
    name: "",
    email: "",
    phone: "",
    service: "",
    propertyType: "",
    projectStage: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    landmark: "",
    preferredVisitDate: "",
    preferredVisitTime: "",
    details: "",
    attachments: [],
  });
  const [attachments, setAttachments] = useState<AssessmentAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<{ kind: "site_assessment" | "general"; token?: string } | null>(null);

  useEffect(() => {
    const service = searchParams.get("service") ?? "";
    if (service) setForm(current => ({ ...current, service }));
  }, [searchParams]);

  const labelClass = dark
    ? "block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wide"
    : "block text-xs font-semibold text-[#041627]/40 mb-2 uppercase tracking-wide";
  const mutedClass = dark ? "text-white/45" : "text-[#041627]/45";
  const textClass = dark ? "text-white" : "text-[#041627]";

  function set<K extends keyof SiteAssessmentPayload>(key: K, value: SiteAssessmentPayload[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (attachments.length + files.length > 5) {
      setError("Please upload no more than five images.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const uploaded: AssessmentAttachment[] = [];
      for (const file of files) uploaded.push(await uploadAssessmentImage(file));
      setAttachments(current => [...current, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(url: string) {
    setAttachments(current => current.filter(item => item.url !== url));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (uploading) return;
    setSubmitting(true);
    setError("");
    try {
      if (requestKind === "general") {
        await api.contact({
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          subject: form.service ? `${form.service} enquiry` : "General website enquiry",
          message: form.details,
        });
        setSubmitted({ kind: "general" });
      } else {
        const result = await api.siteAssessment({ ...form, attachments });
        setSubmitted({ kind: "site_assessment", token: result.token });
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We couldn't save your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={`flex flex-col items-center justify-center text-center py-12 ${textClass}`}>
        <div className="w-16 h-16 flex items-center justify-center mb-5" style={{ background: "rgba(240,162,14,0.14)" }}>
          <CheckCircle size={32} style={{ color: "#F0A20E" }} />
        </div>
        <h3 className="mb-2" style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700 }}>
          Request Received
        </h3>
        <p className={`text-sm leading-relaxed max-w-md ${mutedClass}`} style={{ fontFamily: "var(--font-body)" }}>
          {submitted.kind === "site_assessment"
            ? "We’ll review your project and site location before sending the assessment charge. Your request is not scheduled until payment is confirmed, unless our team approves an exception."
            : "Thank you. Your enquiry has been saved and our team will get back to you within 24 hours."}
        </p>
        {submitted.kind === "site_assessment" && (
          <a
            href={`/assessment/${submitted.token}`}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-[#041627]"
            style={{ background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)", fontFamily: "var(--font-ui)" }}
          >
            Track Request <MapPin size={14} />
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" style={{ fontFamily: "var(--font-body)" }}>
      <div className="mb-6">
        <h3 className={textClass} style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700 }}>
          Request a Site Assessment
        </h3>
        <p className={`text-sm mt-1 leading-relaxed ${mutedClass}`}>
          For field projects, submit your details and address. We review the request first, then send the assessment charge and payment instructions.
        </p>
      </div>

      <div>
        <label className={labelClass}>What do you need help with? *</label>
        <select value={requestKind} onChange={event => setRequestKind(event.target.value as "site_assessment" | "general")} className={fieldClass(dark)}>
          <option value="site_assessment">On-site project assessment</option>
          <option value="general">General question or remote advice</option>
        </select>
        <p className={`text-xs mt-2 ${mutedClass}`}>
          {requestKind === "site_assessment"
            ? "A site assessment fee is sent after our team reviews your request."
            : "For questions that do not require a field visit, send a general enquiry instead."}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input required value={form.name} onChange={event => set("name", event.target.value)} placeholder="John Adeyemi" className={fieldClass(dark)} />
        </div>
        <div>
          <label className={labelClass}>Phone Number *</label>
          <input required type="tel" value={form.phone} onChange={event => set("phone", event.target.value)} placeholder="+234 810 126 2814" className={fieldClass(dark)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Email Address *</label>
        <input required type="email" value={form.email} onChange={event => set("email", event.target.value)} placeholder="john@company.com" className={fieldClass(dark)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Service Required{requestKind === "site_assessment" ? " *" : ""}</label>
          <select required={requestKind === "site_assessment"} value={form.service} onChange={event => set("service", event.target.value)} className={fieldClass(dark)}>
            <option value="">Select a service...</option>
            {services.map(service => <option key={service}>{service}</option>)}
          </select>
        </div>
        {requestKind === "site_assessment" && <div>
          <label className={labelClass}>Property Type *</label>
          <select required value={form.propertyType} onChange={event => set("propertyType", event.target.value)} className={fieldClass(dark)}>
            <option value="">Select property type...</option>
            {propertyTypes.map(type => <option key={type}>{type}</option>)}
          </select>
        </div>}
      </div>

      {requestKind === "site_assessment" && <div>
        <label className={labelClass}>Project Stage *</label>
        <select required value={form.projectStage} onChange={event => set("projectStage", event.target.value)} className={fieldClass(dark)}>
          <option value="">Select project stage...</option>
          {projectStages.map(stage => <option key={stage}>{stage}</option>)}
        </select>
      </div>}

      {requestKind === "site_assessment" && <div>
        <label className={labelClass}>Site Address *</label>
        <input required value={form.addressLine1} onChange={event => set("addressLine1", event.target.value)} placeholder="Street address and area" className={fieldClass(dark)} />
      </div>}

      {requestKind === "site_assessment" && <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Address Line 2</label>
          <input value={form.addressLine2} onChange={event => set("addressLine2", event.target.value)} placeholder="Estate, building, unit (optional)" className={fieldClass(dark)} />
        </div>
        <div>
          <label className={labelClass}>Nearest Landmark</label>
          <input value={form.landmark} onChange={event => set("landmark", event.target.value)} placeholder="Optional landmark" className={fieldClass(dark)} />
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <input required value={form.city} onChange={event => set("city", event.target.value)} placeholder="Port Harcourt" className={fieldClass(dark)} />
        </div>
        <div>
          <label className={labelClass}>State / Region *</label>
          <input required value={form.state} onChange={event => set("state", event.target.value)} placeholder="Rivers State" className={fieldClass(dark)} />
        </div>
      </div>}

      {requestKind === "site_assessment" && <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Preferred Visit Date</label>
          <input type="date" min={today()} value={form.preferredVisitDate} onChange={event => set("preferredVisitDate", event.target.value)} className={fieldClass(dark)} />
        </div>
        <div>
          <label className={labelClass}>Preferred Time Window</label>
          <select value={form.preferredVisitTime} onChange={event => set("preferredVisitTime", event.target.value)} className={fieldClass(dark)}>
            <option value="">No preference</option>
            <option>Morning (8am–12pm)</option>
            <option>Afternoon (12pm–4pm)</option>
            <option>Late afternoon (4pm–6pm)</option>
          </select>
        </div>
      </div>}

      <div>
        <label className={labelClass}>{requestKind === "site_assessment" ? "Project Details *" : "How can we help? *"}</label>
        <textarea required rows={5} value={form.details} onChange={event => set("details", event.target.value)} placeholder={requestKind === "site_assessment" ? "Describe the work, approximate size, current situation, and what you want us to assess..." : "Tell us what you need help with..."} className={`${fieldClass(dark)} resize-none`} />
      </div>

      {requestKind === "site_assessment" && <div>
        <label className={labelClass}>Site Photos (Optional)</label>
        <label className={`flex items-center justify-center gap-2 px-4 py-3 border border-dashed cursor-pointer transition-colors ${dark ? "border-white/15 text-white/45 hover:border-[#F0A20E]/50" : "border-gray-300 text-[#041627]/45 hover:border-[#F0A20E]/60"}`}>
          <Upload size={15} />
          <span className="text-sm">{uploading ? "Uploading..." : "Upload up to 5 images"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={handleFiles} disabled={uploading || attachments.length >= 5} />
        </label>
        <p className={`text-xs mt-2 ${mutedClass}`}>Images only, up to 10 MB each. A screenshot or photo of an invoice can also be uploaded later from your request page.</p>
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {attachments.map(file => (
              <button type="button" key={file.url} onClick={() => removeAttachment(file.url)} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs ${dark ? "bg-white/8 text-white/70" : "bg-gray-100 text-[#041627]/70"}`}>
                <FileImage size={13} /> <span className="max-w-32 truncate">{file.name}</span> <span aria-label="Remove">×</span>
              </button>
            ))}
          </div>
        )}
      </div>}

      {error && (
        <p role="alert" className="flex items-center gap-2 text-sm" style={{ color: dark ? "#fca5a5" : "#b91c1c" }}>
          <AlertCircle size={15} /> {error}
        </p>
      )}

      <button type="submit" disabled={submitting || uploading} className="w-full py-4 font-bold text-[#041627] flex items-center justify-center gap-2.5 transition-all hover:opacity-90 disabled:opacity-60 text-sm tracking-wider" style={{ background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)", fontFamily: "var(--font-ui)", letterSpacing: "0.07em" }}>
        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} strokeWidth={2.5} />}
        {submitting ? "SENDING..." : requestKind === "site_assessment" ? "REQUEST SITE ASSESSMENT" : "SEND ENQUIRY"}
      </button>
    </form>
  );
}