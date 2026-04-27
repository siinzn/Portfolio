import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { getBlogData } from "@/lib/blog";

const Blogs = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const blogData = await getBlogData(slug);
  return (
    <section className="mx-auto w-11/12 flex flex-col gap-16 mb-20 max-w-6xl mt-20 text-white">
      <div
        className="flex flex-col items-center justify-center "
        style={{
          fontFamily: "var(--font-outfit), serif",
          fontWeight: 400,
        }}
      >
        <div className="flex flex-row gap-5">
          <Link
            href={"/blog"}
            className="inline-flex items-center justify-center p-1 rounded-md "
          >
            <ArrowLeftIcon width={20} className="h-5 w-5 text-white" />
          </Link>
          <h1 className="text-4xl">{blogData.title}</h1>
        </div>

        <p className="text-md">{blogData.date.toString()}</p>
      </div>
      <article
        className="
        text-white
          prose 
          prose-neutral 
          max-w-none
          prose-headings:font-bold
          prose-p:text-slate-300
          prose-h1:text-slate-300
          prose-h2:text-slate-300
          prose-h3:text-slate-300
          prose-ul:text-slate-300
          prose-a:text-slate-300
          prose-blue
          prose-h1:text-4xl
          prose-h2:text-3xl
          prose-p:font-light
        "
        dangerouslySetInnerHTML={{ __html: blogData.contentHTML }}
      />
    </section>
  );
};

export default Blogs;
