import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const leaders = [
  {
    name: "Israel Ideozu",
    role: "Chief Executive Officer",
    note: "Founder",
    image: "/images/leadership/Israel%20Ideozu%20%E2%80%94%20CEO..png",
  },
  {
    name: "Da-iyiboba Dokubo",
    role: "Chief Operating Officer",
    note: "",
    image: "/images/leadership/Da-iyiboba%20Dokubo%20%E2%80%94%20COO.png",
  },
  {
    name: "Barisi Inayor",
    role: "HR Manager",
    note: "",
    image: "/images/leadership/Barisi%20Inayor%20%E2%80%94%20HR%20Manager.png",
  },
  {
    name: "Itekena Iyowuna",
    role: "IT Manager",
    note: "",
    image: "/images/leadership/Itekena%20Iyowuna%20%E2%80%94%20IT%20Manager.png",
  },
];

const SLIDE_DURATION = 6500;

export function Leadership() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const leader = leaders[activeIndex];

  const goTo = (index: number) => {
    setActiveIndex((index + leaders.length) % leaders.length);
  };

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % leaders.length);
    }, SLIDE_DURATION);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  return (
    <section
      id="leadership"
      aria-labelledby="home-leadership-heading"
      className="overflow-hidden bg-[#f5f6f8] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-6 bg-[#F0A20E]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F0A20E]" style={{ fontFamily: "var(--font-ui)" }}>
              The People Behind The Progress
            </span>
          </div>

          <h2
            id="home-leadership-heading"
            className="max-w-xl text-[#041627]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.1rem, 4.2vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          >
            Leadership that moves us forward.
          </h2>

          <div className="mt-7 max-w-xl space-y-4 text-[0.95rem] leading-relaxed text-[#64748b]" style={{ fontFamily: "var(--font-body)" }}>
            <p>
              Great work starts with people who know their craft and care about the outcome. Our leadership team brings together the experience, direction and dedication behind every solution we deliver.
            </p>
            <p>
              From setting the vision to keeping operations sharp and supporting the people who make it happen, each leader plays a part in moving IZY Technologies forward.
            </p>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="btn-shimmer inline-flex items-center gap-2.5 bg-gradient-to-r from-[#F0A20E] to-[#FFB830] px-7 py-3.5 text-sm font-bold tracking-wide text-[#041627] transition-transform hover:scale-[1.02]"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              WORK WITH OUR TEAM <ArrowRight size={15} />
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-2 border border-[#041627]/15 px-7 py-3.5 text-sm font-semibold text-[#041627] transition-colors hover:border-[#F0A20E] hover:text-[#b97900]"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              EXPLORE OUR SERVICES <ArrowRight size={14} />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="mx-auto w-full max-w-[470px] lg:ml-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
          }}
        >
          <div className="overflow-hidden border border-[#041627]/[0.07] bg-white shadow-[0_18px_55px_rgba(4,22,39,0.08)]">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e8edf1]" aria-roledescription="carousel" aria-label="IZY Technologies leadership">
              <AnimatePresence initial={false} mode="sync">
                <motion.img
                  key={leader.name}
                  src={leader.image}
                  alt={leader.name}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    objectPosition: activeIndex === 0 ? "center 33.8%" : activeIndex === 1 ? "center top" : "center center",
                    ...(activeIndex === 2 ? { transform: "scale(1.08) translate(-5px, -7px)", transformOrigin: "center center" } : {}),
                    ...(activeIndex === 3 ? { transform: "scale(1.3) translateY(-9.23px)", transformOrigin: "center top" } : {}),
                  }}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 38 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: [1, 0.88, 0], x: [0, 12, -42] }}
                  transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#041627]/35 to-transparent" />
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                {leaders.map((item, index) => (
                  <span
                    key={item.name}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? "w-7 bg-[#F0A20E]" : "w-1.5 bg-white/65"}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex min-h-[112px] items-center justify-between gap-4 px-5 py-5 sm:px-7">
              <div className="min-w-0">
                {leader.note && (
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F0A20E]" style={{ fontFamily: "var(--font-ui)" }}>
                    {leader.note}
                  </p>
                )}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={leader.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: reduceMotion ? 0 : 0.25 }}
                  >
                    <h3 className="truncate text-lg font-bold text-[#041627]" style={{ fontFamily: "var(--font-display)" }}>{leader.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#64748b]" style={{ fontFamily: "var(--font-ui)" }}>{leader.role}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  aria-label="Previous leader"
                  className="flex h-9 w-9 items-center justify-center border border-[#041627]/15 text-[#041627] transition-colors hover:border-[#F0A20E] hover:bg-[#F0A20E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0A20E]"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  aria-label="Next leader"
                  className="flex h-9 w-9 items-center justify-center border border-[#041627]/15 text-[#041627] transition-colors hover:border-[#F0A20E] hover:bg-[#F0A20E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0A20E]"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[#041627]/35" style={{ fontFamily: "var(--font-ui)" }}>
            {String(activeIndex + 1).padStart(2, "0")} <span className="mx-1 text-[#F0A20E]">/</span> {String(leaders.length).padStart(2, "0")} · MEET THE LEADERS
          </p>
        </motion.div>
      </div>
    </section>
  );
}
