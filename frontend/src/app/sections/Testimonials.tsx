import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const testimonials = [
  {
    name: "Emeka Okonkwo",
    role: "Factory Manager",
    company: "PrecisionPack Industries, Aba",
    text: "IZY Technologies transformed our factory's electrical system. The industrial wiring and CCTV installation was completed on time and within budget. Our energy costs dropped by 60% after they added the solar component. Absolutely world-class service.",
    rating: 5,
    avatar: "EO",
    metric: "60% energy cost reduction",
  },
  {
    name: "Dr. Amara Nwosu",
    role: "Hospital Administrator",
    company: "Grace Medical Centre, Abuja",
    text: "The electrical overhaul they carried out for our hospital was exceptional. Every detail was thought through — backup systems, UPS integration, clean installation. We've had zero power issues since the upgrade. Highly recommend.",
    rating: 5,
    avatar: "AN",
    metric: "Zero downtime since upgrade",
  },
  {
    name: "Chidi Adeyemi",
    role: "Property Developer",
    company: "Lekki Luxury Estates",
    text: "We contracted IZY Technologies for smart home automation across 20 luxury units. The results exceeded client expectations — from lighting scenes to integrated security, everything just works. Our buyers love it.",
    rating: 5,
    avatar: "CA",
    metric: "20 luxury units automated",
  },
  {
    name: "Mrs. Funke Bello",
    role: "School Principal",
    company: "Sunshine Academy, Port Harcourt",
    text: "The solar installation has been a game changer for our school. We used to lose 4-5 hours daily to NEPA issues. Now we run all day on solar. The team was professional, fast and very tidy in their work.",
    rating: 5,
    avatar: "FB",
    metric: "Full-day solar independence",
  },
  {
    name: "Tunde Afolabi",
    role: "CEO",
    company: "Meridian Hotels, Victoria Island",
    text: "Our hotel security was a headache before IZY took over. After their complete CCTV and access control overhaul, we can monitor the entire property from one screen, on our phones, anywhere. Outstanding work.",
    rating: 5,
    avatar: "TA",
    metric: "Full property remote access",
  },
];

export function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (newIdx: number) => {
    setDir(newIdx > idx ? 1 : -1);
    setIdx(newIdx);
  };
  const prev = () => go(idx === 0 ? testimonials.length - 1 : idx - 1);
  const next = () => go(idx === testimonials.length - 1 ? 0 : idx + 1);

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setIdx((i) => (i === testimonials.length - 1 ? 0 : i + 1));
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const t = testimonials[idx];

  return (
    <section id="testimonials" className="py-28 overflow-hidden" style={{ background: "#041627" }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}>
                Client Stories
              </span>
            </div>
            <h2
              className="text-white"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.9rem, 4vw, 2.9rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
              }}
            >
              Trusted Across Nigeria
            </h2>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="w-11 h-11 border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-white/25 text-sm font-mono" style={{ fontFamily: "var(--font-ui)" }}>
              {String(idx + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
            <button
              onClick={next}
              className="w-11 h-11 border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Main testimonial */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Large active card */}
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
                className="relative p-10 border border-white/8 h-full"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                {/* Big quote mark */}
                <div
                  className="absolute top-6 right-8 text-white/5 select-none pointer-events-none leading-none"
                  style={{ fontFamily: "var(--font-display)", fontSize: "8rem", fontWeight: 900, lineHeight: 0.8 }}
                >
                  "
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#F0A20E" style={{ color: "#F0A20E" }} />
                  ))}
                </div>

                {/* Metric badge */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 mb-7 text-[#041627] text-xs font-bold tracking-wider"
                  style={{ background: "#F0A20E", fontFamily: "var(--font-ui)" }}
                >
                  ✦ {t.metric}
                </div>

                {/* Quote */}
                <blockquote
                  className="text-white/70 text-lg leading-relaxed mb-10"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  "{t.text}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(240,162,14,0.25)", fontFamily: "var(--font-display)" }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                      {t.name}
                    </div>
                    <div className="text-white/35 text-xs mt-0.5" style={{ fontFamily: "var(--font-ui)" }}>
                      {t.role} · {t.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Side previews */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {testimonials.map((item, i) => (
              <motion.button
                key={i}
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

        {/* Progress bar */}
        <div className="mt-10 h-px bg-white/8 relative overflow-hidden">
          <motion.div
            key={idx}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute top-0 left-0 h-full"
            style={{ background: "#F0A20E" }}
          />
        </div>
      </div>
    </section>
  );
}
