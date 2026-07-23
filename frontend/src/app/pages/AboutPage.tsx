import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Award, Users, Globe, ArrowRight, MapPin, Calendar, Zap, Shield, Target, Leaf, Heart } from "lucide-react";
import { Link } from "react-router";
import { PageLayout } from "../components/PageLayout";

const stats = [
  { value: 1000, suffix: "+", label: "Installations Completed" },
  { value: 8,    suffix: "+", label: "Years of Excellence" },
  { value: 4,    suffix: "",  label: "Service Divisions" },
  { value: 98,   suffix: "%", label: "Client Satisfaction" },
];

const milestones = [
  {
    year: "2018",
    title: "Company Founded",
    detail: "IZY Tech Global Services Limited was established on March 8, 2018 in Port Harcourt by Israel Ideozu — a small, driven team of solar enthusiasts committed to clean, reliable energy.",
  },
  {
    year: "2019",
    title: "First Major Contracts",
    detail: "Secured key residential and commercial solar contracts across Rivers State, building a reputation for high-quality installations and exceptional customer service.",
  },
  {
    year: "2020",
    title: "Multi-Division Expansion",
    detail: "Expanded offerings to include CCTV surveillance, smart home automation, and industrial wiring alongside our core solar and energy storage services.",
  },
  {
    year: "2022",
    title: "Sustainability Leadership",
    detail: "Joined local and global sustainability initiatives, advocating for the benefits of solar energy and contributing to environmental conservation across Nigeria.",
  },
  {
    year: "2023",
    title: "Industry Recognition",
    detail: "Our commitment to quality and innovation earned several awards and accolades within the renewable energy sector, affirming our status as a leader in solar technology.",
  },
  {
    year: "2024",
    title: "Nationwide Coverage",
    detail: "Now serving a diverse range of clients — from homeowners to large enterprises — with rapid deployment capacity across Nigeria and growing international reach.",
  },
];

