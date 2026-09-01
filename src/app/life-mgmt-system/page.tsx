import { Breadcrumb } from "@/components/breadcrumb";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { lifeMgmtSystemGraph } from "@/data/life-mgmt-system";
import { getNodeTypes } from "@/lib/graph";

export const metadata = {
  title: "Life Management System | Amanda Mashburn",
  description:
    "A knowledge graph showing the tools, routines, setups, and systems that make up the Life Management System.",
};

function Legend() {
  const types = getNodeTypes(lifeMgmtSystemGraph);

  return (
    <div className="flex flex-wrap gap-4">
      {types.map((type) => (
        <div key={type} className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {type}
          </span>
        </div>
      ))}
    </div>
  );
}

function Instructions() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[10px] text-muted-foreground">
      <span>Scroll to zoom</span>
      <span>Drag to pan</span>
      <span>Click ▶ to expand/collapse</span>
      <span>Hover for connections</span>
      <span>Fullscreen for immersion</span>
      <span>Click underlined nodes to read</span>
    </div>
  );
}

export default function LifeMgmtSystemPage() {
  return (
    <main className="flex min-h-svh flex-col px-6 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1400px]">
        <header className="mb-6">
          <Breadcrumb items={[{ label: "life-mgmt-system" }]} />
          <h1 className="mt-4 font-serif text-xl font-normal uppercase tracking-[0.3em] sm:text-2xl">
            {lifeMgmtSystemGraph.title}
          </h1>
          <p className="mt-3 font-serif text-base leading-relaxed text-foreground/80 max-w-[640px]">
            A visual map of the tools, routines, setups, and systems that power
            daily life. Expand nodes to explore the hierarchy.
          </p>
        </header>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Legend />
          <Instructions />
        </div>

        <KnowledgeGraph graph={lifeMgmtSystemGraph} />

        <p className="mt-4 font-mono text-[10px] text-muted-foreground">
          {lifeMgmtSystemGraph.nodes.length} nodes · {lifeMgmtSystemGraph.edges.length} edges
        </p>
      </div>
    </main>
  );
}
