import Link from "next/link";
import { ArrowLeftIcon, CalendarIcon } from "@heroicons/react/16/solid";
import { getBlogData } from "@/lib/blog";

const Blogs = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const blogData = await getBlogData(slug);
  return (
    <section className="mx-auto max-w-4xl px-6 flex flex-col gap-16 mt-18 text-white">
      <div className="flex flex-col gap-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-neutral-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to Blogs
        </Link>
        <h1 className="text-4xl font-semibold leading-tight">{blogData.title}</h1>
        <p className="inline-flex items-center gap-1.5 text-sm text-neutral-400">
          <CalendarIcon className="h-4 w-4" />
          {blogData.date.toString()}
        </p>
      </div>
      <article
        className="
          prose
          prose-neutral
          max-w-none
          prose-headings:font-semibold
          prose-headings:text-white
          prose-p:text-white
          prose-ul:text-white
          prose-li:text-white
          prose-a:text-white
          prose-h1:text-4xl
          prose-h2:text-3xl
          prose-p:font-light
          prose-code:text-white
          prose-code:before:content-none
          prose-code:after:content-none
          prose-code:bg-neutral-800
          prose-code:p-1
          prose-code:rounded-md
        "
        dangerouslySetInnerHTML={{ __html: blogData.contentHTML }}
      />
    </section>
  );
};

export default Blogs;
