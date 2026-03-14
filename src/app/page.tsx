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
            Systems Thinker • Technical Non-Engineer • Southerner
          </p>
          <hr className="my-4 border-dotted border-foreground/15" />
        </header>

        <article className="mt-10 space-y-5 font-serif text-base font-normal leading-[1.75] sm:mt-12 sm:space-y-6">
          <p>
            My background in a nutshell:
          </p>
          <p>
            I&apos;ve spent over a decade in tech building efficient end-to-end systems from the ground up in the form of knowledge management programs, business processes, and AI applications. I identify the root problem to solve, define requirements, pinpoint people and sub-systems needed, architect the solution, coordinate (or execute) implementation, and thoroughly document it all.
          </p>
          <p>
            Design. Build. Document. Hand off. Move on.
          </p>
          <p>
            In keeping with that theme, I am currently documenting my personal extended mind system to share with the world – alongside a collection of evergreen articles on topics that pique my interest. The project is a work in progress, but I'm sharing as I build:
          </p>
          <a
            href="https://docs.amandamashburn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block underline hover:no-underline"
          >
            docs.amandamashburn.com
          </a>
          <p>
            When I&apos;m not reading, writing, or tinkering with the latest tech, you can find me exploring Appalachia (Western NC) or Northwest Florida – my favorite places to spend time in nature and ponder.
          </p>
        </article>

        <footer className="mt-10 sm:mt-12">
          <p className="font-serif text-base italic text-foreground">Let&apos;s connect.</p>
          <nav className="mt-5 flex flex-col gap-5">
            <a
              href="https://x.com/AmandaMashburn"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-light tracking-[0.15em] text-foreground underline hover:no-underline sm:text-sm"
            >
              X
            </a>
            <a
              href="https://github.com/amandamashburn"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-light tracking-[0.15em] text-foreground underline hover:no-underline sm:text-sm"
            >
              GitHub
            </a>
            <a
              href="mailto:amandamashburn@proton.me"
              className="font-mono text-xs font-light tracking-[0.15em] text-foreground underline hover:no-underline sm:text-sm"
            >
              Email
            </a>
          </nav>
        </footer>
        <hr className="mt-10 border-dotted border-foreground/15 sm:mt-12" />
        <p className="mt-4 text-center font-mono text-sm font-light text-muted-foreground">
          Last update: March 14, 2026
        </p>
        <hr className="mt-4 border-dotted border-foreground/15" />
      </div>
    </main>
  );
}
