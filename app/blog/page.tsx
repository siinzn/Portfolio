import { getSortBlogs } from "@/lib/blog"
import Link from "next/link";

const Blogpage = () => {
  const blogs = getSortBlogs();
  return (
      <section className="mx-auto w-11/12 flex flex-col gap-16 mb-20">
        <header 
          className="text-6xl text-neutral-900 text-center" style={{ fontFamily: "var(--font-cormorant-garamond), serif", fontWeight: 300 }}>
          <h1>
            Personal blogs
          </h1>
        </header>

        <section className="md:grid md:grid-cols flex flex-col gap-10">
          {blogs.map((blog, id) => (
            <Link 
              href={`/blog/${blog.id}`} 
              key={id}
              className="p-10 bg-neutral-400 rounded-xl"
              style={{ fontFamily: "var(--font-cormorant-garamond), serif", fontWeight: 400 }}
              >
              <div className="flex flex-row items-center justify-between">
                <h1 className="text-3xl">{blog.title}</h1>
                <p>{blog.date}</p>
              </div>
              <p className="" style={{fontFamily : "var(--font-poppins), serif", fontWeight: 200}}>
                {blog.description}
              </p>
            </Link>
          ))}
        </section>
      </section>
  )
}

export default Blogpage