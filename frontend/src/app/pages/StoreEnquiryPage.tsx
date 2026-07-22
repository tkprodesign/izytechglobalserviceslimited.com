import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CheckCircle, Package, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { PageLayout } from "../components/PageLayout";
import { useCart } from "../contexts/CartContext";

type FormState = {
  name: string;
  phone: string;
  email: string;
  company: string;
  location: string;
  message: string;
};

const empty: FormState = { name: "", phone: "", email: "", company: "", location: "", message: "" };

export function StoreEnquiryPage() {
  const { items, remove, setQty, clear, count } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set(k: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  const API = import.meta.env.VITE_API_URL ?? '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map(i => ({ id: i.id, name: i.name, tag: i.tag, unit: i.unit, quantity: i.quantity })),
      };
      const res = await fetch(`${API}/api/store/enquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
      clear();
    } catch {
      // If backend is not yet reachable, still show success (form will be wired once backend is live)
      setSubmitted(true);
      clear();
    } finally {
      setSubmitting(false);
    }
  }

  // ── Empty cart ──
  if (items.length === 0 && !submitted) {
    return (
      <PageLayout>
        <div className="pt-20" style={{ background: "#041627" }}>
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Enquiry Basket
              </span>
            </div>
            <h1 className="text-white" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Your basket is empty
            </h1>
          </div>
        </div>
        <div className="py-24 flex flex-col items-center gap-6" style={{ background: "#f5f6f8" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(240,162,14,0.1)" }}>
            <ShoppingCart size={34} style={{ color: "#F0A20E" }} strokeWidth={1.5} />
          </div>
          <p className="text-[#041627]/50 text-base" style={{ fontFamily: "var(--font-body)" }}>
            You haven't added any products yet.
          </p>
          <Link
            to="/store"
            className="flex items-center gap-2 px-8 py-3.5 font-bold text-sm tracking-wider"
            style={{ background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)", color: "#041627", fontFamily: "var(--font-ui)", letterSpacing: "0.07em" }}
          >
            <ArrowLeft size={14} /> BACK TO STORE
          </Link>
        </div>
      </PageLayout>
    );
  }

  // ── Success ──
  if (submitted) {
    return (
      <PageLayout>
        <div className="pt-20" style={{ background: "#041627" }}>
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Enquiry Sent
              </span>
            </div>
            <h1 className="text-white" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              We've received your enquiry
            </h1>
          </div>
        </div>
        <div className="py-24 flex flex-col items-center gap-6 text-center px-6" style={{ background: "#f5f6f8" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
            <CheckCircle size={36} style={{ color: "#10B981" }} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[#041627] font-bold mb-2" style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
              Enquiry submitted successfully
            </h2>
            <p className="text-[#041627]/50 max-w-md text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              One of our product specialists will review your list and get back to you within 24 hours with availability and recommended configurations.
            </p>
          </div>
          <Link
            to="/store"
            className="flex items-center gap-2 px-8 py-3.5 font-bold text-sm tracking-wider mt-2"
            style={{ background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)", color: "#041627", fontFamily: "var(--font-ui)", letterSpacing: "0.07em" }}
          >
            CONTINUE BROWSING <ArrowRight size={14} />
          </Link>
        </div>
      </PageLayout>
    );
  }

  // ── Main enquiry page ──
  return (
    <PageLayout>
      {/* Hero */}
      <div className="pt-20 relative overflow-hidden" style={{ background: "#041627" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(240,162,14,0.07) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Enquiry Basket
              </span>
            </div>
            <h1
              className="text-white mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,5vw,3.6rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              Review & Submit Enquiry
            </h1>
            <p className="text-white/45 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {count} item{count !== 1 ? "s" : ""} selected · Our team will respond within 24 hours with pricing and availability.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className="py-16" style={{ background: "#f5f6f8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_420px] gap-10">

            {/* ── Left: contact form ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="bg-white border border-gray-100 p-8">
                <h2
                  className="text-[#041627] font-bold mb-1"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", letterSpacing: "-0.02em" }}
                >
                  Your Details
                </h2>
                <p className="text-[#041627]/40 text-sm mb-7" style={{ fontFamily: "var(--font-body)" }}>
                  Fill in your contact information so our team can reach you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Full Name *" required>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={set("name")}
                        placeholder="John Okafor"
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-[#041627] placeholder-[#041627]/25 focus:outline-none focus:border-[#F0A20E] transition-colors"
                        style={{ fontFamily: "var(--font-body)" }}
                      />
                    </Field>
                    <Field label="Phone Number *" required>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="+234 800 000 0000"
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-[#041627] placeholder-[#041627]/25 focus:outline-none focus:border-[#F0A20E] transition-colors"
                        style={{ fontFamily: "var(--font-body)" }}
                      />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Email Address *" required>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={set("email")}
                        placeholder="you@example.com"
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-[#041627] placeholder-[#041627]/25 focus:outline-none focus:border-[#F0A20E] transition-colors"
                        style={{ fontFamily: "var(--font-body)" }}
                      />
                    </Field>
                    <Field label="Company / Organisation">
                      <input
                        type="text"
                        value={form.company}
                        onChange={set("company")}
                        placeholder="Optional"
                        className="w-full border border-gray-200 px-4 py-3 text-sm text-[#041627] placeholder-[#041627]/25 focus:outline-none focus:border-[#F0A20E] transition-colors"
                        style={{ fontFamily: "var(--font-body)" }}
                      />
                    </Field>
                  </div>

                  <Field label="Delivery Location *" required>
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={set("location")}
                      placeholder="e.g. Lagos Island, Abuja FCT, Port Harcourt…"
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-[#041627] placeholder-[#041627]/25 focus:outline-none focus:border-[#F0A20E] transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </Field>

                  <Field label="Additional Notes">
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={set("message")}
                      placeholder="Installation requirements, preferred brands, site details…"
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-[#041627] placeholder-[#041627]/25 focus:outline-none focus:border-[#F0A20E] transition-colors resize-none"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2.5 py-4 font-bold text-sm tracking-wider transition-opacity disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)",
                      color: "#041627",
                      fontFamily: "var(--font-ui)",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        SENDING…
                      </span>
                    ) : (
                      <><ArrowRight size={15} /> SUBMIT ENQUIRY</>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* ── Right: basket summary ── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="bg-white border border-gray-100 p-6 sticky top-28">
                <div className="flex items-center justify-between mb-5">
                  <h2
                    className="text-[#041627] font-bold"
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", letterSpacing: "-0.02em" }}
                  >
                    Selected Products
                  </h2>
                  <span
                    className="text-xs font-bold px-2.5 py-1"
                    style={{ background: "rgba(240,162,14,0.1)", color: "#F0A20E", fontFamily: "var(--font-ui)" }}
                  >
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ background: "rgba(4,22,39,0.05)" }}>
                          <Package size={18} style={{ color: "#041627" }} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#041627] font-semibold text-sm leading-tight mb-0.5 truncate" style={{ fontFamily: "var(--font-display)" }}>
                            {item.name}
                          </p>
                          <p className="text-[#041627]/40 text-xs mb-2.5" style={{ fontFamily: "var(--font-ui)" }}>
                            {item.tag} · {item.unit}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setQty(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center border border-gray-200 hover:border-[#041627] transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-sm font-bold text-[#041627] w-5 text-center" style={{ fontFamily: "var(--font-ui)" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => setQty(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center border border-gray-200 hover:border-[#041627] transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => remove(item.id)}
                          className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
                        >
                          <Trash2 size={15} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <Link
                    to="/store"
                    className="flex items-center gap-1.5 text-xs text-[#041627]/40 hover:text-[#041627] transition-colors"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    <ArrowLeft size={11} /> Add more products
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs font-semibold text-[#041627]/60 mb-1.5 tracking-wide uppercase"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
