import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, MapPin, Filter } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import { Link } from "react-router";

const projects = [
  {
    title: "150kW Commercial Solar Farm",
    location: "Trans Amadi, Port Harcourt",
    category: "Solar Energy",
    tag: "Commercial",
    description: "Full design and installation of a 150kW grid-tie solar system for a manufacturing facility, reducing their electricity bill by 78%. Project included 300 panels, 4 industrial inverters and a 200kWh battery bank.",
    image: "/site-images/project-commercial-solar.jpg",
    metric: "78% bill reduction",
    year: "2024",
  },
  {
    title: "Smart Villa Automation",
    location: "GRA Phase 2, Port Harcourt",
    category: "Smart Home",
    tag: "Residential",
    description: "Complete smart home integration for a 5-bedroom villa including lighting, HVAC control, entertainment and security. All systems integrated into a single app interface.",
    image: "/site-images/project-smart-home.jpg",
    metric: "Full home integration",
    year: "2024",
  },
  {
    title: "Factory CCTV & Access Control",
    location: "Aba, Abia State",
    category: "Security",
    tag: "Industrial",
    description: "96-camera CCTV network with biometric access control for a 20-acre industrial facility. Full remote monitoring capability with 30-day storage and licence plate recognition.",
    image: "/site-images/project-industrial.jpg",
    metric: "96 cameras deployed",
    year: "2023",
  },
  {
    title: "Hospital Electrical Overhaul",
    location: "Abuja, FCT",
    category: "Industrial Wiring",
    tag: "Healthcare",
    description: "Complete electrical infrastructure upgrade for a 200-bed hospital including UPS systems, distribution boards, transfer switches and emergency backup. Zero downtime since completion.",
    image: "/site-images/project-power-unit.jpg",
    metric: "Zero downtime post-install",
    year: "2023",
  },
  {
    title: "School Solar + IT Upgrade",
    location: "Port Harcourt, Rivers",
    category: "Solar Energy",
    tag: "Education",
    description: "Off-grid solar installation and complete IT infrastructure upgrade for a private school. Powers 40 classrooms, computer labs and administrative block around the clock.",
    image: "/site-images/project-residential-solar.jpg",
    metric: "40 classrooms powered",
    year: "2022",
  },
  {
    title: "Hotel Smart Security Suite",
    location: "Peter Odili Road, Port Harcourt",
    category: "Security",
    tag: "Hospitality",
    description: "Luxury hotel security overhaul with smart locks, 128 CCTV cameras, perimeter sensors and centralised monitoring. Complete visibility from a single dashboard, on any device.",
    image: "/site-images/project-site-team.jpg",
    metric: "Full remote access",
    year: "2022",
  },
];

const ALL_TAGS = ["All", ...Array.from(new Set(projects.map(p => p.tag)))];

const TAG_COLORS: Record<string, string> = {
  Commercial: "#F0A20E", Residential: "#8B5CF6", Industrial: "#3B82F6",
  Healthcare: "#EF4444", Education: "#10B981", Hospitality: "#F59E0B",
};

export function ProjectsPage() {
  const [active, setActive] = useState("All");

  const visible = active === "All" ? projects : projects.filter(p => p.tag === active);

  return (
    <PageLayout>
      {/* Hero */}
      <div className="pt-20 relative overflow-hidden" style={{ background: "#041627" }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(/site-images/project-site-team2.jpg)`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Our Work
              </span>
            </div>
            <h1
              className="text-white mb-5"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              Projects
            </h1>
            <p className="text-white/45 max-w-xl text-base leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Real work. Real results. A selection of projects delivered across Nigeria — from rooftop solar to full industrial electrical overhauls.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filter + Grid */}
      <div className="py-20" style={{ background: "#f5f6f8" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 mb-12">
            <Filter size={14} className="text-gray-400 mr-1" />
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActive(tag)}
                className="px-4 py-1.5 text-xs font-semibold tracking-wide transition-all"
                style={{
                  fontFamily: "var(--font-ui)",
                  background: active === tag ? "#041627" : "white",
                  color: active === tag ? "#F0A20E" : "#041627",
                  border: `1px solid ${active === tag ? "#041627" : "#e2e8f0"}`,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {visible.map((p) => (
                <motion.div
                  key={p.title}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white group overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-52">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    {/* Tag */}
                    <span
                      className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase text-white"
                      style={{ background: TAG_COLORS[p.tag] ?? "#041627", fontFamily: "var(--font-ui)" }}
                    >
                      {p.tag}
                    </span>
                    <span
                      className="absolute top-4 right-4 text-white/60 text-xs"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      {p.year}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="flex items-start gap-2 mb-1">
                      <MapPin size={12} className="mt-0.5 flex-shrink-0 text-[#F0A20E]" />
                      <span className="text-[11px] text-gray-400 tracking-wide" style={{ fontFamily: "var(--font-ui)" }}>
                        {p.location}
                      </span>
                    </div>
                    <h3
                      className="text-[#041627] font-bold mb-2 leading-snug"
                      style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", letterSpacing: "-0.015em" }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-[#041627]/50 text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-body)" }}>
                      {p.description}
                    </p>
                    <div
                      className="text-xs font-bold tracking-wider pt-4 border-t border-gray-100"
                      style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
                    >
                      ↗ {p.metric}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20" style={{ background: "#041627" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Ready to start your project?
          </h2>
          <p className="text-white/40 mb-8 text-sm" style={{ fontFamily: "var(--font-body)" }}>
            Get a free site assessment and detailed quote from our team — usually within 24 hours.
          </p>
          <Link
            to="/#contact"
            className="inline-flex items-center gap-3 px-9 py-4 font-bold text-[#041627] text-sm tracking-wider hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)", fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
          >
            GET A FREE QUOTE <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
