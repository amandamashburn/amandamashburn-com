import { Breadcrumb } from "@/components/breadcrumb";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { lifeMgmtSystemGraph, getNodesWithHref } from "@/lib/graph";

export const metadata = {
  title: "Life Management System | Amanda Mashburn",
  description:
    "A knowledge graph showing the tools, routines, setups, and systems that make up the Life Management System.",
};

function Legend() {
  const types = ["tool", "routine", "setup", "system"];

  return (
    <div className="flex flex-wrap gap-4">
      {types.map((type) => (
        <div key={type} className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {type}
          </span>
        </div>
      ))}
    </div>
  );
}

function NodeIndex() {
  const nodesWithHref = getNodesWithHref(lifeMgmtSystemGraph);

  if (nodesWithHref.length === 0) return null;

  return (
    <section className="mt-10 sm:mt-12">
      <h2 className="font-serif text-base italic text-foreground">
        Explore nodes.
      </h2>
      <nav className="mt-5 flex flex-col items-start gap-3">
        {nodesWithHref.map((node) => (
          <a
            key={node.id}
            href={node.href}
            className="inline-block rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light uppercase tracking-[0.03em] text-foreground transition-colors hover:border-foreground/30 sm:text-sm"
          >
            {node.label}
          </a>
        ))}
      </nav>
    </section>
  );
}

export default function LifeMgmtSystemPage() {
  return (
    <main className="flex min-h-svh flex-col px-6 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1000px]">
        <header className="mb-8">
          <Breadcrumb
            items={[{ label: "life-mgmt-system" }]}
          />
          <h1 className="mt-4 font-serif text-xl font-normal uppercase tracking-[0.3em] sm:text-2xl">
            {lifeMgmtSystemGraph.title}
          </h1>
          <p className="mt-4 font-serif text-base leading-relaxed text-foreground/80">
            A visual map of the tools, routines, setups, and systems that power
            daily life. Click on any node with a detail page to learn more.
          </p>
        </header>

        <section className="rounded border border-foreground/15 p-4 sm:p-6">
          <div className="mb-4">
            <Legend />
          </div>
          <KnowledgeGraph graph={lifeMgmtSystemGraph} />
        </section>

        <NodeIndex />
      </div>
    </main>
  );
}
