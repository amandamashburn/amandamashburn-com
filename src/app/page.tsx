import { Twitter, Linkedin, Github } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="font-serif text-4xl font-light uppercase tracking-wide sm:text-5xl md:text-6xl">
        Website Coming Soon
      </h1>
      <p className="mt-6 font-mono text-base font-light sm:text-lg">
        Let&apos;s connect while I build (with help from Claude Code).
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="https://x.com/AmandaMashburn"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow on X"
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-black/10 transition-colors hover:bg-black/5"
        >
          <Twitter className="h-5 w-5" />
        </a>
        <a
          href="https://www.linkedin.com/in/amandamashburn/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Connect on LinkedIn"
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-black/10 transition-colors hover:bg-black/5"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a
          href="https://github.com/amandamashburn"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View GitHub profile"
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-black/10 transition-colors hover:bg-black/5"
        >
          <Github className="h-5 w-5" />
        </a>
      </div>
    </main>
  );
}
