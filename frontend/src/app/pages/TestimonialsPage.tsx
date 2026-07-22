import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { PageLayout } from "../components/PageLayout";
import { api, type Testimonial } from "@/lib/api";

const FALLBACK: Testimonial[] = [
  {
    id: 1,
    name: "Emeka Okafor",
    role: "Managing Director",
    company: "TransAmadi Manufacturing Ltd",
    text: "IZY Technologies installed our 150kW solar system and the results have been extraordinary. Our electricity bills dropped by 78% in the first month alone. The team was professional, punctual and the installation quality is exceptional.",
    rating: 5,
    avatar: "EO",
    metric: "78% bill reduction",
  },
  {
    id: 2,
    name: "Adaeze Nwosu",
    role: "CEO",
    company: "Greenleaf Schools Group",
    text: "We hired IZY to power our school with solar and upgrade our entire IT infrastructure. They delivered on time and on budget. 40 classrooms, our computer labs and the admin block now run 24/7 without a single interruption.",
    rating: 5,
    avatar: "AN",
    metric: "40 classrooms powered",
  },
  {
    id: 3,
    name: "Tunde Fashola",
    role: "Facilities Manager",
    company: "Premier Heights Hotel",
    text: "The CCTV and smart security system IZY installed across our hotel has transformed how we manage safety. 128 cameras, smart locks, all controlled from one dashboard. Truly world-class work.",
    rating: 5,
    avatar: "TF",
    metric: "Full remote access",
  },
  {
    id: 4,
    name: "Dr. Ngozi Adeyemi",
    role: "Hospital Director",
    company: "Medcare Hospital, Abuja",
    text: "After IZY's electrical overhaul our hospital has had zero downtime. The UPS systems, distribution boards and transfer switches they installed have been flawless. We trust them completely with critical infrastructure.",
    rating: 5,
    avatar: "NA",
    metric: "Zero downtime",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} fill="#F0A20E" style={{ color: "#F0A20E" }} />
      ))}
    </div>
  );
}

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    api
      .testimonials()
      .then(({ data }) => { if (data.length > 0) setTestimonials(data); })
      .catch(() => {/* keep fallback */});
  }, []);

  const go = (newIdx: number) => {
    setDir(newIdx > idx ? 1 : -1);
    setIdx(newIdx);
  };
  const prev = () => go(idx === 0 ? testimonials.length - 1 : idx - 1);
  const next = () => go(idx === testimonials.length - 1 ? 0 : idx + 1);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setIdx((i) => (i === testimonials.length - 1 ? 0 : i + 1));
    }, 7000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const active = testimonials[idx];

  return (
    <PageLayout>
      {/* ── Hero ── */}
      <div className="pt-20 relative overflow-hidden" style={{ background: "#041627" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 60% 50%, rgba(240,162,14,0.07) 0%, transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Client Stories
              </span>
            </div>
            <h1
              className="text-white mb-5"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              Trusted Across Nigeria
            </h1>
            <p className="text-white/45 max-w-xl text-base leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Hear from the homes, businesses and institutions we've powered — from rooftop solar to full industrial overhauls.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ background: "#F0A20E" }}>
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-3 gap-6 text-center">
          {[
            { value: "500+", label: "Projects Completed" },
            { value: "98%", label: "Client Satisfaction" },
            { value: "12+", label: "Years of Excellence" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-[#041627] font-black text-2xl lg:text-3xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
                {value}
              </div>
              <div className="text-[#041627]/60 text-xs font-semibold uppercase tracking-widest mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured testimonial carousel ── */}
      <div className="py-20" style={{ background: "#041627" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Controls */}
          <div className="flex items-center justify-between mb-12">
            <Quote size={36} style={{ color: "rgba(240,162,14,0.2)" }} />
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="text-white/25 text-sm font-mono tabular-nums" style={{ fontFamily: "var(--font-ui)" }}>
                {String(idx + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </span>
              <button
                onClick={next}
                className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main card */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={idx}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                    center: { opacity: 1, x: 0 },
                    exit: (d: number) => ({ opacity: 0, x: d * -40 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative p-10 border border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)", minHeight: 320 }}
                >
                  {/* Decorative quote */}
                  <div
                    className="absolute top-4 right-6 text-white/5 select-none pointer-events-none"
                    style={{ fontFamily: "var(--font-display)", fontSize: "9rem", fontWeight: 900, lineHeight: 0.8 }}
                  >
                    "
                  </div>

                  <Stars n={active?.rating ?? 5} />

                  {active?.metric && (
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 mt-5 mb-7 text-[#041627] text-xs font-bold tracking-wider"
                      style={{ background: "#F0A20E", fontFamily: "var(--font-ui)" }}
                    >
                      ✦ {active.metric}
                    </div>
                  )}

                  {active && (
                    <>
                      <blockquote
                        className="text-white/70 text-lg leading-relaxed mb-10"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        "{active.text}"
                      </blockquote>

                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "rgba(240,162,14,0.22)", fontFamily: "var(--font-display)" }}
                        >
                          {active.avatar}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                            {active.name}
                          </div>
                          <div className="text-white/35 text-xs mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
                            {active.role} · {active.company}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="mt-4 h-px bg-white/8 relative overflow-hidden">
                <motion.div
                  key={idx}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 7, ease: "linear" }}
                  className="absolute top-0 left-0 h-full"
                  style={{ background: "#F0A20E" }}
                />
              </div>
            </div>

            {/* Side list */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {testimonials.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => go(i)}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="text-left p-5 border transition-all duration-300"
                  style={{
                    background: i === idx ? "rgba(240,162,14,0.08)" : "rgba(255,255,255,0.02)",
                    borderColor: i === idx ? "rgba(240,162,14,0.4)" : "rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: i === idx ? "rgba(240,162,14,0.3)" : "rgba(255,255,255,0.08)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {item.avatar}
                    </div>
                    <div>
                      <div className="text-white/80 text-xs font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                        {item.name}
                      </div>
                      <div className="text-white/30 text-[10px]" style={{ fontFamily: "var(--font-ui)" }}>
                        {item.company}
                      </div>
                    </div>
                  </div>
                  <p
                    className="text-white/35 text-xs leading-relaxed line-clamp-2"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.text}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── All testimonials grid ── */}
      <div className="py-20" style={{ background: "#f5f6f8" }}>
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
                All Reviews
              </span>
            </div>
            <h2 className="text-[#041627]" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}>
              What Our Clients Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="bg-white p-8 border border-gray-100"
              >
                <Stars n={t.rating} />
                <blockquote
                  className="text-[#041627]/65 text-sm leading-relaxed mt-4 mb-6"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  "{t.text}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: "#041627", fontFamily: "var(--font-display)" }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-[#041627] font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                        {t.name}
                      </div>
                      <div className="text-[#041627]/40 text-xs" style={{ fontFamily: "var(--font-ui)" }}>
                        {t.role} · {t.company}
                      </div>
                    </div>
                  </div>
                  {t.metric && (
                    <span
                      className="text-[10px] font-bold tracking-wide px-2.5 py-1"
                      style={{ background: "rgba(240,162,14,0.12)", color: "#C8971A", fontFamily: "var(--font-ui)" }}
                    >
                      ✦ {t.metric}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="py-20" style={{ background: "#041627" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2
              className="text-white mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              Ready to become our next success story?
            </h2>
            <p className="text-white/40 mb-8 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              Join 500+ satisfied clients across Nigeria. Get your free consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 font-bold text-[#041627] text-sm tracking-wider hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)", fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
              >
                GET A FREE QUOTE
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 font-bold text-white text-sm tracking-wider border border-white/20 hover:border-white/40 transition-colors"
                style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
              >
                VIEW OUR PROJECTS
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
