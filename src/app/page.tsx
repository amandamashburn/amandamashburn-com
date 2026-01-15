export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-8 sm:px-6">
      <h1 className="text-center font-serif text-3xl font-light uppercase tracking-wide sm:text-5xl md:text-6xl">
        Website Coming Soon
      </h1>
      <p className="mt-4 text-center font-mono text-sm font-light sm:mt-6 sm:text-lg">
        Let&apos;s connect while I build (with help from Claude Code).
      </p>
      <p className="mt-6 text-center font-mono text-sm font-light sm:mt-8 sm:text-base">
        <a
          href="https://x.com/AmandaMashburn"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          𝕏
        </a>
        {" • "}
        <a
          href="https://github.com/amandamashburn"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          GitHub
        </a>
        {" • "}
        <a
          href="https://www.linkedin.com/in/amandamashburn/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          LinkedIn
        </a>
      </p>
    </main>
  );
}
