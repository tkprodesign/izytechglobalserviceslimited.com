import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router";

const projects = [
  {
    title: "150kW Commercial Solar Farm",
    location: "Trans Amadi, Port Harcourt",
    category: "Solar Energy",
    description: "Full design and installation of a 150kW grid-tie solar system for a manufacturing facility, reducing their electricity bill by 78%.",
    image: "/site-images/project-commercial-solar.jpg",
    tag: "Commercial",
    featured: true,
  },
  {
    title: "Smart Villa Automation",
    location: "GRA Phase 2, Port Harcourt",
    category: "Smart Home",
    description: "Complete smart home integration for a 5-bedroom villa including lighting, HVAC control, entertainment and security.",
    image: "/site-images/project-smart-home.jpg",
    tag: "Residential",
  },
  {
    title: "Factory CCTV & Access Control",
    location: "Aba, Abia State",
    category: "Security",
    description: "96-camera CCTV network with biometric access control for a 20-acre industrial facility, monitored 24/7 remotely.",
    image: "/site-images/project-industrial.jpg",
    tag: "Industrial",
  },
  {
    title: "Hospital Electrical Overhaul",
    location: "Abuja, FCT",
    category: "Industrial Wiring",
    description: "Complete electrical infrastructure upgrade for a 200-bed hospital including UPS systems, distribution boards and emergency backup.",
    image: "/site-images/project-power-unit.jpg",
    tag: "Healthcare",
  },
  {
    title: "School Solar + IT Upgrade",
    location: "Port Harcourt, Rivers",
    category: "Solar + IT",
    description: "Off-grid solar installation and complete IT infrastructure upgrade for a private school, powering 40 classrooms reliably.",
    image: "/site-images/project-residential-solar.jpg",
    tag: "Education",
  },
  {
    title: "Hotel Smart Security Suite",
    location: "Peter Odili Road, Port Harcourt",
    category: "Security",
    description: "Luxury hotel security overhaul with smart locks, 128 CCTV cameras, perimeter sensors and centralized monitoring.",
    image: "/site-images/project-site-team.jpg",
    tag: "Hospitality",
  },
];

const [featured, ...rest] = projects;

export function Projects() {
  return (
    <section id="projects" className="py-28" style={{ background: "#f5f6f8" }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                Our Portfolio
              </span>
            </div>
            <h2
              className="text-[#041627]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.9rem, 4vw, 2.9rem)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              Projects That Speak<br />for Themselves
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-5 self-start lg:self-end">
            <Link
              to="/projects"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-bold text-[#041627] border-b-2 border-[#F0A20E] pb-0.5 hover:text-[#F0A20E] transition-all"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              View All Projects <ArrowRight size={14} />
            </Link>
            <a
              href="#contact"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[#041627]/50 border-b border-[#041627]/20 pb-0.5 hover:border-[#F0A20E] hover:text-[#F0A20E] transition-all"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Discuss Your Project <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Featured — full width split */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group relative mb-5 overflow-hidden bg-[#041627] cursor-pointer"
        >
          <div className="grid lg:grid-cols-2">
            {/* Image */}
            <div className="relative h-64 lg:h-auto lg:min-h-[440px] overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#041627]/50 lg:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041627]/60 to-transparent lg:hidden" />
              <div
                className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 text-[#041627]"
                style={{ background: "#F0A20E", fontFamily: "var(--font-ui)" }}
              >
                Featured
              </div>
            </div>

            {/* Content */}
            <div className="p-8 lg:p-14 flex flex-col justify-center">
              <div
                className="text-xs font-semibold mb-4 tracking-[0.15em] uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                {featured.category}
              </div>
              <h3
                className="text-white mb-5"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {featured.title}
              </h3>
              <p className="text-white/50 leading-relaxed mb-6 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                {featured.description}
              </p>

              {/* Metric highlight */}
              <div
                className="inline-flex items-center gap-3 px-4 py-3 mb-8 self-start"
                style={{ background: "rgba(240,162,14,0.1)", borderLeft: "3px solid #F0A20E" }}
              >
                <span className="text-white/60 text-xs" style={{ fontFamily: "var(--font-ui)" }}>
                  Energy savings
                </span>
                <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "#F0A20E" }}>
                  78%
                </span>
              </div>

              <div className="flex items-center gap-2 text-white/30 text-xs mb-8" style={{ fontFamily: "var(--font-ui)" }}>
                <MapPin size={11} /> {featured.location}
              </div>
              <Link
                to="/projects/150kw-commercial-solar-farm"
                data-testid="link-featured-project"
                className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all self-start"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                View Project Details <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Grid cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {rest.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5 }}
              className="group bg-white overflow-hidden border border-[#e8edf3] hover:border-[#F0A20E]/20 hover:shadow-xl hover:shadow-black/8 transition-all duration-400"
            >
              {/* Image with overlay reveal */}
              <div className="relative h-48 overflow-hidden bg-[#f5f6f8]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center"
                  style={{ background: "rgba(4,22,39,0.65)" }}
                >
                  <span
                    className="text-[#F0A20E] text-xs font-bold tracking-widest uppercase flex items-center gap-2"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    View Details <ArrowRight size={12} strokeWidth={2.5} />
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#041627]/50 to-transparent group-hover:opacity-0 transition-opacity duration-300" />
                <div
                  className="absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase px-2 py-1 text-white/80"
                  style={{ background: "rgba(4,22,39,0.55)", fontFamily: "var(--font-ui)", backdropFilter: "blur(4px)" }}
                >
                  {project.tag}
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/60 text-[10px] group-hover:opacity-0 transition-opacity" style={{ fontFamily: "var(--font-ui)" }}>
                  <MapPin size={9} /> {project.location}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div
                  className="text-[10px] font-semibold mb-2 tracking-[0.15em] uppercase"
                  style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
                >
                  {project.category}
                </div>
                <h3
                  className="text-[#041627] mb-2 group-hover:text-[#041627] transition-colors"
                  style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700 }}
                >
                  {project.title}
                </h3>
                <p className="text-[#64748b] text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p className="text-[#64748b] text-sm mb-5" style={{ fontFamily: "var(--font-body)" }}>
            These are just a few highlights from our growing portfolio.
          </p>
          <a
            href="#contact"
            className="btn-shimmer inline-flex items-center gap-3 px-9 py-4 font-bold text-[#041627] text-sm tracking-wider transition-all hover:shadow-[0_8px_30px_rgba(240,162,14,0.4)] hover:scale-[1.02]"
            style={{
              fontFamily: "var(--font-ui)",
              background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)",
              letterSpacing: "0.07em",
            }}
          >
            START YOUR PROJECT <ArrowRight size={14} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}
