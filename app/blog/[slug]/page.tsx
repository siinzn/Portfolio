import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { getBlogData } from "@/lib/blog";

const Blogs = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const blogData = await getBlogData(slug);
  return (
    <section className="mx-auto w-11/12 flex flex-col gap-16 mb-20 max-w-6xl mt-20">
      <div
        className="flex flex-col items-center justify-center "
        style={{
          fontFamily: "var(--font-cormorant-garamond), serif",
          fontWeight: 400,
        }}
      >
        <div className="flex flex-row gap-5">
          <Link
            href={"/blog"}
            className="inline-flex items-center justify-center p-1 rounded-md "
          >
            <ArrowLeftIcon width={20} className="h-5 w-5 text-neutral-800" />
          </Link>
          <h1 className="text-4xl font-extrabold">{blogData.title}</h1>
        </div>

        <p className="text-md">{blogData.date.toString()}</p>
      </div>
      <article
        className="
          prose 
          prose-neutral 
          max-w-none
          prose-headings:font-bold
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
