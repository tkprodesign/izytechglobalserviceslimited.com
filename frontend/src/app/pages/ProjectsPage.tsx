import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Filter, MapPin, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { PageLayout } from "../components/PageLayout";
import { api, Project } from "../../lib/api";

const TAG_COLORS: Record<string, string> = {
  "Solar Energy": "#F0A20E",
  "Solar + IT": "#F59E0B",
  "Smart Home": "#8B5CF6",
  Security: "#3B82F6",
  "Industrial Wiring": "#EF4444",
};

function projectImage(project: Project) {
  return project.main_image_url || project.images?.[0] || "";
}

function imageFallback(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.display = "none";
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden bg-white" data-testid="skeleton-project-card">
      <div className="h-52 animate-pulse bg-[#dfe5ec]" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-24 animate-pulse bg-[#e8edf3]" />
        <div className="h-5 w-4/5 animate-pulse bg-[#e8edf3]" />
        <div className="h-3 w-full animate-pulse bg-[#e8edf3]" />
        <div className="h-3 w-3/4 animate-pulse bg-[#e8edf3]" />
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get("category") || "";
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const result = await api.projects(requestedCategory || undefined);
      setProjects(result.data);
      setCategories(result.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, [requestedCategory]);

  const activeCategory = requestedCategory || "All";

  // Fixed service order — only show chips for categories that have projects
  const SERVICES_ORDER = [
    "Solar Energy",
    "Industrial Wiring",
    "Smart Home",
    "Security",
    "Solar + IT",
    "IT & Tech",
    "General Electrical",
  ];
  const filterOptions = ["All", ...SERVICES_ORDER.filter(s => categories.includes(s))];

  function changeCategory(category: string) {
    if (category === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  }

  return (
    <PageLayout>
      <div className="relative overflow-hidden bg-[#041627] pt-20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url(/site-images/project-site-team2.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-6 bg-[#F0A20E]" />
              <span
                className="text-xs font-semibold uppercase tracking-widest text-[#F0A20E]"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                Our Work
              </span>
            </div>
            <h1
              className="mb-5 text-white"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem,5vw,4rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Projects
            </h1>
            <p
              className="max-w-xl text-base leading-relaxed text-white/45"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Real work. Real results. A selection of projects delivered across Nigeria — from
              rooftop solar to full industrial electrical overhauls.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-[#f5f6f8] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-wrap items-center gap-2" data-testid="project-filters">
            <Filter size={14} className="mr-1 text-gray-400" aria-hidden="true" />
            {filterOptions.map((category) => (
              <button
                key={category}
                type="button"
                data-testid={`filter-projects-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                aria-pressed={activeCategory.toLowerCase() === category.toLowerCase()}
                onClick={() => changeCategory(category)}
                className="border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all"
                style={{
                  fontFamily: "var(--font-ui)",
                  background: activeCategory.toLowerCase() === category.toLowerCase() ? "#041627" : "white",
                  color: activeCategory.toLowerCase() === category.toLowerCase() ? "#F0A20E" : "#041627",
                  borderColor: activeCategory.toLowerCase() === category.toLowerCase() ? "#041627" : "#e2e8f0",
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : error ? (
            <div className="border border-[#F0A20E]/30 bg-white px-6 py-14 text-center" data-testid="projects-error">
              <p className="mb-5 text-sm text-[#041627]/65">{error}</p>
              <button
                type="button"
                data-testid="button-retry-projects"
                onClick={() => void loadProjects()}
                className="inline-flex items-center gap-2 bg-[#041627] px-5 py-3 text-xs font-bold tracking-wider text-[#F0A20E]"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <RefreshCw size={13} /> TRY AGAIN
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="border border-[#e2e8f0] bg-white px-6 py-16 text-center" data-testid="projects-empty">
              <p
                className="mb-3 text-xl font-bold text-[#041627]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                No projects found{requestedCategory ? ` for ${requestedCategory}` : ""}.
              </p>
              <p className="mb-6 text-sm text-[#041627]/50">
                Try another category or return to the full portfolio.
              </p>
              <button
                type="button"
                data-testid="button-view-all-projects"
                onClick={() => changeCategory("All")}
                className="text-xs font-bold tracking-wider text-[#F0A20E] underline underline-offset-4"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                VIEW ALL PROJECTS
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="projects-grid">
              <AnimatePresence mode="popLayout">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Link
                      to={`/projects/${project.slug}`}
                      data-testid={`link-project-${project.id}`}
                      className="group block h-full overflow-hidden bg-white transition-shadow duration-300 hover:shadow-xl hover:shadow-[#041627]/10"
                    >
                      <div className="relative h-52 overflow-hidden bg-[#dfe5ec]">
                        {projectImage(project) && (
                          <img
                            src={projectImage(project)}
                            alt={project.title}
                            onError={imageFallback}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            data-testid={`img-project-${project.id}`}
                          />
                        )}
                        <div className="absolute inset-0 bg-black/25 transition-opacity group-hover:bg-black/40" />
                        <span
                          className="absolute left-4 top-4 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                          style={{
                            background: TAG_COLORS[project.category] ?? "#041627",
                            fontFamily: "var(--font-ui)",
                          }}
                        >
                          {project.category}
                        </span>
                        {project.show_year && project.year && (
                          <span
                            className="absolute right-4 top-4 text-xs text-white/75"
                            style={{ fontFamily: "var(--font-ui)" }}
                          >
                            {project.year}
                          </span>
                        )}
                        <span
                          className="absolute bottom-4 right-4 flex translate-y-2 items-center gap-2 text-xs font-bold tracking-wider text-[#F0A20E] opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
                          style={{ fontFamily: "var(--font-ui)" }}
                        >
                          VIEW DETAILS <ArrowRight size={13} />
                        </span>
                      </div>
                      <div className="p-6">
                        <div className="mb-1 flex items-start gap-2">
                          <MapPin size={12} className="mt-0.5 flex-shrink-0 text-[#F0A20E]" aria-hidden="true" />
                          <span
                            className="text-[11px] tracking-wide text-gray-400"
                            style={{ fontFamily: "var(--font-ui)" }}
                          >
                            {project.location || "Nigeria"}
                          </span>
                        </div>
                        <h2
                          className="mb-2 text-[1.05rem] font-bold leading-snug tracking-tight text-[#041627]"
                          style={{ fontFamily: "var(--font-display)" }}
                          data-testid={`text-project-title-${project.id}`}
                        >
                          {project.title}
                        </h2>
                        <p
                          className="mb-4 text-sm leading-relaxed text-[#041627]/50"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {project.short_description}
                        </p>
                        <div
                          className="border-t border-gray-100 pt-4 text-xs font-bold tracking-wider text-[#F0A20E]"
                          style={{ fontFamily: "var(--font-ui)" }}
                        >
                          ↗ {project.result_metric || "Delivered with care"}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#041627] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="mb-4 text-white"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
            }}
          >
            Ready to start your project?
          </h2>
          <p className="mb-8 text-sm text-white/40" style={{ fontFamily: "var(--font-body)" }}>
            Get a free site assessment and detailed quote from our team — usually within 24 hours.
          </p>
          <Link
            to="/#contact"
            data-testid="link-projects-quote"
            className="inline-flex items-center gap-3 px-9 py-4 text-sm font-bold tracking-wider text-[#041627] transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg,#F0A20E 0%,#FFB830 100%)",
              fontFamily: "var(--font-ui)",
            }}
          >
            GET A FREE QUOTE <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}