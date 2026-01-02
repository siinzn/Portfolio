import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto w-full sm:w-11/12 md:max-w-4xl flex flex-col gap-2 min-h-[calc(100vh-4rem)] justify-center items-center">
      <h1
        className="text-neutral-900 text-center font-extrabold text-4xl"
        style={{ fontFamily: "var(--font-outfit), serif", fontWeight: 500 }}
      >
        Hi, I'm Muhammad Sinan
      </h1>
      <p
        className="text-center"
        style={{ fontFamily: "var(--font-outfit), serif", fontWeight: 400 }}
      >
        Systems & Graphics Programmer | Backend Developer
      </p>

      <div className="flex flex-row justify-center items-center gap-5">
        <div className="flex gap-5">
          <a
            href="mailto:..."
            className="hover:text-neutral-600 transition-colors"
          >
            <EnvelopeIcon className="w-6 h-6" />
          </a>
          <a href="tel:...">
            <PhoneIcon className="w-6 h-6 hover:text-neutral-600 transition-colors" />
          </a>
          <MapPinIcon className="w-6 h-6" title="Abu Dhabi, UAE" />
        </div>

        <div className="w-px h-6 bg-neutral-300" />

        <div className="flex gap-5">
          <a
            href="https://github.com/siinzn"
            target="_blank"
            title="Github"
            className="hover:text-neutral-600 transition-colors"
          >
            <Github className="w-6 h-6" />
          </a>
          <a
            href="https://www.linkedin.com/in/siinzn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-600 transition-colors"
            title="LinkedIn"
          >
            <Linkedin className="w-6 h-6" />
          </a>

          <a
            href="https://x.com/siinzn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-600 transition-colors"
            title="Twitter"
          >
            <Twitter className="w-6 h-6" />
          </a>
        </div>
      </div>
    </main>
  );
}
