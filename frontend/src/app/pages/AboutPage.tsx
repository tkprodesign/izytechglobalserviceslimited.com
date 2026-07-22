import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Award, CheckCircle, Users, Globe, ArrowRight, MapPin, Calendar, Zap, Shield } from "lucide-react";
import { Link } from "react-router";
import { PageLayout } from "../components/PageLayout";
import iconLogo from "../../imports/izy-technologies_icon_v1.png";

const stats = [
  { value: 500, suffix: "+", label: "Projects Completed" },
  { value: 12,  suffix: "+", label: "Years of Excellence" },
  { value: 36,  suffix: "",  label: "States Covered" },
  { value: 98,  suffix: "%", label: "Client Satisfaction" },
];

const milestones = [
  { year: "2012", title: "Company Founded", detail: "IZY Technologies established in Port Harcourt with a team of 4 licensed engineers." },
  { year: "2015", title: "Industrial Expansion", detail: "Secured first major industrial contracts — wiring and power distribution for factories across Rivers State." },
  { year: "2018", title: "Solar Division Launched", detail: "Dedicated solar engineering team established as demand for renewable energy surged across Nigeria." },
  { year: "2020", title: "Smart Home & CCTV", detail: "Launched smart home automation and CCTV divisions. First multi-system integrated project delivered in Abuja." },
  { year: "2023", title: "500+ Projects Milestone", detail: "Celebrated 500 completed projects across 20 states, with a team that had grown to 60+ engineers and technicians." },
  { year: "2024", title: "Nationwide Coverage", detail: "Expanded operations to all 36 states and FCT, establishing IZY as Nigeria's premier energy solutions company." },
];

const whyUs = [
  { icon: Award,        title: "Certified & Licensed",  detail: "Fully certified electrical engineers and COREN-registered professionals handling every project to the highest standard." },
  { icon: CheckCircle,  title: "End-to-End Service",    detail: "We design, supply, install and maintain — one partner for the entire lifecycle of every project we undertake." },
  { icon: Users,        title: "Expert Team",            detail: "60+ engineers, technicians and project managers with deep industry expertise across energy, tech and automation." },
  { icon: Globe,        title: "Nationwide Reach",       detail: "Operating across all 36 states and FCT with rapid deployment capacity, regardless of project scale or location." },
  { icon: Zap,          title: "Fast Turnaround",        detail: "Site assessment within 48 hours, detailed proposal within 72 hours, and project kickoff on your schedule." },
  { icon: Shield,       title: "2-Year Warranty",        detail: "Every installation comes with a 2-year workmanship warranty and 24/7 emergency support from our service team." },
];

