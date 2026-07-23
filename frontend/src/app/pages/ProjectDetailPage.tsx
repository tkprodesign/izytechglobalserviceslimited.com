import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { Link, useParams } from "react-router";
import { PageLayout } from "../components/PageLayout";
import { api, Project } from "../../lib/api";

function projectImage(project: Project) {
  return project.main_image_url || project.images?.[0] || "";
}

export function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.project(slug)
      .then(result => setProject(result.data))
      .catch(err => setError(err instanceof Error ? err.message : "Unable to load project"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[70vh] bg-[#f5f6f8] px-6 pb-24 pt-36">
          <div className="mx-auto max-w-6xl animate-pulse">
            <div className="mb-6 h-4 w-32 bg-[#dfe5ec]" />
            <div className="mb-5 h-14 max-w-2xl bg-[#dfe5ec]" />
            <div className="h-[28rem] bg-[#dfe5ec]" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !project) {
    return (
      <PageLayout>
        <div className="flex min-h-[70vh] items-center justify-center bg-[#f5f6f8] px-6 pt-20 text-center">
          <div>
            <p className="mb-6 text-[#041627]/60">{error || "Project not found"}</p>
            <Link to="/projects" className="font-bold tracking-wider text-[#F0A20E]">
              BACK TO PROJECTS
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <article className="bg-[#f5f6f8] pt-20">
        <div className="relative overflow-hidden bg-[#041627]">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <Link
              to="/projects"
              className="mb-8 inline-flex items-center gap-2 text-xs font-bold tracking-wider text-white/55 transition-colors hover:text-[#F0A20E]"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <ArrowLeft size={14} /> ALL PROJECTS
            </Link>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#F0A20E]">
              {project.category}
            </p>
            <h1
              className="max-w-4xl text-white"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem,5vw,4.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
              }}
            >
              {project.title}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-20">
            <div>
              <div className="mb-10 overflow-hidden bg-[#dfe5ec]">
                {projectImage(project) && (
                  <img src={projectImage(project)} alt={project.title} className="h-auto max-h-[36rem] w-full object-cover" />
                )}
              </div>
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed text-[#041627]/70">
                  {project.full_description || project.short_description}
                </p>
              </div>
              {project.images.length > 1 && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {project.images.slice(1).map((image, index) => (
                    <img key={image} src={image} alt={`${project.title} view ${index + 2}`} className="h-56 w-full object-cover" />
                  ))}
                </div>
              )}
            </div>

            <aside className="h-fit bg-white p-7 lg:sticky lg:top-28">
              <div className="mb-7 flex items-center gap-2 text-sm text-[#041627]/55">
                <MapPin size={15} className="text-[#F0A20E]" /> {project.location || "Nigeria"}
                <span className="mx-1 text-[#dfe5ec]">/</span>
                {project.year}
              </div>
              <div className="mb-8 border-l-4 border-[#F0A20E] bg-[#F0A20E]/10 px-5 py-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#041627]/50">Project result</p>
                <p className="text-xl font-bold text-[#041627]" style={{ fontFamily: "var(--font-display)" }}>
                  {project.result_metric || "Built for lasting results"}
                </p>
              </div>
              {project.services.length > 0 && (
                <div className="mb-9">
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#041627]">Services involved</h2>
                  <ul className="space-y-3 text-sm text-[#041627]/60">
                    {project.services.map(service => (
                      <li key={service} className="flex items-start gap-2">
                        <Check size={15} className="mt-0.5 flex-shrink-0 text-[#F0A20E]" /> {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link
                to="/#contact"
                className="inline-flex w-full items-center justify-center gap-3 bg-[#041627] px-6 py-4 text-sm font-bold tracking-wider text-[#F0A20E] transition-colors hover:bg-[#0a2945]"
              >
                START YOUR PROJECT <ArrowRight size={15} />
              </Link>
            </aside>
          </div>
        </div>
      </article>
    </PageLayout>
  );
}