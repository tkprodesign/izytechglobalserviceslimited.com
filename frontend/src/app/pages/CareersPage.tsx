import { useState } from "react";
import { motion } from "motion/react";
import { Zap, TrendingUp, Users, Shield, MapPin, Briefcase, Clock, ChevronRight, CheckCircle, Send, ArrowRight } from "lucide-react";
import { PageLayout } from "../components/PageLayout";

const API = import.meta.env.VITE_API_URL ?? "";

// ── Open positions ────────────────────────────────────────────────────────────
const positions = [
  {
    title: "Solar Installation Technician",
    department: "Field Operations",
    type: "Full-time",
    location: "Port Harcourt, Rivers State",
    description:
      "Install, commission and maintain residential and commercial solar PV systems. You will work closely with our engineering team to deliver safe, code-compliant installations across the Niger Delta region.",
    requirements: [
      "OND / HND in Electrical Engineering or related field",
      "1+ year hands-on solar or electrical installation experience",
      "Knowledge of DC/AC wiring and basic MPPT systems",
      "Valid driver's licence preferred",
    ],
  },
  {
    title: "Electrical Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "Port Harcourt, Rivers State",
    description:
      "Design and supervise industrial and commercial electrical systems — from load analysis and single-line diagrams through to site supervision, testing and handover.",
    requirements: [
      "B.Eng / HND Electrical Engineering (COREN registration is an advantage)",
      "3+ years of industrial or commercial project experience",
      "Proficient in AutoCAD or similar design tools",
      "Strong knowledge of NEC / local wiring regulations",
    ],
  },
  {
    title: "CCTV & Security Systems Installer",
    department: "Security",
    type: "Full-time",
    location: "Port Harcourt, Rivers State",
    description:
      "Install and configure IP camera systems, access control and alarm infrastructure for residential, commercial and industrial clients. Provide post-installation support and training.",
    requirements: [
      "OND / trade certificate in Electronics or Networking",
      "Experience with Dahua, Hikvision or similar IP-CCTV platforms",
      "Ability to run structured cabling and configure NVRs",
      "Customer-facing communication skills",
    ],
  },
  {
    title: "Sales & Business Development Executive",
    department: "Commercial",
    type: "Full-time",
    location: "Port Harcourt (hybrid)",
    description:
      "Grow IZY's client base by prospecting SMEs, real estate developers and industrial facilities. Prepare proposals, negotiate contracts and work hand-in-hand with our technical team to close deals.",
    requirements: [
      "HND / B.Sc in Business, Marketing or related field",
      "2+ years B2B sales experience (energy, construction or tech preferred)",
      "Strong presentation and negotiation skills",
      "Self-starter with a proven track record of hitting targets",
    ],
  },
  {
    title: "IT Support & Smart Home Technician",
    department: "Technology",
    type: "Full-time",
    location: "Port Harcourt, Rivers State",
    description:
      "Deploy and support smart home automation systems (KNX, Zigbee, Z-Wave), structured networks and IT infrastructure for our growing base of residential and commercial clients.",
    requirements: [
      "OND / HND in Computer Science, IT or Electronics",
      "Experience with home automation platforms (e.g. Home Assistant, Tuya, Google Home)",
      "Networking fundamentals — TCP/IP, Wi-Fi, VLANs",
      "Detail-oriented with strong troubleshooting instincts",
    ],
  },
];

// ── Culture values ────────────────────────────────────────────────────────────
const values = [
  {
    icon: Zap,
    title: "Drive Impact",
    body: "Every installation we complete powers a family, a school, or a business. Your work here is felt far beyond the job site.",
  },
  {
    icon: TrendingUp,
    title: "Grow Continuously",
    body: "We invest in training, certification and career progression. Your growth is part of how we grow as a company.",
  },
  {
    icon: Users,
    title: "Work as One Team",
    body: "Flat structure, open communication, shared wins. We back each other up on site and in the office.",
  },
  {
    icon: Shield,
    title: "Do It Right",
    body: "Safety, quality and integrity are non-negotiable. We take pride in work that lasts 25 years, not just until the next inspection.",
  },
];

