import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useSearchParams } from "react-router";
import { InverterCalculator } from "../components/InverterCalculator";

const stats = [
  { value: 1000, suffix: "+", label: "Installations" },
  { value: 8,    suffix: "+", label: "Years of Excellence" },
  { value: 98,   suffix: "%", label: "Client Satisfaction" },
  { value: 24,   suffix: "/7", label: "Support Available" },
];

const SLIDE_DURATION_MS = 5000;
const SLIDE_DURATION_SECONDS = SLIDE_DURATION_MS / 1000;

const slides = [
  {
    id: "energy",
    eyebrow: "Nigeria's Premier Energy Solutions Provider",
    titleLines: [["Power", "the", "Future,"], ["Future-Ready", "Solutions,", "Today"]],
    accent: "Today",
    description: "From solar energy systems to smart homes and industrial wiring — IZY Technologies delivers cutting-edge solutions across Nigeria and beyond.",
    primaryLabel: "START A PROJECT ENQUIRY",
    secondaryLabel: "OUR SERVICES",
    secondaryHref: "#services",
    background: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=1920&h=1080&fit=crop&auto=format",
    overlay: "linear-gradient(100deg, rgba(4,22,39,0.95) 0%, rgba(4,22,39,0.80) 45%, rgba(4,22,39,0.38) 100%)",
  },
  {
    id: "finance",
    eyebrow: "IZY × ALTPower BY THE ALTERNATIVE BANK",
    titleLines: [["Pay", "Small", "Small."], ["Power", "Big."]],
    accent: "Big.",
    description: "Our partnership gives eligible IZY customers a smarter way to fund approved power projects: apply through AltPower for deferred-payment financing, then repay in manageable instalments.",
    primaryLabel: "CALCULATE YOUR INVERTER NEEDS",
    secondaryLabel: "START YOUR APPLICATION",
    secondaryHref: "#contact",
    background: "/site-images/project-commercial-solar.jpg",
    overlay: "linear-gradient(100deg, rgba(4,22,39,0.96) 0%, rgba(4,22,39,0.86) 44%, rgba(7,49,38,0.54) 100%)",
    highlights: [
      ["20%", "minimum deposit*"],
      ["48 mo", "maximum tenor*"],
      ["Nationwide", "availability*"],
    ],
  },
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

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(SLIDE_DURATION_SECONDS);
  const reducedMotion = useReducedMotion();
  const slide = slides[activeSlide];

  const handleProjectEnquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    if (searchParams.get("service")) {
      setSearchParams({}, { replace: true });
    }
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const goToSlide = (index: number) => {
    setSecondsRemaining(SLIDE_DURATION_SECONDS);
    setActiveSlide((index + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return;
    setSecondsRemaining(SLIDE_DURATION_SECONDS);
    const slideTimer = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % slides.length);
      setSecondsRemaining(SLIDE_DURATION_SECONDS);
    }, SLIDE_DURATION_MS);
    const countdownTimer = window.setInterval(() => {
      setSecondsRemaining(current => Math.max(1, current - 1));
    }, 1000);
    return () => {
      window.clearInterval(slideTimer);
      window.clearInterval(countdownTimer);
    };
  }, [isPaused]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="home"
      aria-roledescription="carousel"
      aria-label="IZY Technologies featured messages"
      className="relative min-h-screen flex flex-col overflow-hidden"
      onFocus={event => {
        if (event.currentTarget === event.target || !event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(true);
        }
      }}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      {/* Parallax background */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.65, ease: "easeInOut" }}
          className="absolute inset-0 will-change-transform"
          style={{ y: bgY }}
        >
          <img
            src={slide.background}
            alt=""
            className="w-full h-full object-cover object-center scale-110"
            loading={activeSlide === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0" style={{ background: slide.overlay }} />
          <div
            className="absolute bottom-0 left-0 right-0 h-40"
            style={{ background: "linear-gradient(to top, rgba(4,22,39,0.88), transparent)" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Slide controls */}
      <div className="absolute right-6 top-28 z-20 flex items-center gap-2 sm:right-10">
        <button
          type="button"
          onClick={() => setIsPaused(current => !current)}
          className="flex h-9 w-9 items-center justify-center border border-white/25 text-white/70 transition-colors hover:border-white/60 hover:text-white"
          aria-label={isPaused ? "Resume hero slideshow" : "Pause hero slideshow"}
        >
          {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 sm:inline" aria-live="polite">
            {isPaused ? "Paused" : `Next in ${secondsRemaining}s`}
          </span>
          <div className="flex items-center gap-1.5">
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeSlide === index}
              aria-label={`Show ${item.id === "finance" ? "AltPower partnership" : "energy solutions"} slide`}
              onClick={() => goToSlide(index)}
              className={`relative h-1.5 overflow-hidden transition-all ${activeSlide === index ? "w-8 bg-white/25" : "w-4 bg-white/35 hover:bg-white/70"}`}
            >
              {activeSlide === index && (
                <span
                  aria-hidden="true"
                  className="hero-slide-progress absolute inset-0 bg-[#F0A20E]"
                  style={{
                    animationDuration: `${SLIDE_DURATION_MS}ms`,
                    animationPlayState: isPaused ? "paused" : "running",
                  }}
                />
              )}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div className="relative flex-1 flex flex-col" style={{ opacity }}>
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 flex items-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -16 }}
              transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl pt-36 pb-24 lg:pt-20 lg:pb-8"
              role="tabpanel"
              aria-label={slide.id === "finance" ? "AltPower partnership" : "Energy solutions"}
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-px" style={{ background: slide.id === "finance" ? "#4BC47A" : "#F0A20E" }} />
                <span
                  className="text-xs font-semibold tracking-[0.2em] uppercase"
                  style={{ fontFamily: "var(--font-ui)", color: slide.id === "finance" ? "#71D897" : "#F0A20E" }}
                >
                  {slide.eyebrow}
                </span>
              </div>

              {slide.id === "finance" && (
                <div className="mb-5 inline-flex items-center gap-3 border border-[#4BC47A]/35 bg-[#0b5d3a]/30 px-3 py-2">
                  <span className="text-lg font-semibold tracking-[-0.04em] text-[#68D58E]" style={{ fontFamily: "var(--font-display)" }}>
                    alt<span className="text-white">power</span>
                  </span>
                  <span className="text-white/35">×</span>
                  <span className="text-xs font-bold tracking-[0.15em] text-white/85" style={{ fontFamily: "var(--font-ui)" }}>IZY</span>
                  <span className="hidden text-[10px] uppercase tracking-wider text-white/45 sm:inline">Powering access</span>
                </div>
              )}

              <h1
                className="text-white mb-4 leading-[1.04]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.7rem, 6.5vw, 5.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                {slide.titleLines.map((line, lineIndex) => (
                  <span className="block" key={`${slide.id}-${lineIndex}`}>
                    {line.map((word, wordIndex) => (
                      <motion.span
                        key={word}
                        initial={{ opacity: 0, y: reducedMotion ? 0 : 34, skewY: reducedMotion ? 0 : 4 }}
                        animate={{ opacity: 1, y: 0, skewY: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.08 + wordIndex * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-block mr-[0.2em]"
                        style={{ color: word === slide.accent ? "#F0A20E" : undefined }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.45 }}
                className="text-white/60 text-lg leading-relaxed max-w-2xl mb-8"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {slide.description}
              </motion.p>

              <div className="flex flex-wrap gap-3">
                {slide.id === "finance" ? (
                  <button
                    type="button"
                    onClick={() => setCalculatorOpen(true)}
                    aria-haspopup="dialog"
                    className="btn-shimmer inline-flex items-center gap-3 px-7 py-3.5 font-bold text-[#041627] transition-all hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(75,196,122,0.35)] text-sm tracking-wider"
                    style={{ fontFamily: "var(--font-ui)", background: "linear-gradient(135deg, #4BC47A 0%, #8BE0A8 100%)", letterSpacing: "0.06em" }}
                  >
                    {slide.primaryLabel} <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                ) : (
                  <a
                    href="#contact"
                    onClick={handleProjectEnquiry}
                    className="btn-shimmer inline-flex items-center gap-3 px-9 py-4 font-bold text-[#041627] transition-all hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(240,162,14,0.45)] text-sm tracking-wider"
                    style={{ fontFamily: "var(--font-ui)", background: "linear-gradient(135deg, #F0A20E 0%, #FFB830 100%)", letterSpacing: "0.08em" }}
                  >
                    {slide.primaryLabel} <ArrowRight size={15} strokeWidth={2.5} />
                  </a>
                )}
                <a
                  href={slide.secondaryHref}
                  onClick={slide.id === "finance" ? handleProjectEnquiry : undefined}
                  className="inline-flex items-center gap-3 px-7 py-3.5 font-semibold text-white border border-white/25 hover:border-white/55 hover:bg-white/8 transition-all text-sm tracking-wider"
                  style={{ fontFamily: "var(--font-ui)", letterSpacing: "0.07em" }}
                >
                  {slide.secondaryLabel} <ArrowRight size={14} />
                </a>
              </div>

              {slide.highlights && (
                <>
                  <div className="mt-9 grid max-w-xl grid-cols-3 divide-x divide-white/15 border-y border-white/15">
                    {slide.highlights.map(([value, label]) => (
                      <div key={label} className="py-4 pr-3 first:pl-0 first:pr-3 sm:px-4">
                        <div className="text-lg font-bold text-white sm:text-xl" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
                        <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/45 sm:text-[10px]" style={{ fontFamily: "var(--font-ui)" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 max-w-xl text-[10px] leading-relaxed text-white/35" style={{ fontFamily: "var(--font-body)" }}>
                    * AltPower&apos;s published payment information. Approval, deposit, tenor, system cost and repayment terms are subject to eligibility and applicable terms from AltPower / The Alternative Bank.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stats bar */}
        <div
          className="relative border-t border-white/10"
          style={{ background: "rgba(4,22,39,0.72)", backdropFilter: "blur(16px)" }}
        >
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, index) => (
              <AnimatedStat key={stat.label} {...stat} delay={0.45 + index * 0.08} />
            ))}
          </div>
        </div>
      </motion.div>
      <InverterCalculator open={calculatorOpen} onOpenChange={setCalculatorOpen} />
    </section>
  );
}