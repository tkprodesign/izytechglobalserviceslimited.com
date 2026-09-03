import { Phone, Mail, MapPin, ArrowRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { PageLayout } from "../components/PageLayout";
import { SiteAssessmentForm } from "../components/SiteAssessmentForm";

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
    value: "info@izytechglobalservices.com",
    sub: "We reply within 24 hours",
    href: "mailto:info@izytechglobalservices.com",
  },
  {
    icon: MapPin,
    label: "Head Office",
    value: "Port Harcourt, Rivers State",
    sub: "Nationwide service coverage",
    href: "#",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Mon – Sat: 8am – 6pm",
    sub: "Emergency line available 24/7",
    href: "#",
  },
];

export function ContactPage() {
  return (
    <PageLayout>
      {/* ── Hero ── */}
      <div className="pt-20 relative overflow-hidden" style={{ background: "#041627" }}>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 70% at 80% 50%, rgba(240,162,14,0.06) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                Get In Touch
              </span>
            </div>
            <h1
              className="text-white mb-5"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem,5vw,4rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Start Your Project Today
            </h1>
            <p
              className="text-white/45 max-w-xl text-base leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              For field projects, submit your details and site address. We review the request before sending the assessment charge and payment instructions.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Contact info strip ── */}
      <div style={{ background: "#F0A20E" }}>
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={16} className="text-[#041627]/60 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#041627]/50" style={{ fontFamily: "var(--font-ui)" }}>
                  {label}
                </div>
                <div className="text-[#041627] font-bold text-sm leading-tight" style={{ fontFamily: "var(--font-body)" }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left — contact details */}
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
                  <span
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
                  >
                    Contact Details
                  </span>
                </div>
                <h2
                  className="text-[#041627] mb-3"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
                >
                  We're Here to Help
                </h2>
                <p className="text-[#041627]/50 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  Whether it's a simple query or a large industrial project, our team is ready to assist you anywhere across Nigeria.
                </p>
              </motion.div>

              {contactInfo.map(({ icon: Icon, label, value, sub, href }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 p-5 border border-gray-100 hover:border-[#F0A20E]/40 transition-all group"
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#F0A20E]/10"
                    style={{ background: "rgba(4,22,39,0.04)" }}
                  >
                    <Icon size={16} className="text-[#041627]/40 group-hover:text-[#F0A20E] transition-colors" />
                  </div>
                  <div>
                    <div className="text-[#041627]/35 text-xs mb-0.5" style={{ fontFamily: "var(--font-ui)" }}>
                      {label}
                    </div>
                    <div className="font-semibold text-[#041627] text-sm group-hover:text-[#C8971A] transition-colors" style={{ fontFamily: "var(--font-body)" }}>
                      {value}
                    </div>
                    <div className="text-[#041627]/35 text-xs mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
                      {sub}
                    </div>
                  </div>
                </motion.a>
              ))}

              {/* Emergency box */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.32 }}
                className="p-6 border mt-2"
                style={{ background: "rgba(4,22,39,0.03)", borderColor: "#e2e8f0", borderTopColor: "#F0A20E", borderTopWidth: 3 }}
              >
                <h3 className="text-[#041627] mb-2 text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  Emergency Electrical?
                </h3>
                <p className="text-[#041627]/45 text-sm mb-5" style={{ fontFamily: "var(--font-body)" }}>
                  24/7 emergency call-out for critical electrical faults and security failures.
                </p>
                <a
                  href="tel:+2348101262814"
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[#041627] text-sm transition-all hover:opacity-90"
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
              className="lg:col-span-3 p-8 lg:p-10 border border-gray-100"
              style={{ background: "#f9fafb" }}
            >
              <SiteAssessmentForm />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Why contact us ── */}
      <div className="py-16" style={{ background: "#f5f6f8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: "Review Before Scheduling", body: "We review your project scope and location before sending a site-assessment charge and payment instructions." },
              { title: "Clear Payment Confirmation", body: "Upload your receipt or invoice for manual review. Visits normally proceed after payment is confirmed." },
              { title: "Project Kickoff on Your Schedule", body: "Once the assessment is confirmed, we agree a practical visit window and keep you updated through your request page." },
            ].map(({ title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white p-7 border border-gray-100"
              >
                <div
                  className="text-xs font-bold mb-3 tabular-nums"
                  style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
                >
                  0{i + 1}
                </div>
                <h3
                  className="text-[#041627] font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "-0.015em" }}
                >
                  {title}
                </h3>
                <p className="text-[#041627]/50 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="py-16" style={{ background: "#041627" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2
              className="text-white mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              Prefer to see our work first?
            </h2>
            <p className="text-white/40 mb-7 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              Browse our portfolio of 1000+ completed projects across Nigeria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-[#041627] text-sm tracking-wider hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)", fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
              >
                VIEW PROJECTS <ArrowRight size={14} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-white text-sm tracking-wider border border-white/20 hover:border-white/40 transition-colors"
                style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
              >
                ABOUT US
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