const achievements = [
  {
    icon: Users,
    title: "Extensive Client Base",
    detail: "Izy-Tech has successfully completed thousands of solar installations, serving a diverse range of clients from homeowners to large enterprises across Nigeria.",
  },
  {
    icon: Leaf,
    title: "Sustainability Leadership",
    detail: "We are actively involved in local and global sustainability initiatives, advocating for solar energy and contributing to environmental conservation efforts.",
  },
  {
    icon: Award,
    title: "Industry Recognition",
    detail: "Our commitment to quality and innovation has garnered several awards and accolades within the renewable energy sector, affirming our status as a leader in solar technology.",
  },
  {
    icon: Heart,
    title: "Community Engagement",
    detail: "We engage in educational programmes and outreach initiatives that promote awareness of solar energy — fostering a culture of sustainability and inspiring others to join the movement.",
  },
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
              About IZY Tech<br />Global Services
            </h1>
            <p className="text-white/50 max-w-lg text-base leading-relaxed mb-8" style={{ fontFamily: "var(--font-body)" }}>
              Illuminating the future of solar energy. Established March 8, 2018 — powering homes, businesses and industries across Nigeria.
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

      {/* ── Overview ──────────────────────────────────────── */}
      <div className="py-24" style={{ background: "#051d30" }}>
        <div className="max-w-7xl mx-auto px-6 lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Overview
              </span>
            </div>
            <h2
              className="text-white mb-6"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1 }}
            >
              A Leader in Sustainable Energy Solutions
            </h2>
            <p className="text-white/55 leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)", fontSize: "1rem" }}>
              Since its inception in 2018, Izy-Tech Global Services Limited has emerged as a leader in the solar energy sector, dedicated to providing innovative and sustainable energy solutions. With a strong commitment to excellence and customer satisfaction, Izy-Tech has been transforming the way individuals and businesses harness solar power for a cleaner and more sustainable future.
            </p>
            <p className="text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem" }}>
              Founded by Israel Ideozu in Port Harcourt, Rivers State, we have grown from a small team of enthusiasts into Nigeria's trusted partner for solar energy, CCTV, smart home automation, and industrial electrical solutions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 lg:mt-0 grid grid-cols-2 gap-4"
          >
            {[
              { icon: Zap,    label: "Solar Energy",         sub: "Residential & commercial" },
              { icon: Shield, label: "CCTV & Security",      sub: "Smart surveillance systems" },
              { icon: Target, label: "Smart Home",           sub: "Automation & integration" },
              { icon: Globe,  label: "Industrial Wiring",    sub: "Power distribution" },
            ].map(({ icon: Icon, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="p-5 border"
                style={{ borderColor: "rgba(240,162,14,0.18)", background: "rgba(240,162,14,0.04)" }}
              >
                <div className="w-9 h-9 flex items-center justify-center rounded mb-3" style={{ background: "rgba(240,162,14,0.12)" }}>
                  <Icon size={17} style={{ color: "#F0A20E" }} />
                </div>
                <div className="text-white font-bold text-sm mb-0.5" style={{ fontFamily: "var(--font-display)" }}>{label}</div>
                <div className="text-white/35 text-xs" style={{ fontFamily: "var(--font-ui)" }}>{sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Mission ───────────────────────────────────────── */}
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
                text: "Our mission at Izy-Tech Global Services Limited is to empower communities through accessible and reliable solar energy solutions. We aim to reduce dependence on fossil fuels, promote environmental stewardship, and enhance energy independence for our clients.",
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

      {/* ── Our Journey ───────────────────────────────────── */}
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
              Starting Small, Growing Strong
            </h2>
            <p className="text-[#041627]/50 mt-3 max-w-xl text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Starting as a small team of solar enthusiasts, Izy-Tech quickly established itself in the industry by focusing on high-quality installations and exceptional customer service.
            </p>
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

      {/* ── Achievements ──────────────────────────────────── */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-14 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Achievements
              </span>
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
            </div>
            <h2
              className="text-[#041627]"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              What We've Built Together
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {achievements.map(({ icon: Icon, title, detail }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="p-8 border border-gray-100 hover:border-[#F0A20E]/30 hover:shadow-sm transition-all"
                style={{ borderTopColor: "#F0A20E", borderTopWidth: 3 }}
              >
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5" style={{ background: "rgba(240,162,14,0.08)" }}>
                  <Icon size={20} style={{ color: "#F0A20E" }} />
                </div>
                <h3 className="font-bold text-[#041627] mb-3" style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", letterSpacing: "-0.015em" }}>
                  {title}
                </h3>
                <p className="text-[#041627]/55 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Looking Ahead ─────────────────────────────────── */}
      <div className="py-24" style={{ background: "#041627" }}>
        <div className="max-w-7xl mx-auto px-6 lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Looking Ahead
              </span>
            </div>
            <h2
              className="text-white mb-6"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1 }}
            >
              A Greener, Brighter Future for All
            </h2>
            <p className="text-white/55 leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)", fontSize: "1rem" }}>
              As we look to the future, Izy-Tech Global Services Limited remains committed to innovation and excellence. We are dedicated to researching and developing new technologies that will make solar energy even more efficient and accessible.
            </p>
            <p className="text-white/40 leading-relaxed mb-10" style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem" }}>
              Our focus on sustainability and customer satisfaction will continue to drive our efforts as we work toward a greener, brighter future for all. Join us in making a positive impact on our planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
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

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-14 lg:mt-0"
          >
            <div
              className="p-8 border"
              style={{ borderColor: "rgba(240,162,14,0.2)", background: "rgba(240,162,14,0.04)" }}
            >
              <div className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Contact Us
              </div>
              {[
                { label: "Email",     value: "info@izytechglobalservices.com", href: "mailto:info@izytechglobalservices.com" },
                { label: "Phone",     value: "0810 126 2814",                  href: "tel:08101262814" },
                { label: "Facebook",  value: "Izy Technologies Global Services Limited", href: "https://facebook.com" },
                { label: "Instagram", value: "@izytechservices",               href: "https://instagram.com/izytechservices" },
                { label: "Location",  value: "Port Harcourt, Rivers State, Nigeria", href: null },
              ].map(({ label, value, href }) => (
                <div key={label} className="flex gap-4 mb-5 last:mb-0">
                  <div className="text-xs font-semibold w-24 shrink-0 pt-0.5" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                    {label}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      className="text-white/60 text-sm hover:text-white/90 transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="text-white/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>{value}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

    </PageLayout>
  );
}
