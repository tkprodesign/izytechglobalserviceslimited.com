import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Send, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router";

const contactInfo = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+234 810 126 2814",
    sub: "Mon–Sat, 8am–6pm",
    href: "tel:+2348101262814",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "info@izytechnologies.com",
    sub: "We reply within 24 hours",
    href: "mailto:info@izytechnologies.com",
  },
  {
    icon: MapPin,
    label: "Head Office",
    value: "Port Harcourt, Rivers State",
    sub: "Nationwide service coverage",
    href: "#",
  },
];

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [searchParams] = useSearchParams();

  // Sync service field with ?service= param — clears back to default when param is absent
  useEffect(() => {
    const svc = searchParams.get("service") ?? "";
    setForm(f => ({ ...f, service: svc }));
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-28 overflow-hidden" style={{ background: "#041627" }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
              Get In Touch
            </span>
          </div>
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
            }}
          >
            Start Your Project Today
          </h2>
          <p className="text-white/45 text-[0.95rem] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            Get a free consultation and quote. Our team responds within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left — contact info */}
          <div className="lg:col-span-2 space-y-3">
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 p-5 border border-white/8 hover:border-[#F0A20E]/30 transition-all group"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#F0A20E]/15"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <Icon size={16} className="text-white/60 group-hover:text-[#F0A20E] transition-colors" />
                  </div>
                  <div>
                    <div className="text-white/30 text-xs mb-0.5" style={{ fontFamily: "var(--font-ui)" }}>
                      {item.label}
                    </div>
                    <div className="font-semibold text-white/80 text-sm group-hover:text-[#F0A20E] transition-colors" style={{ fontFamily: "var(--font-body)" }}>
                      {item.value}
                    </div>
                    <div className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
                      {item.sub}
                    </div>
                  </div>
                </motion.a>
              );
            })}

            {/* Emergency CTA */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.28 }}
              className="p-6 border"
              style={{ background: "rgba(240,162,14,0.08)", borderColor: "rgba(240,162,14,0.25)" }}
            >
              <div
                className="w-px h-8 mb-5"
                style={{ background: "linear-gradient(to bottom, #F0A20E, transparent)" }}
              />
              <h3 className="text-white mb-2 text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Emergency Electrical?
              </h3>
              <p className="text-white/40 text-sm mb-5" style={{ fontFamily: "var(--font-body)" }}>
                24/7 emergency call-out for critical electrical faults and security failures.
              </p>
              <a
                href="tel:+2348000000000"
                className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[#041627] text-sm transition-all hover:shadow-[0_4px_20px_rgba(240,162,14,0.4)]"
                style={{ background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)", fontFamily: "var(--font-ui)" }}
              >
                <Phone size={13} strokeWidth={2.5} /> Emergency Line
              </a>
            </motion.div>
          </div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 p-8 border border-white/8"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-16 h-16 flex items-center justify-center mb-5"
                  style={{ background: "rgba(240,162,14,0.15)" }}
                >
                  <CheckCircle size={32} style={{ color: "#F0A20E" }} />
                </motion.div>
                <h3 className="text-white mb-2" style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700 }}>
                  Message Received
                </h3>
                <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                  Thank you. Our team will contact you within 24 hours to discuss your project.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-semibold hover:underline"
                  style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3
                  className="text-white mb-6"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700 }}
                >
                  Request a Free Quote
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", key: "name", type: "text", placeholder: "John Adeyemi", required: true },
                    { label: "Phone Number", key: "phone", type: "tel", placeholder: "+234 800 000 0000", required: true },
                  ].map(({ label, key, type, placeholder, required }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-white/35 mb-2 uppercase tracking-wide" style={{ fontFamily: "var(--font-ui)" }}>
                        {label} {required && "*"}
                      </label>
                      <input
                        type={type}
                        required={required}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F0A20E]/50 focus:ring-1 focus:ring-[#F0A20E]/30 transition-all text-sm bg-transparent"
                        style={{ fontFamily: "var(--font-body)" }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/35 mb-2 uppercase tracking-wide" style={{ fontFamily: "var(--font-ui)" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F0A20E]/50 focus:ring-1 focus:ring-[#F0A20E]/30 transition-all text-sm bg-transparent"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/35 mb-2 uppercase tracking-wide" style={{ fontFamily: "var(--font-ui)" }}>
                    Service Required *
                  </label>
                  <select
                    required
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 text-white focus:outline-none focus:border-[#F0A20E]/50 focus:ring-1 focus:ring-[#F0A20E]/30 transition-all text-sm bg-[#041627]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <option value="" className="text-white/30">Select a service...</option>
                    <option>Solar Energy Systems</option>
                    <option>Industrial Wiring</option>
                    <option>Smart Home Automation</option>
                    <option>CCTV & Security</option>
                    <option>IT & Tech Services</option>
                    <option>General Electrical</option>
                    <option>Multiple Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/35 mb-2 uppercase tracking-wide" style={{ fontFamily: "var(--font-ui)" }}>
                    Project Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your project, location, and any specific requirements..."
                    className="w-full px-4 py-3 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F0A20E]/50 focus:ring-1 focus:ring-[#F0A20E]/30 transition-all text-sm resize-none bg-transparent"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-shimmer w-full py-4 font-bold text-[#041627] flex items-center justify-center gap-2.5 transition-all hover:shadow-[0_8px_30px_rgba(240,162,14,0.4)] hover:scale-[1.01] text-sm tracking-wider"
                  style={{
                    background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)",
                    fontFamily: "var(--font-ui)",
                    letterSpacing: "0.07em",
                  }}
                >
                  <Send size={15} strokeWidth={2.5} /> SEND MY REQUEST
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
