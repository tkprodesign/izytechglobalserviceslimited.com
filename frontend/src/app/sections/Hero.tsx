import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

const stats = [
  { value: 500, suffix: "+", label: "Projects Completed" },
  { value: 12, suffix: "+", label: "Years Experience" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
  { value: 24, suffix: "/7", label: "Support Available" },
];

function AnimatedStat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="py-7 px-8 first:pl-0"
    >
      <div
        className="text-white mb-1"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.2rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}{suffix}
      </div>
      <div className="text-white/40 text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)" }}>
        {label}
      </div>
    </motion.div>
  );
}

const words = ["Power", "The", "Future."];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="home" className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY }}>
        <img
          src="/site-images/hero-bg.jpg"
          alt="IZY Technologies team installing solar panels"
          className="w-full h-full object-cover object-center scale-110"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(4,22,39,0.95) 0%, rgba(4,22,39,0.80) 45%, rgba(4,22,39,0.38) 100%)",
          }}
        />
        {/* Bottom fade for stats bar */}
        <div className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: "linear-gradient(to top, rgba(4,22,39,0.85), transparent)" }} />
      </motion.div>

      {/* Content */}
      <motion.div className="relative flex-1 flex flex-col" style={{ opacity }}>
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 flex items-center">
          <div className="max-w-2xl pt-36 pb-20 lg:pt-0 lg:pb-0">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-[0.22em] uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                Nigeria's Premier Energy Solutions Provider
              </span>
            </motion.div>

            {/* Headline — word by word */}
            <h1
              className="text-white mb-3 leading-[1.0]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3.2rem, 7.5vw, 6rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 40, skewY: 4 }}
                  animate={{ opacity: 1, y: 0, skewY: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block mr-[0.22em]"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, y: 40, skewY: 4 }}
                animate={{ opacity: 1, y: 0, skewY: 0 }}
                transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
                style={{ color: "#F0A20E" }}
              >
                Today.
              </motion.span>
            </h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="text-white/55 text-lg leading-relaxed max-w-xl mb-10"
              style={{ fontFamily: "var(--font-body)" }}
            >
              From solar energy systems to smart homes and industrial wiring — Izy Technologies delivers cutting-edge solutions across Nigeria and beyond.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#contact"
                className="btn-shimmer inline-flex items-center gap-3 px-9 py-4 font-bold text-[#041627] transition-all hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(240,162,14,0.45)] text-sm tracking-wider"
                style={{
                  fontFamily: "var(--font-ui)",
                  background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)",
                  letterSpacing: "0.08em",
                }}
              >
                GET A FREE QUOTE
                <ArrowRight size={15} strokeWidth={2.5} />
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-3 px-9 py-4 font-semibold text-white border border-white/25 hover:border-white/50 hover:bg-white/8 transition-all text-sm tracking-wider"
                style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.08em" }}
              >
                OUR SERVICES
              </a>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="relative border-t border-white/10"
          style={{ background: "rgba(4,22,39,0.72)", backdropFilter: "blur(16px)" }}
        >
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {stats.map((s, i) => (
              <AnimatedStat key={s.label} {...s} delay={0.8 + i * 0.1} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
