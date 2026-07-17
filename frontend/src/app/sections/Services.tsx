import { Sun, Zap, Home, Camera, Cpu, Cable, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const services = [
  {
    num: "01",
    icon: Sun,
    title: "Solar Energy Systems",
    description:
      "Complete solar design, supply, installation and maintenance for residential, commercial and industrial clients. Grid-tie, off-grid, and hybrid systems.",
    features: ["System Design & Sizing", "Panel Installation", "Inverter & Battery Setup", "Net Metering & Grid-Tie"],
    featured: true,
  },
  {
    num: "02",
    icon: Cable,
    title: "Industrial Wiring",
    description:
      "High-voltage and low-voltage industrial electrical installations, distribution boards, cable trays, conduit systems and power factor correction.",
    features: ["Distribution Boards", "Cable Tray Systems", "Motor Control Centers", "Earthing & Bonding"],
  },
  {
    num: "03",
    icon: Home,
    title: "Smart Home Automation",
    description:
      "Transform your home into an intelligent, connected space. Control lighting, climate, entertainment and security from any device, anywhere.",
    features: ["Lighting Automation", "Climate Control", "Voice & App Integration", "Energy Management"],
  },
  {
    num: "04",
    icon: Camera,
    title: "CCTV & Security",
    description:
      "End-to-end surveillance and access control solutions. HD/4K cameras, NVR systems, remote monitoring and alarm systems for homes and businesses.",
    features: ["HD/4K Cameras", "Remote Monitoring", "Access Control", "Alarm Systems"],
  },
  {
    num: "05",
    icon: Cpu,
    title: "IT & Tech Services",
    description:
      "Networking infrastructure, server setup, IT consulting, structured cabling, and managed IT services for businesses of all sizes.",
    features: ["Network Infrastructure", "Server Deployment", "Structured Cabling", "IT Consulting"],
  },
  {
    num: "06",
    icon: Zap,
    title: "General Electrical",
    description:
      "Comprehensive electrical installation, maintenance and repairs for residential and commercial properties. Licensed, insured, and reliable.",
    features: ["Electrical Installation", "Fault Finding", "Rewiring & Upgrades", "Safety Inspections"],
  },
];

export function Services() {
  return (
    <section id="services" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 pb-10 border-b border-[#e8edf3]">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                What We Do
              </span>
            </div>
            <h2
              className="text-[#041627]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              Comprehensive Tech &<br />Energy Solutions
            </h2>
          </div>
          <p
            className="text-[#64748b] max-w-sm text-sm leading-relaxed lg:text-right"
            style={{ fontFamily: "var(--font-body)" }}
          >
            From solar panels to smart homes — we bring the future of technology to your doorstep, backed by a decade of excellence.
          </p>
        </div>

        {/* Service rows */}
        <div className="divide-y divide-[#e8edf3]">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="service-row group grid lg:grid-cols-12 gap-6 py-8 items-start -mx-6 px-6 transition-colors duration-300 hover:bg-[#fafbfc]"
              >
                {/* Number */}
                <div className="lg:col-span-1 flex items-center">
                  <span
                    className="text-[#041627]/15 font-bold text-sm group-hover:text-[#F0A20E]/30 transition-colors duration-300"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {service.num}
                  </span>
                </div>

                {/* Icon */}
                <div className="lg:col-span-1 hidden lg:flex items-start pt-0.5">
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                    style={{
                      background: service.featured ? "#F0A20E" : "rgba(4,22,39,0.06)",
                    }}
                  >
                    <Icon size={16} style={{ color: "#041627" }} />
                  </motion.div>
                </div>

                {/* Title */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="lg:hidden w-8 h-8 flex items-center justify-center flex-shrink-0"
                      style={{ background: service.featured ? "#F0A20E" : "rgba(4,22,39,0.06)" }}
                    >
                      <Icon size={15} style={{ color: "#041627" }} />
                    </div>
                    <div>
                      <h3
                        className="text-[#041627] group-hover:text-[#041627] transition-colors duration-200"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {service.title}
                      </h3>
                      {service.featured && (
                        <span
                          className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 text-[#041627]"
                          style={{ background: "#F0A20E", fontFamily: "var(--font-ui)" }}
                        >
                          POPULAR
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="lg:col-span-4">
                  <p className="text-[#64748b] text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {service.description}
                  </p>
                </div>

                {/* Features + CTA */}
                <div className="lg:col-span-3">
                  <ul className="space-y-1.5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-[#041627]/55" style={{ fontFamily: "var(--font-ui)" }}>
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#F0A20E" }} />
                        {f}
                      </li>
                    ))}
                    <li className="pt-2">
                      <a
                        href="#contact"
                        className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide transition-all group-hover:gap-2.5"
                        style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
                      >
                        Get a Quote <ArrowRight size={11} strokeWidth={2.5} />
                      </a>
                    </li>
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 pt-10 border-t border-[#e8edf3] flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div>
            <p className="text-[#041627] font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Not sure what you need?
            </p>
            <p className="text-[#64748b] text-sm" style={{ fontFamily: "var(--font-body)" }}>
              Our experts will assess your requirements at no cost.
            </p>
          </div>
          <a
            href="#contact"
            className="btn-shimmer flex-shrink-0 inline-flex items-center gap-2.5 px-8 py-3.5 font-bold text-[#041627] text-sm tracking-wider transition-all hover:shadow-[0_6px_24px_rgba(240,162,14,0.4)] hover:scale-[1.02]"
            style={{
              fontFamily: "var(--font-ui)",
              background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)",
              letterSpacing: "0.07em",
            }}
          >
            FREE ASSESSMENT <ArrowRight size={14} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}
