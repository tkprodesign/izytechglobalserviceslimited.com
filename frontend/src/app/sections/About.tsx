import { useEffect, useRef, useState } from "react";
import {
  CheckCircle, Award, Users, Globe, Lightbulb, Building2, Zap,
  Home, TrendingUp, Star, Rocket, Shield, Calendar, Target, Compass,
  Sun, Wrench, Package, Flag, Heart, Layers, Map, Settings, User,
} from "lucide-react";
import { motion, useInView } from "motion/react";

const API = import.meta.env.VITE_API_URL ?? '';

// ── Icon map for DB-driven milestones ────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Lightbulb, Building2, Zap, Home, TrendingUp, Award, Globe, Star, Rocket,
  Shield, Calendar, Target, Compass, Sun, Wrench, Package, Flag, Heart,
  Layers, Map, Settings, User, CheckCircle, Users,
};

const whyUs = [
  {
    icon: Award,
    title: "Certified & Licensed",
    description: "Fully certified electrical engineers and COREN-registered professionals handling every project.",
  },
  {
    icon: CheckCircle,
    title: "End-to-End Service",
    description: "We design, supply, install and maintain — one partner for the entire lifecycle of your project.",
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "A dedicated crew of engineers, technicians and project managers with deep industry expertise.",
  },
  {
    icon: Globe,
    title: "Nationwide Reach",
    description: "Operating across all 36 states and FCT, with rapid deployment capacity for any project scale.",
  },
];

interface Milestone {
  id: number;
  year: string;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

interface Founder {
  name: string;
  title: string;
  bio: string;
  photo_url: string;
}

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1600;
    const step = 16;
    const increment = to / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function About() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [founder, setFounder] = useState<Founder | null>(null);

