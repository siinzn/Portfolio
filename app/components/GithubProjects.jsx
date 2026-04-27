import { ExternalLink } from "lucide-react";

export default async function GitHubProjects() {
  const username = "siinzn";

  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    },
  );

  const repos = await res.json();

  if (!Array.isArray(repos)) {
    return (
      <p className="text-red-400">Rate limit reached or user not found.</p>
    );
  }
  /*
  const portfolioProjects = repos.filter((repo) =>
    repo.topics?.includes("portfolio"),
  );
  */
  return (
    <section className="mb-32">
      <h2 className="text-3xl font-bold mb-8 text-purple-400">Projects</h2>
      <div className="grid gap-6">
        {repos.map((project) => (
          <a
            key={project.id}
            href={project.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl text-white font-semibold group-hover:text-purple-400 transition-colors">
                {project.name}
              </h3>
              <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>

            <p className="text-slate-400 mb-4">
              {project.description || "Project created on GitHub."}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.language && (
                <span className="px-3 py-1 text-sm bg-slate-700/50 text-slate-300 rounded-full">
                  {project.language}
                </span>
              )}
              {project.topics?.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 text-sm bg-purple-900/30 text-purple-300 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
