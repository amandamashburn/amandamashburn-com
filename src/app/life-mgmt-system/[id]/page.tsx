import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { lifeMgmtSystemGraph } from "@/data/life-mgmt-system";
import {
  getNodeById,
  getNeighborIds,
  getConnectedEdges,
  getNodesWithHref,
} from "@/lib/graph";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const node = getNodeById(lifeMgmtSystemGraph, id);

  if (!node || !node.href) {
    return {
      title: "Not Found | Amanda Mashburn",
    };
  }

  return {
    title: `${node.label} | Life Management System | Amanda Mashburn`,
    description:
      node.summary ||
      `${node.label} is a ${node.type} in the Life Management System.`,
  };
}

export async function generateStaticParams() {
  // Generate static params only for nodes with href
  const nodesWithHref = getNodesWithHref(lifeMgmtSystemGraph);
  return nodesWithHref.map((node) => ({
    id: node.id,
  }));
}

function RelatedNodes({ nodeId }: { nodeId: string }) {
  const neighborIds = getNeighborIds(lifeMgmtSystemGraph, nodeId);
  const edges = getConnectedEdges(lifeMgmtSystemGraph, nodeId);

  if (neighborIds.length === 0) return null;

  const nodeMap = new Map(lifeMgmtSystemGraph.nodes.map((n) => [n.id, n]));

  const relationships = edges.map((edge) => {
    const isSubject = edge.from === nodeId;
    const relatedId = isSubject ? edge.to : edge.from;
    const relatedNode = nodeMap.get(relatedId);

    if (!relatedNode) return null;

    let description: string;
    if (isSubject) {
      description = `${edge.kind} ${relatedNode.label}`;
    } else {
      const inverseKind =
        edge.kind === "contains"
          ? "contained by"
          : edge.kind === "uses"
            ? "used by"
            : "fed by";
      description = `${inverseKind} ${relatedNode.label}`;
    }

    return {
      node: relatedNode,
      description,
    };
  });

  const validRelationships = relationships.filter(Boolean) as {
    node: (typeof lifeMgmtSystemGraph.nodes)[0];
    description: string;
  }[];

  return (
    <section className="mt-10 sm:mt-12">
      <h2 className="font-serif text-base italic text-foreground">
        Related nodes.
      </h2>
      <ul className="mt-5 space-y-3">
        {validRelationships.map(({ node, description }) => (
          <li key={node.id} className="flex items-baseline gap-2">
            {node.href ? (
              <Link
                href={node.href}
                className="inline-block rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light uppercase tracking-[0.03em] text-foreground transition-colors hover:border-foreground/30 sm:text-sm"
              >
                {node.label}
              </Link>
            ) : (
              <span className="inline-block rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light uppercase tracking-[0.03em] text-muted-foreground sm:text-sm">
                {node.label}
              </span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              ({description})
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function NodeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const node = getNodeById(lifeMgmtSystemGraph, id);

  // Only render pages for nodes that have href defined
  if (!node || !node.href) {
    notFound();
  }

  return (
    <main className="flex min-h-svh flex-col items-center px-6 py-12 sm:py-16">
      <div className="w-full max-w-[640px]">
        <header className="mb-8">
          <Breadcrumb
            items={[
              { label: "life-mgmt-system", href: "/life-mgmt-system" },
              { label: node.label },
            ]}
          />
          <div className="mt-4 flex items-baseline gap-3">
            <h1 className="font-serif text-xl font-normal uppercase tracking-[0.3em] sm:text-2xl">
              {node.label}
            </h1>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {node.type}
            </span>
          </div>
        </header>

        <article className="space-y-5 font-serif text-base leading-relaxed">
          {node.summary ? (
            <p>{node.summary}</p>
          ) : (
            <p className="text-muted-foreground italic">
              No summary available yet. Content coming soon.
            </p>
          )}

          <p className="text-foreground/80">
            This is a placeholder page for the{" "}
            <span className="font-mono text-sm">{node.label}</span> node. More
            detailed content will be added as the Life Management System
            documentation expands.
          </p>
        </article>

        <RelatedNodes nodeId={node.id} />

        <hr className="mt-10 border-dotted border-foreground/15 sm:mt-12" />

        <nav className="mt-6">
          <Link
            href="/life-mgmt-system"
            className="inline-flex items-center gap-2 rounded border border-foreground/10 bg-background px-3 py-1.5 font-mono text-xs font-light uppercase tracking-[0.03em] text-foreground transition-colors hover:border-foreground/30 sm:text-sm"
          >
            <ArrowLeft size={14} />
            Back to graph
          </Link>
        </nav>
      </div>
    </main>
  );
}
