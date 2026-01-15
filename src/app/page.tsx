export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="font-serif text-4xl font-light uppercase tracking-wide sm:text-5xl md:text-6xl">
        Website Coming Soon
      </h1>
      <p className="mt-6 font-mono text-base font-light sm:text-lg">
        Let&apos;s connect while I build (with help from Claude Code).
      </p>
      <p className="mt-8 font-mono text-base font-light">
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