// ── Application form ──────────────────────────────────────────────────────────
const blank = { name: "", email: "", phone: "", position: "", message: "" };

export function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof blank>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function applyFor(title: string) {
    setSelectedRole(title);
    setForm(f => ({ ...f, position: title }));
    setTimeout(() => {
      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.position) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/careers/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
      setForm({ ...blank });
      setSelectedRole(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #030e1a 0%, #041627 60%, #0a1f35 100%)",
          paddingTop: "clamp(7rem, 15vw, 11rem)",
          paddingBottom: "clamp(5rem, 10vw, 8rem)",
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Accent glow */}
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(240,162,14,0.07) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                Join Our Team
              </span>
            </div>
            <h1
              className="text-white mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Build Nigeria's
              <br />
              <span style={{ color: "#F0A20E" }}>Energy Future</span>
              <br />
              With Us
            </h1>
            <p
              className="text-white/55 leading-relaxed mb-8"
              style={{ fontFamily: "var(--font-body)", fontSize: "1.1rem", maxWidth: "34rem" }}
            >
              IZY Technologies is growing fast. We're looking for skilled, passionate people to help us deliver world-class solar, security, and smart technology solutions across Nigeria.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#open-roles"
                onClick={e => {
                  e.preventDefault();
                  document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
                style={{ background: "#F0A20E", color: "#030e1a" }}
              >
                View Open Roles <ArrowRight size={15} />
              </a>
              <a
                href="#apply-form"
                onClick={e => {
                  e.preventDefault();
                  document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors"
              >
                General Application
              </a>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 flex flex-wrap gap-10"
          >
            {[
              { v: "2018", l: "Founded" },
              { v: "1000+", l: "Projects completed" },
              { v: "Port Harcourt", l: "Headquarters" },
              { v: "Nationwide", l: "Service coverage" },
            ].map(({ v, l }) => (
              <div key={l}>
                <p
                  className="text-white font-extrabold"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,3vw,2.2rem)", letterSpacing: "-0.02em" }}
                >
                  {v}
                </p>
                <p className="text-white/40 text-xs mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>{l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Why IZY ──────────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 max-w-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Why IZY?
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--izy-navy)",
              }}
            >
              Work that matters, with people who care
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-7 rounded-2xl bg-white border"
                style={{ borderColor: "#e8eef6" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(26,95,171,0.08)" }}
                >
                  <Icon size={20} style={{ color: "var(--izy-blue)" }} />
                </div>
                <h3
                  className="font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--izy-navy)" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#5a6a82", fontFamily: "var(--font-body)" }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open positions ────────────────────────────────────────────────────── */}
      <section id="open-roles" className="py-24" style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                  Open Roles
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                  color: "var(--izy-navy)",
                }}
              >
                Current vacancies
              </h2>
            </div>
            <p className="text-sm" style={{ color: "#5a6a82", fontFamily: "var(--font-body)", maxWidth: "22rem" }}>
              All roles are based in Port Harcourt unless stated otherwise. We welcome applications from across Nigeria.
            </p>
          </motion.div>

          <div className="space-y-5">
            {positions.map((pos, i) => (
              <motion.div
                key={pos.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: "#e8eef6" }}
              >
                {/* Header row */}
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: "#f8fafc" }}>
                  <div className="flex-1">
                    <h3
                      className="font-bold mb-1"
                      style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--izy-navy)" }}
                    >
                      {pos.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "#5a6a82", fontFamily: "var(--font-ui)" }}>
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={12} /> {pos.department}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} /> {pos.type}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} /> {pos.location}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => applyFor(pos.title)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85 flex-shrink-0"
                    style={{ background: "var(--izy-blue)" }}
                  >
                    Apply Now <ChevronRight size={14} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-white">
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#5a6a82", fontFamily: "var(--font-body)" }}>
                    {pos.description}
                  </p>
                  <ul className="space-y-1.5">
                    {pos.requirements.map(r => (
                      <li key={r} className="flex items-start gap-2.5 text-sm" style={{ color: "#374151", fontFamily: "var(--font-body)" }}>
                        <ChevronRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--izy-blue)" }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application form ──────────────────────────────────────────────────── */}
      <section
        id="apply-form"
        className="py-24"
        style={{ background: "linear-gradient(180deg, #f0f6ff 0%, #f8fafc 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Apply
              </span>
            </div>
            <h2
              className="mb-5"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--izy-navy)",
              }}
            >
              {selectedRole ? `Applying for: ${selectedRole}` : "Send us your application"}
            </h2>
            <p className="leading-relaxed mb-8" style={{ fontFamily: "var(--font-body)", color: "#5a6a82" }}>
              Don't see a role that fits? Send a general application anyway — we keep promising candidates on file and reach out when the right opportunity opens up.
            </p>

            <div className="space-y-4">
              {[
                { icon: Send, label: "applications go directly to our HR team" },
                { icon: CheckCircle, label: "we review every application personally" },
                { icon: Clock, label: "expect a response within 5 business days" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm" style={{ color: "#5a6a82", fontFamily: "var(--font-body)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(26,95,171,0.08)" }}>
                    <Icon size={15} style={{ color: "var(--izy-blue)" }} />
                  </div>
                  <span className="capitalize">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 p-5 rounded-xl border" style={{ borderColor: "#d0e0f5", background: "rgba(26,95,171,0.04)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--izy-navy)", fontFamily: "var(--font-ui)" }}>
                Careers email
              </p>
              <a
                href="mailto:careers@izytechglobalservices.com"
                className="text-sm hover:underline"
                style={{ color: "var(--izy-blue)", fontFamily: "var(--font-body)" }}
              >
                careers@izytechglobalservices.com
              </a>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {submitted ? (
              <div
                className="rounded-2xl p-10 flex flex-col items-center text-center"
                style={{ background: "#fff", border: "1px solid #e8eef6" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                  style={{ background: "rgba(16,185,129,0.1)" }}
                >
                  <CheckCircle size={32} style={{ color: "#10B981" }} />
                </div>
                <h3
                  className="font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--izy-navy)" }}
                >
                  Application Received!
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#5a6a82", fontFamily: "var(--font-body)" }}>
                  Thank you for your interest in IZY Technologies. Our HR team will review your application and get back to you within 5 business days.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-semibold underline"
                  style={{ color: "var(--izy-blue)" }}
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="rounded-2xl p-8 space-y-5"
                style={{ background: "#fff", border: "1px solid #e8eef6" }}
              >
                {/* Name */}
                <FormField label="Full Name *">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="Israel Ideozu"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: "#e2e8f0", color: "var(--izy-navy)", fontFamily: "var(--font-body)" }}
                  />
                </FormField>

                {/* Email */}
                <FormField label="Email Address *">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: "#e2e8f0", color: "var(--izy-navy)", fontFamily: "var(--font-body)" }}
                  />
                </FormField>

                {/* Phone */}
                <FormField label="Phone Number">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: "#e2e8f0", color: "var(--izy-navy)", fontFamily: "var(--font-body)" }}
                  />
                </FormField>

                {/* Position */}
                <FormField label="Position Applying For *">
                  <select
                    required
                    value={form.position}
                    onChange={e => set("position", e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: "#e2e8f0", color: form.position ? "var(--izy-navy)" : "#94a3b8", fontFamily: "var(--font-body)" }}
                  >
                    <option value="">Select a position…</option>
                    {positions.map(p => (
                      <option key={p.title} value={p.title}>{p.title}</option>
                    ))}
                    <option value="General Application">General Application (no specific role)</option>
                  </select>
                </FormField>

                {/* Cover message */}
                <FormField label="Tell us about yourself">
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={e => set("message", e.target.value)}
                    placeholder="Briefly describe your experience, why you want to join IZY, and what makes you a great fit…"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                    style={{ borderColor: "#e2e8f0", color: "var(--izy-navy)", fontFamily: "var(--font-body)" }}
                  />
                </FormField>

                {error && (
                  <p className="text-sm text-red-500" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !form.name || !form.email || !form.position}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--izy-blue)", fontFamily: "var(--font-ui)" }}
                >
                  {submitting ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Submitting…</>
                  ) : (
                    <><Send size={15} /> Submit Application</>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#5a6a82", fontFamily: "var(--font-ui)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
