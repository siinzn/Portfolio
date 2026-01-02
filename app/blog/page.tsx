import { getSortBlogs } from "@/lib/blog";
import Link from "next/link";

const Blogpage = () => {
  const blogs = getSortBlogs();

  return (
    <section className="mx-auto w-11/12 max-w-6xl flex flex-col gap-16 mb-20 mt-15">
      <header
        className="text-4xl text-neutral-900 text-center pt-5"
        style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
      >
        <h1 className="font-extrabold">Personal blogs</h1>
      </header>

      <section className="flex flex-col gap-10">
        {blogs.map((blog) => (
          <Link
            href={`/blog/${blog.id}`}
            key={blog.id}
            className="
              block
              w-full
              rounded-xl
              border border-neutral-800
              bg-neutral-200
              p-6 sm:p-10
              transition-all
              hover:shadow-2xl
              hover:scale-[1.01]
            "
            style={{
              fontFamily: "var(--font-cormorant-garamond), serif",
              fontWeight: 400,
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-4xl font-extrabold">{blog.title}</h2>
              <p className="text-md">{blog.date}</p>
            </div>

            <p
              className="mt-2 wrap-break-word"
              style={{
                fontFamily: "var(--font-workSans), serif",
                fontWeight: 300,
              }}
            >
              {blog.description}
            </p>
          </Link>
        ))}
      </section>
    </section>
  );
};

export default Blogpage;
