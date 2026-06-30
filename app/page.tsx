import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Github, Linkedin, Twitter, ExternalLink } from "lucide-react";
import Projects from "./components/Projects";

export default function Home() {
  return (
    <>
      <main className="mx-auto w-full sm:w-11/12 md:max-w-4xl flex flex-col gap-4 min-h-screen justify-center items-center px-6">
        <h1
          className="text-white text-center font-extrabold text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-outfit), serif", fontWeight: 500 }}
        >
          Hi, I'm <span className="text-purple-400">Muhammad Sinan</span>
        </h1>
        <p
          className="text-center text-lg md:text-xl text-slate-400"
          style={{ fontFamily: "var(--font-outfit), serif", fontWeight: 400 }}
        >
          Systems & Graphics Programmer | Backend Developer
        </p>

        <div className="flex flex-row justify-center items-center gap-5 mt-4 text-white">
          <div className="flex gap-4">
            <a
              href="mailto:msinannoufal@gmail.com"
              className="hover:text-purple-400 transition-colors"
              title="Email"
            >
              <EnvelopeIcon className="w-5 h-5" />
            </a>
            <a
              href="tel:+971521240054"
              className="hover:text-purple-400 transition-colors"
              title="Phone"
            >
              <PhoneIcon className="w-5 h-5" />
            </a>
            <div
              className="cursor-default hover:text-purple-400 transition-colors"
              title="Abu Dhabi, UAE"
            >
              <MapPinIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="w-px h-5 bg-slate-600" />

          <div className="flex gap-4">
            <a
              href="https://github.com/siinzn"
              target="_blank"
              rel="noopener noreferrer"
              title="Github"
              className="hover:text-purple-400 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/siinzn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/siinzn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
              title="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </main>

      <div className="mx-auto w-full sm:w-11/12 md:max-w-4xl px-6 pb-20">
        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">About</h2>
          <div className="text-slate-300 space-y-4 leading-relaxed text-pretty">
            <p>
              I'm a systems programmer and backend developer building
              high-performance software and exploring computer graphics. Focused
              on low-level C++ and web backends with JavaScript and Python.
            </p>
            <p>
              Outside of code I do motion graphics in After Effects and play
              football.
            </p>
          </div>
          <div className="mt-8 flex gap-4 justify-center">
            <span className="text-2xl text-slate-300 font-semibold">C++</span>
            <span className="text-slate-600">•</span>
            <span className="text-2xl text-slate-300 font-semibold">
              Python
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-2xl text-slate-300 font-semibold">
              JavaScript
            </span>
          </div>
        </section>

        <section>
          <Projects />
        </section>
      </div>
    </>
  );
}