  useEffect(() => {
    fetch(`${API}/api/public/milestones`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setMilestones(d.data); })
      .catch(() => {});

    fetch(`${API}/api/public/founder`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setFounder(d.data); })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── About intro ─────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-28">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                About Us
              </span>
            </div>
            <h2
              className="text-[#0d1b2e] mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.9rem, 3.5vw, 2.9rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
              }}
            >
              Illuminating the Future<br />
              of Solar Energy
            </h2>
            <div className="space-y-4 text-[#64748b] leading-relaxed text-[0.95rem]" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Since our inception in 2018, IZY Technologies Global Services Limited has emerged as a leader in the solar energy sector, dedicated to providing innovative and sustainable energy solutions across Nigeria.
              </p>
              <p>
                With a strong commitment to excellence and customer satisfaction, we have grown from a small team of solar enthusiasts into a comprehensive energy and technology company — transforming the way individuals and businesses harness solar power for a cleaner, more sustainable future.
              </p>
              <p>
                Our mission is to empower communities through accessible and reliable solar energy solutions, reducing dependence on fossil fuels and enhancing energy independence for every client we serve.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="btn-shimmer inline-flex items-center gap-2 px-7 py-3.5 font-bold text-[#041627] text-sm tracking-wider transition-all hover:shadow-[0_6px_24px_rgba(240,162,14,0.4)] hover:scale-[1.02]"
                style={{
                  fontFamily: "var(--font-ui)",
                  background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)",
                  letterSpacing: "0.07em",
                }}
              >
                Work With Us
              </a>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-[#0d1b2e] border border-[#0d1b2e]/15 hover:border-[#F0A20E] hover:text-[#F0A20E] transition-all text-sm"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                View Projects
              </a>
            </div>
          </motion.div>

          {/* Right — photo + timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative mb-10 overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-56 overflow-hidden"
              >
                <img
                  src="/site-images/about-team.jpg"
                  alt="IZY Technologies team on site"
                  className="w-full h-full object-cover object-top"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(4,22,39,0.55) 0%, transparent 60%)" }}
                />
                <div
                  className="absolute bottom-4 left-4 text-white/80 text-xs font-semibold tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  Our Team · On Site
                </div>
              </motion.div>
            </div>

            {/* Timeline — DB-driven */}
            <div className="space-y-0">
              {milestones.map((m, i) => {
                const IconComp = ICON_MAP[m.icon_name] || Star;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-5 py-4 border-b border-[#f0f1f3] last:border-0 group"
                  >
                    <div
                      className="flex-shrink-0 w-16 text-right text-xs font-bold text-[#0d1b2e]/35 pt-0.5 group-hover:text-[#F0A20E] transition-colors leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {m.year}
                    </div>
                    <div className="flex-shrink-0 mt-1 p-1 rounded transition-colors" style={{ color: "#F0A20E" }}>
                      <IconComp size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#0d1b2e] text-sm font-semibold mb-0.5 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                        {m.title}
                      </p>
                      <p className="text-[#0d1b2e]/55 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                        {m.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Animated stat counters ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 grid grid-cols-2 lg:grid-cols-4 gap-0 border border-[#e8edf3] divide-x divide-[#e8edf3]"
        >
          {[
            { to: 1000, suffix: "+", label: "Installations" },
            { to: 8,    suffix: "+", label: "Years of Excellence" },
            { to: 36,   suffix: "",  label: "States Covered" },
            { to: 98,   suffix: "%", label: "Client Satisfaction" },
          ].map(({ to, suffix, label }) => (
            <div key={label} className="px-8 py-7 text-center">
              <div
                className="mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2.4rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#F0A20E",
                }}
              >
                <Counter to={to} suffix={suffix} />
              </div>
              <div className="text-[#041627]/40 text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)" }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Founder section ──────────────────────────────────────────────── */}
        {founder && founder.name && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-20 border border-[#e8edf3] overflow-hidden"
          >
            <div className="grid lg:grid-cols-3">
              {/* Photo */}
              <div
                className="flex items-center justify-center p-10 lg:p-14"
                style={{ background: "linear-gradient(135deg, #0d1b2e 0%, #1a3a5c 100%)" }}
              >
                {founder.photo_url ? (
                  <img
                    src={founder.photo_url}
                    alt={founder.name}
                    className="w-36 h-36 rounded-full object-cover object-top ring-4"
                    style={{ ringColor: "rgba(240,162,14,0.4)" }}
                  />
                ) : (
                  <div
                    className="w-36 h-36 rounded-full flex items-center justify-center text-white"
                    style={{ background: "rgba(240,162,14,0.15)", border: "2px dashed rgba(240,162,14,0.4)" }}
                  >
                    <User size={48} style={{ color: "rgba(240,162,14,0.6)" }} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="lg:col-span-2 p-10 lg:p-14 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
                  <span
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
                  >
                    Our Founder
                  </span>
                </div>
                <h3
                  className="text-[#0d1b2e] mb-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {founder.name}
                </h3>
                <p className="text-sm font-medium mb-5" style={{ color: "#F0A20E", fontFamily: "var(--font-ui)" }}>
                  {founder.title}
                </p>
                <p className="text-[#64748b] leading-relaxed text-[0.95rem]" style={{ fontFamily: "var(--font-body)" }}>
                  {founder.bio}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Why Choose Us ────────────────────────────────────────────────── */}
        <div>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Why Choose IZY
              </span>
            </div>
            <h2
              className="text-[#0d1b2e]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.7rem, 3vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
              }}
            >
              The IZY Technologies Advantage
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  className="p-6 border border-[#e8edf3] bg-white transition-shadow hover:shadow-lg hover:shadow-black/6 hover:border-[#F0A20E]/30"
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center mb-4 transition-colors"
                    style={{ background: "rgba(240,162,14,0.1)" }}
                  >
                    <Icon size={18} style={{ color: "#F0A20E" }} />
                  </div>
                  <h3
                    className="text-[#0d1b2e] mb-2"
                    style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700 }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[#64748b] text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
