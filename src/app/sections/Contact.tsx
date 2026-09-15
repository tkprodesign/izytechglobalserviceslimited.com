import { Phone, Mail, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { SiteAssessmentForm } from "../components/SiteAssessmentForm";
import { PhoneActions } from "../components/PhoneActions";
import { formatCompanyAddress, useCompanyContact } from "../hooks/useCompanyContact";
import { COMPANY_PHONE_DISPLAY, COMPANY_PHONE_TEL } from "../data/contactChannels";

export function Contact() {
  const companyContact = useCompanyContact();
  const contactInfo = [
    {
      icon: Phone,
      label: "Call Us",
      value: COMPANY_PHONE_DISPLAY,
      sub: "Mon–Sat, 8am–6pm",
      href: COMPANY_PHONE_TEL,
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
      value: formatCompanyAddress(companyContact),
      sub: "Nationwide service coverage",
      href: "#",
    },
  ];

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
            For projects that require a site visit, submit your details and location. We review every request before sending the assessment charge.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left — contact info */}
          <div className="lg:col-span-2 space-y-3">
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
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
                    {item.label === "Call Us" ? (
                      <>
                        <div className="font-semibold text-white/80 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                          {item.value}
                        </div>
                        <PhoneActions dark className="mt-2" />
                      </>
                    ) : (
                      <a href={item.href} className="font-semibold text-white/80 text-sm group-hover:text-[#F0A20E] transition-colors" style={{ fontFamily: "var(--font-body)" }}>
                        {item.value}
                      </a>
                    )}
                    <div className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
                      {item.sub}
                    </div>
                  </div>
                </motion.div>
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
                24/7 Emergency Support for critical electrical faults and security failures.
              </p>
              <a
                href="tel:+2348101262814"
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
            id="quote-form"
            className="lg:col-span-3 p-8 border border-white/8"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <SiteAssessmentForm dark />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
