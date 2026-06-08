import { getSortBlogs } from "@/lib/blog";
import Link from "next/link";

const SG = "var(--font-spaceGrotesk), sans-serif";

const Blogpage = () => {
  const blogs = getSortBlogs();

  return (
    <section
      className="mx-auto max-w-4xl px-6 py-16 flex flex-col gap-10"
      style={{ fontFamily: SG }}
    >
      <header>
        <h1 className="mt-1 text-2xl font-semibold text-white">
          Personal blogs
        </h1>
      </header>

      <ul className="flex flex-col divide-y divide-neutral-800">
        {blogs.map((blog) => (
          <li key={blog.id}>
            <Link
              href={`/blog/${blog.id}`}
              className="group flex items-start justify-between gap-8 py-5 transition-opacity hover:opacity-70"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-md font-medium text-white">
                  {blog.title}
                </h2>
                <p className="text-md text-neutral-500 leading-relaxed">
                  {blog.description}
                </p>
              </div>
              <span className="shrink-0 text-xs text-neutral-600 pt-0.5">
                {blog.date}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Blogpage;