const teamPhotos = [
  { src: "/site-images/project-site-team.jpg",  caption: "Site inspection team" },
  { src: "/site-images/about-team.jpg",          caption: "Rooftop solar installation" },
  { src: "/site-images/project-site-team2.jpg", caption: "Project assessment crew" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = 16;
    const increment = to / (1400 / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function AboutPage() {
  return (
    <PageLayout>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="pt-20 relative overflow-hidden" style={{ background: "#041627", minHeight: 420 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/site-images/about-team.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            opacity: 0.18,
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #041627 40%, transparent 100%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Who We Are
              </span>
            </div>
            <h1
              className="text-white mb-6"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              About IZY Technologies
            </h1>
            <p className="text-white/50 max-w-lg text-base leading-relaxed mb-8" style={{ fontFamily: "var(--font-body)" }}>
              Nigeria's premier technology and energy services company. Powering homes, businesses and industries since 2012.
            </p>
            <div className="flex items-center gap-2 text-white/30 text-sm" style={{ fontFamily: "var(--font-ui)" }}>
              <MapPin size={13} style={{ color: "#F0A20E" }} />
              Port Harcourt, Rivers State &nbsp;·&nbsp; Nationwide Coverage
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────── */}
      <div style={{ background: "#F0A20E" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label }) => (
            <div key={label} className="text-center">
              <div
                className="text-[#041627] font-black mb-0.5"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3vw,2.5rem)", letterSpacing: "-0.03em" }}
              >
                <Counter to={value} suffix={suffix} />
              </div>
              <div className="text-[#041627]/60 text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "var(--font-ui)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mission & Vision ──────────────────────────────── */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Our Purpose
              </span>
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
            </div>
            <h2
              className="text-[#041627]"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              Mission & Vision
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                label: "Our Mission",
                text: "To deliver world-class electrical, energy and technology solutions that transform the way Nigerians live and work — through innovation, integrity and relentless commitment to quality.",
                accent: "#F0A20E",
              },
              {
                label: "Our Vision",
                text: "To be Africa's most trusted energy and technology partner — building a future where reliable power and intelligent systems are accessible to every home, business and community on the continent.",
                accent: "#3B82F6",
              },
            ].map(({ label, text, accent }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="p-8 border border-gray-100"
                style={{ borderTopColor: accent, borderTopWidth: 3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <img src={iconLogo} alt="IZY" className="h-6 w-auto opacity-50" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400" style={{ fontFamily: "var(--font-ui)" }}>
                    {label}
                  </span>
                </div>
                <p className="text-[#041627]/70 leading-relaxed" style={{ fontFamily: "var(--font-body)", fontSize: "1rem" }}>
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Our Story ─────────────────────────────────────── */}
      <div className="py-24" style={{ background: "#f5f6f8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Our Journey
              </span>
            </div>
            <h2
              className="text-[#041627]"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              12 Years Building Nigeria's Energy Future
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[22px] lg:left-1/2 top-0 bottom-0 w-px bg-gray-200 lg:-translate-x-1/2" />

            <div className="space-y-10">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex gap-6 lg:gap-0 ${i % 2 === 0 ? "lg:flex-row-reverse" : "lg:flex-row"}`}
                >
                  {/* Dot */}
                  <div className="absolute left-0 lg:left-1/2 w-11 h-11 lg:-translate-x-1/2 flex items-center justify-center z-10">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ background: "white", borderColor: "#F0A20E" }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: "#F0A20E" }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`ml-16 lg:ml-0 lg:w-5/12 bg-white p-6 border border-gray-100 ${i % 2 === 0 ? "lg:mr-auto lg:pr-12" : "lg:ml-auto lg:pl-12"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={12} style={{ color: "#F0A20E" }} />
                      <span className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                        {m.year}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#041627] mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "-0.015em" }}>
                      {m.title}
                    </h3>
                    <p className="text-[#041627]/50 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      {m.detail}
                    </p>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden lg:block lg:w-5/12" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Why Choose Us ─────────────────────────────────── */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Why IZY
              </span>
            </div>
            <h2
              className="text-[#041627]"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              What Sets Us Apart
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map(({ icon: Icon, title, detail }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="p-7 border border-gray-100 hover:border-[#F0A20E]/30 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ background: "rgba(240,162,14,0.08)" }}>
                  <Icon size={18} style={{ color: "#F0A20E" }} />
                </div>
                <h3 className="font-bold text-[#041627] mb-2" style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "-0.015em" }}>
                  {title}
                </h3>
                <p className="text-[#041627]/50 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Team in action ────────────────────────────────── */}
      <div className="py-24" style={{ background: "#f5f6f8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Our People
              </span>
            </div>
            <h2
              className="text-[#041627]"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              The Team Behind Every Project
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {teamPhotos.map(({ src, caption }, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative overflow-hidden group"
                style={{ height: i === 1 ? 380 : 280 }}
              >
                <img
                  src={src}
                  alt={caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(4,22,39,0.65) 0%, transparent 55%)" }} />
                <div className="absolute bottom-4 left-4 text-white text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)" }}>
                  {caption}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────── */}
      <div className="py-24" style={{ background: "#041627" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2
              className="text-white mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              Ready to work with us?
            </h2>
            <p className="text-white/40 mb-8 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              Join 500+ satisfied clients across Nigeria. Get your free consultation and quote today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/#contact"
                className="inline-flex items-center justify-center gap-3 px-9 py-4 font-bold text-[#041627] text-sm tracking-wider hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)", fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
              >
                GET A FREE QUOTE <ArrowRight size={15} />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-3 px-9 py-4 font-bold text-white text-sm tracking-wider border border-white/20 hover:border-white/40 transition-colors"
                style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
              >
                VIEW OUR SERVICES
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

    </PageLayout>
  );
}
