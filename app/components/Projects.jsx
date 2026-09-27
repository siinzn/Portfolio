import { ExternalLink } from "lucide-react";
import projects from "../../projects.json";
export default function Projects() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {projects.map((project) => (
        <a
          key={project.id}
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card group flex min-h-[205px] flex-col justify-between border border-stone-800/90 bg-stone-950/45 p-5 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-medium leading-tight text-stone-100 transition-colors group-hover:text-[#91aa91]">
              {project.name}
            </h3>
            <ExternalLink className="h-4 w-4 shrink-0 text-stone-600 transition-colors group-hover:text-[#91aa91]" />
          </div>

          <p className="mt-6 text-sm leading-6 text-stone-500">
            {project.description || "Project created on GitHub."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.language && (
              <span className="border border-stone-700 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400">
                {project.language}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
