export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center px-6 py-16 sm:py-24 md:py-32">
      <div className="w-full max-w-[640px]">
        <header className="text-center">
          <h1 className="mb-8 font-serif text-xl font-normal uppercase tracking-[0.3em] sm:text-2xl">
            Amanda Mashburn
          </h1>
          <hr className="my-4 border-dotted border-foreground/15" />
          <p className="font-mono text-xs font-light uppercase tracking-[0.20em] text-foreground sm:text-sm">
            Systems Thinker • Generalist
          </p>
          <hr className="my-4 border-dotted border-foreground/15" />
        </header>

        <article className="mt-10 space-y-5 font-serif text-base font-normal leading-[1.75] sm:mt-12 sm:space-y-6">
          <p>
            My background in a nutshell:
          </p>
          <p>
            I&apos;ve spent over a decade in enterprise tech building efficient end-to-end systems from the ground up – knowledge management programs, global business processes, and AI applications. I identify the root problem to solve, define requirements, architect the solution, coordinate (or execute) implementation, and document it all so it's maintainable.
          </p>
          <p>
            My rhythm: Design → Build → Document
          </p>
          <p>
            In keeping with that theme, I am documenting my personal Life Management System (built with Notion). Follow my progress on Instagram:
          </p>
          <a
            href="https://www.instagram.com/amandamashburn_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light tracking-[0.05em] text-foreground transition-colors hover:border-foreground/30 sm:text-sm"
          >
            @amandamashburn_
          </a>
          <p>
            When I&apos;m not reading, writing, or tinkering with tech, you can find me exploring Appalachia (Western NC) or Northwest Florida – my favorite places to spend time in nature and ponder.
          </p>
        </article>

        <section className="mt-10 sm:mt-12">
          <p className="font-serif text-base italic text-foreground">Tools.</p>
          <nav className="mt-5 flex flex-col items-start gap-3">
            <a
              href="/calendar"
              className="inline-block rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light uppercase tracking-[0.03em] text-foreground transition-colors hover:border-foreground/30 sm:text-sm"
            >
              ISO 8601 Calendar
            </a>
            <a
              href="https://docs.amandamashburn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light uppercase tracking-[0.03em] text-foreground transition-colors hover:border-foreground/30 sm:text-sm"
            >
              Public Knowledge Base
            </a>
          </nav>
        </section>

        <footer className="mt-10 sm:mt-12">
          <p className="font-serif text-base italic text-foreground">Follow me.</p>
          <nav className="mt-5 flex flex-col items-start gap-3">
            <a
              href="https://x.com/AmandaMashburn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light uppercase tracking-[0.05em] text-foreground transition-colors hover:border-foreground/30 sm:text-sm"
            >
              X
            </a>
            <a
              href="https://github.com/amandamashburn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light uppercase tracking-[0.05em] text-foreground transition-colors hover:border-foreground/30 sm:text-sm"
            >
              GitHub
            </a>
            <a
              href="https://www.instagram.com/amandamashburn_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light uppercase tracking-[0.05em] text-foreground transition-colors hover:border-foreground/30 sm:text-sm"
            >
              Instagram
            </a>
          </nav>
        </footer>
        <section className="mt-10 sm:mt-12">
          <p className="font-serif text-base italic text-foreground">Get in touch.</p>
          <p className="mt-5 font-mono text-xs font-light tracking-[0.05em] text-foreground sm:text-sm">
            amandamashburn@proton.me
          </p>
        </section>

        <hr className="mt-10 border-dotted border-foreground/15 sm:mt-12" />
        <p className="mt-4 text-center font-mono text-sm font-light text-muted-foreground">
          Last update: July 25, 2026
        </p>
        <hr className="mt-4 border-dotted border-foreground/15" />
      </div>
    </main>
  );
}
