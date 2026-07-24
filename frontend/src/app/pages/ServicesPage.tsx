import { motion } from "motion/react";
import { Sun, Zap, Home, Camera, Cpu, Cable, ArrowRight, CheckCircle } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import { Link } from "react-router";

const services = [
  {
    num: "01", icon: Sun, title: "Solar Energy Systems",
    description: "Complete solar design, supply, installation and maintenance for residential, commercial and industrial clients. Grid-tie, off-grid, and hybrid systems tailored to your load profile.",
    features: ["System Design & Sizing", "Panel Installation", "Inverter & Battery Setup", "Net Metering & Grid-Tie", "Preventive Maintenance", "Performance Monitoring"],
    featured: true,
    image: "/site-images/project-commercial-solar.jpg",
    color: "#F0A20E",
  },
  {
    num: "02", icon: Cable, title: "Industrial Wiring",
    description: "High-voltage and low-voltage industrial electrical installations, distribution boards, cable trays, conduit systems and power factor correction for factories, warehouses and plants.",
    features: ["Distribution Boards", "Cable Tray Systems", "Motor Control Centers", "Earthing & Bonding", "Power Factor Correction", "Transformer Installation"],
    image: "/site-images/project-power-unit.jpg",
    color: "#3B82F6",
  },
  {
    num: "03", icon: Home, title: "Smart Home Automation",
    description: "Transform your home into an intelligent, connected space. Control lighting, climate, entertainment and security from any device, anywhere in the world.",
    features: ["Lighting Automation", "Climate Control", "Voice & App Integration", "Energy Management", "Smart Locks & Entry", "Entertainment Systems"],
    image: "/site-images/project-smart-home.jpg",
    color: "#8B5CF6",
  },
  {
    num: "04", icon: Camera, title: "CCTV & Security",
    description: "End-to-end surveillance and access control solutions. HD/4K cameras, NVR systems, remote monitoring and alarm systems for homes, businesses and industrial facilities.",
    features: ["HD/4K Camera Installation", "Remote Monitoring", "Access Control Systems", "Alarm Systems", "Perimeter Security", "Video Analytics"],
    image: "/site-images/project-industrial.jpg",
    color: "#EF4444",
  },
  {
    num: "05", icon: Cpu, title: "IT & Tech Services",
    description: "Networking infrastructure, server setup, IT consulting, structured cabling, and managed IT services for businesses of all sizes across Nigeria.",
    features: ["Network Infrastructure", "Server Deployment", "Structured Cabling", "IT Consulting", "Wi-Fi Solutions", "Data Centre Setup"],
    image: "/site-images/project-residential-solar.jpg",
    color: "#10B981",
  },
  {
    num: "06", icon: Zap, title: "General Electrical",
    description: "Comprehensive electrical installation, maintenance and repairs for residential and commercial properties. Licensed, insured, and reliable across all 36 states.",
    features: ["Electrical Installation", "Fault Finding", "Rewiring & Upgrades", "Safety Inspections", "Emergency Repairs", "Generator Installation"],
    image: "/site-images/project-site-team.jpg",
    color: "#F59E0B",
  },
];

export function ServicesPage() {
  return (
    <PageLayout>
      {/* Page hero */}
      <div className="pt-20" style={{ background: "#041627" }}>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                What We Do
              </span>
            </div>
            <h1
              className="text-white mb-5"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              Our Services
            </h1>
            <p className="text-white/45 max-w-xl text-base leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              From solar energy to smart automation, industrial wiring to IT infrastructure — <span className="whitespace-nowrap">IZY Technologies</span> is your single partner for every energy and technology need.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Services list */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={s.num}
                id={`service-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="grid lg:grid-cols-2 overflow-hidden border border-gray-100"
                style={{ minHeight: 340 }}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${isEven ? "lg:order-2" : "lg:order-1"}`} style={{ minHeight: 260 }}>
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover"
                    style={{ minHeight: 260 }}
                  />
                  <div className="absolute inset-0" style={{ background: "rgba(4,22,39,0.35)" }} />
                  <div
                    className="absolute top-5 left-5 text-5xl font-black text-white/10 select-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.num}
                  </div>
                </div>

                {/* Content */}
                <div className={`flex flex-col justify-center p-8 lg:p-12 bg-white ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <h2
                      className="font-bold text-[#041627]"
                      style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", letterSpacing: "-0.02em" }}
                    >
                      {s.title}
                    </h2>
                  </div>

                  <p className="text-[#041627]/55 text-sm leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
                    {s.description}
                  </p>

                  <ul className="grid grid-cols-2 gap-2 mb-8">
                    {s.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-[#041627]/65" style={{ fontFamily: "var(--font-body)" }}>
                        <CheckCircle size={12} style={{ color: s.color, flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/?service=${encodeURIComponent(s.title)}#contact`}
                    className="self-start flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-opacity hover:opacity-70"
                    style={{ fontFamily: "var(--font-ui)", color: s.color }}
                  >
                    Get a Quote <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="py-20" style={{ background: "#041627" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Not sure which service you need?
          </h2>
          <p className="text-white/40 mb-8 text-sm" style={{ fontFamily: "var(--font-body)" }}>
            Our team will assess your site, understand your goals and recommend the right solution — at no cost.
          </p>
          <Link
            to="/#contact"
            className="inline-flex items-center gap-3 px-9 py-4 font-bold text-[#041627] text-sm tracking-wider transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)", fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
          >
            GET A FREE CONSULTATION <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
