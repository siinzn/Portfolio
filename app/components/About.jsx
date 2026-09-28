import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Github, Linkedin, Twitter } from "lucide-react";

const About = () => {
  return (
    <>
      <section className="flex flex-col justify-center animate-fade-up lg:h-[calc(100svh-4rem)]">
        <h1 className="max-w-xl text-5xl font-medium leading-[0.98] tracking-[-0.055em] text-stone-100 sm:text-6xl xl:text-7xl">
          Hi, I&apos;m <span className="text-[#91aa91]">Muhammad Sinan</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-stone-400 sm:text-lg">
          Backend & Systems Programming | Graphics Enthusiast
        </p>

        <div className="mt-9 flex items-center gap-4 text-stone-300">
          <div className="flex gap-2">
            <a
              href="mailto:msinannoufal@gmail.com"
              className="icon-link"
              title="Email"
            >
              <EnvelopeIcon className="h-4 w-4" />
            </a>
            <a href="tel:+971521240054" className="icon-link" title="Phone">
              <PhoneIcon className="h-4 w-4" />
            </a>
            <div className="icon-link cursor-default" title="Abu Dhabi, UAE">
              <MapPinIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="h-5 w-px bg-stone-700" />

          <div className="flex gap-2">
            <a
              href="https://github.com/siinzn"
              target="_blank"
              rel="noopener noreferrer"
              title="Github"
              className="icon-link"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/siinzn/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              className="icon-link"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://x.com/siinzn"
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter"
              className="icon-link"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-14 border-t border-stone-800 pt-5">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">
            About
          </h2>
          <div className="max-w-md space-y-3 text-sm leading-6 text-stone-400">
            <p>
              I&apos;m a systems programmer and backend developer building
              high-performance software and exploring computer graphics. Focused
              on low-level C++ and web backends with JavaScript and Python.
            </p>
            <p>
              Outside of code I do motion graphics in After Effects and play
              football.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">
            <span>C++</span>
            <span className="text-[#718b73]">•</span>
            <span>Python</span>
            <span className="text-[#718b73]">•</span>
            <span>JavaScript</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
