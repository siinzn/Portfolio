"use client";

import { useState } from "react";
import BlogPanel, { type Blog } from "../blog/BlogPanel";
import Experience from "./Experience";
import Projects from "./Projects";

type PanelTab = "Projects" | "Experience" | "Blogs";

const tabs: PanelTab[] = ["Projects", "Experience", "Blogs"];

export default function PortfolioPanel({ blogs }: { blogs: Blog[] }) {
  const [activeTab, setActiveTab] = useState<PanelTab>("Projects");

  return (
    <section className="scrollbar-hidden animate-fade-up animation-delay-150 lg:h-[calc(100svh-4rem)] lg:overflow-y-auto lg:pr-2 mt-30">
      <div className="mb-5 flex items-end justify-between border-b border-stone-800 pb-4">
        <div className="flex gap-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                activeTab === tab
                  ? "text-[#91aa91]"
                  : "text-stone-600 hover:text-stone-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-px bg-[#718b73]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Projects" && <Projects />}
      {activeTab === "Experience" && <Experience />}
      {activeTab === "Blogs" && <BlogPanel blogs={blogs} />}
    </section>
  );
}
