import Antigravity from "./components/Antigravity";
import PortfolioPanel from "./components/PortfolioPanel";
import About from "./components/About";
import { getBlogData, getSortBlogs } from "@/lib/blog";

export default async function Home() {
  const blogs = await Promise.all(
    getSortBlogs().map(async (blog) => ({
      ...blog,
      contentHTML: (await getBlogData(blog.id)).contentHTML,
    })),
  );

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-45"
      >
        <Antigravity
          count={85}
          magnetRadius={25}
          ringRadius={13}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={0.5}
          lerpSpeed={0.07}
          color="#607864"
          autoAnimate
          particleVariance={1}
          rotationSpeed={0.1}
          depthFactor={1}
          pulseSpeed={5}
          particleShape="tetrahedron"
          fieldStrength={10}
        />
      </div>
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] items-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(280px,0.72fr)_minmax(620px,1.55fr)] lg:gap-16">
          <About />
          <PortfolioPanel blogs={blogs} />
        </div>
      </main>
    </>
  );
}
