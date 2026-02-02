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
            Some folks fear a blank slate. I relish them — they represent endless
            possibility, a chance to create something from nothing. That theme
            runs through everything I do, whether it&apos;s standing up a
            program in corporate America or creating a home that&apos;s both
            functional and beautiful.
          </p>
          <p>
            I&apos;ve spent over a decade in tech building systems where none
            existed — knowledge management programs, business processes,
            applications. I identify what&apos;s missing, define the requirements, build the foundation, and get it to a steady state to hand off for long-term maintenance.
            Then it&apos;s on to the next thing. The same instinct shows up at
            home — efficient work zones, life maintenance routines, spaces designed to
            stand the test of time. Digital or physical, work or personal,
            it&apos;s all the same principle. <strong>Establish order and efficiency, make it sustainable, repeat.</strong>
          </p>
          <p>
            But underneath all that building is a simpler question: in a world
            of infinite options, how do we choose well? How do we allocate and
            make the most of our finite resources — time, attention, energy,
            money? I&apos;m interested in the discipline of thinking, deciding,
            planning, and then executing with focus. I'm interested in living with intention.
          </p>
          <p>
            These experiences led me to build an{" "}
            <a
              href="https://grokipedia.com/page/Extended_mind_thesis"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              extended mind system
            </a>{" "}
             — one that
            helps me <strong>think, remember, maintain, prioritize, and do</strong>. I hesitate to call it a &ldquo;productivity system&rdquo; because that
            description makes me recoil a bit. It goes deeper than productivity.
            Used well, it becomes a tool for introspection, lifelong learning,
            and living a good life (however you choose to define it).
          </p>
          <p>
            I am now in the process of documenting my extended mind system to share with the world. The project is in its infancy —{" "}
            <a
              href="https://docs.amandamashburn.com/pages/article_infrastructure"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              the infrastructure is in place
            </a>
            , and now I&apos;m cleaning up 50,000 words of drafts and
            sharing them here:
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
            The system is not a prescription. It&apos;s an opinionated starting
            point and source of inspiration — something concrete to react to, adapt, and make your own.
            The methodology itself is tool-agnostic, but I&apos;m sharing
            implementations for <a href="https://www.notion.com" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Notion</a> and <a href="https://obsidian.md" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Obsidian</a> along with working examples, templates, and ways to apply AI — coupling theory with practice.
          </p>
          <p>
            When I&apos;m not writing or tinkering with AI, you can find me exploring Appalachia or Northwest Florida — the places I go to spend time in nature and ponder.
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
              href="https://www.linkedin.com/in/amandamashburn/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-light tracking-[0.15em] text-foreground underline hover:no-underline sm:text-sm"
            >
              LinkedIn
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
          Last update: Monday, February 2, 2026
        </p>
        <hr className="mt-4 border-dotted border-foreground/15" />
      </div>
    </main>
  );
}
