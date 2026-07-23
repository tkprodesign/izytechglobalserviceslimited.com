import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router";
import { api, type Project } from "../../lib/api";

/* ── Skeleton placeholders shown while data loads ── */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ background: "#e2e8f0" }}
    />
  );
}

function FeaturedSkeleton() {
  return (
    <div className="mb-5 overflow-hidden bg-[#041627]">
      <div className="grid lg:grid-cols-2">
        <Skeleton className="h-64 lg:min-h-[440px] rounded-none" />
        <div className="p-8 lg:p-14 flex flex-col justify-center gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-40 mt-4" />
          <Skeleton className="h-4 w-20 mt-2" />
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white overflow-hidden border border-[#e8edf3]">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-5 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects()
      .then(res => setProjects(res.data ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  /* Pick the first featured+published project as the hero; rest fill the grid */
  const featured = projects.find(p => p.featured && p.published) ?? projects.find(p => p.published) ?? null;
  const rest = projects.filter(p => p.published && p !== featured).slice(0, 5);

  const featuredImage = featured?.main_image_url || featured?.images?.[0] || "";

  return (
    <section id="projects" className="py-28" style={{ background: "#f5f6f8" }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
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

        {/* ── Featured card ── */}
        {loading ? (
          <FeaturedSkeleton />
        ) : featured ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="group relative mb-5 overflow-hidden bg-[#041627] cursor-pointer"
          >
            <Link to={`/projects/${featured.slug}`} className="grid lg:grid-cols-2" data-testid="link-featured-project">
              {/* Image */}
              <div className="relative h-64 lg:h-auto lg:min-h-[440px] overflow-hidden">
                {featuredImage ? (
                  <img
                    src={featuredImage}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: "#0a2540" }} />
                )}
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
                  {featured.short_description || featured.full_description}
                </p>

                {/* Metric highlight */}
                {featured.result_metric && (
                  <div
                    className="inline-flex items-center gap-3 px-4 py-3 mb-8 self-start"
                    style={{ background: "rgba(240,162,14,0.1)", borderLeft: "3px solid #F0A20E" }}
                  >
                    <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "#F0A20E" }}>
                      {featured.result_metric}
                    </span>
                  </div>
                )}

                {featured.location && (
                  <div className="flex items-center gap-2 text-white/30 text-xs mb-8" style={{ fontFamily: "var(--font-ui)" }}>
                    <MapPin size={11} /> {featured.location}
                  </div>
                )}

                <span
                  className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all self-start"
                  style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
                >
                  View Project Details <ArrowRight size={14} strokeWidth={2.5} />
                </span>
              </div>
            </Link>
          </motion.div>
        ) : null}

        {/* ── Grid cards ── */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : rest.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {rest.map((project, i) => {
              const cardImage = project.main_image_url || project.images?.[0] || "";
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5 }}
                  className="group bg-white overflow-hidden border border-[#e8edf3] hover:border-[#F0A20E]/20 hover:shadow-xl hover:shadow-black/8 transition-all duration-400"
                >
                  <Link to={`/projects/${project.slug}`} className="block">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-[#f5f6f8]">
                      {cardImage ? (
                        <img
                          src={cardImage}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ background: "#e8edf3" }} />
                      )}
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
                      {/* Category badge */}
                      <div
                        className="absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase px-2 py-1 text-white/80"
                        style={{ background: "rgba(4,22,39,0.55)", fontFamily: "var(--font-ui)", backdropFilter: "blur(4px)" }}
                      >
                        {project.category}
                      </div>
                      {project.location && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/60 text-[10px] group-hover:opacity-0 transition-opacity" style={{ fontFamily: "var(--font-ui)" }}>
                          <MapPin size={9} /> {project.location}
                        </div>
                      )}
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
                        {project.short_description || project.full_description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : null}

        {/* ── Bottom CTA ── */}
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
