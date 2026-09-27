"use client";

import { useState } from "react";

export type Blog = {
  id: string;
  title: string;
  date: string;
  description: string;
  contentHTML: string;
};

export default function BlogPanel({ blogs }: { blogs: Blog[] }) {
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  if (selectedBlog) {
    return (
      <article className="border-y border-stone-800 py-6">
        <button
          type="button"
          onClick={() => setSelectedBlog(null)}
          className="mb-7 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-600 transition-colors hover:text-[#91aa91]"
        >
          &larr; Back to blogs
        </button>
        <div className="flex items-start justify-between gap-5 border-b border-stone-800 pb-5">
          <h3 className="text-2xl font-medium leading-tight text-stone-100">
            {selectedBlog.title}
          </h3>
          <span className="shrink-0 pt-1 font-mono text-xs text-stone-500">
            {selectedBlog.date}
          </span>
        </div>
        <div
          className="prose prose-invert mt-6 max-w-none text-sm leading-7 text-stone-400"
          dangerouslySetInnerHTML={{ __html: selectedBlog.contentHTML }}
        />
      </article>
    );
  }

  return (
    <div className="divide-y divide-stone-800 border-y border-stone-800">
      {blogs.map((blog) => (
        <button
          key={blog.id}
          type="button"
          onClick={() => setSelectedBlog(blog)}
          className="group flex w-full items-start justify-between gap-5 py-5 text-left transition-colors hover:bg-stone-950/40"
        >
          <div className="min-w-0">
            <h3 className="text-lg font-medium text-stone-100 transition-colors group-hover:text-[#91aa91]">
              {blog.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              {blog.description}
            </p>
          </div>
          <span className="shrink-0 pt-1 font-mono text-xs text-stone-500">
            {blog.date}
          </span>
        </button>
      ))}
    </div>
  );
}
