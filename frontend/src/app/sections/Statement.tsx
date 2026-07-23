import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative overflow-hidden py-0">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY }}>
        <img
          src="https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1920&h=900&fit=crop&auto=format"
          alt=""
          className="w-full h-[120%] object-cover object-center -mt-[10%]"
        />
        <div className="absolute inset-0" style={{ background: "rgba(4,22,39,0.90)" }} />
      </motion.div>

      {/* Large decorative text */}
      <div
        className="absolute top-0 right-0 text-white/[0.025] select-none pointer-events-none leading-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(8rem, 20vw, 20rem)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
        }}
      >
        IZY
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-28 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Giant quote mark */}
            <div
              className="mb-4 leading-none select-none"
              style={{ fontFamily: "var(--font-display)", fontSize: "6rem", fontWeight: 900, color: "#F0A20E", lineHeight: 0.8 }}
            >
              "
            </div>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                Our Mission
              </span>
            </div>
            <h2
              className="text-white leading-[1.05]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
              }}
            >
              We Don't Just Install Technology.
              <br />
              <span style={{ color: "#F0A20E" }}>We Change How Nigeria Powers Itself.</span>
            </h2>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <p className="text-white/55 text-lg leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Every solar panel we install reduces dependence on an unstable grid. Every smart home we wire gives a family back hours of lost productivity. Every security system we deploy protects a livelihood.
            </p>
            <p className="text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              This is not just business — it's infrastructure for a better Nigeria, built one project at a time.
            </p>

            {/* Divider stats */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
              {[{ v: "1000+", l: "Projects Delivered" }, { v: "36", l: "States Covered" }].map(({ v, l }) => (
                <div key={l}>
                  <div
                    className="text-white mb-0.5"
                    style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}
                  >
                    {v}
                  </div>
                  <div className="text-white/35 text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-ui)" }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#about"
              className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
              style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
            >
              Learn About Us <ArrowRight size={14} strokeWidth={2.5} />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
