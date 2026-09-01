// Knowledge Graph data types and utilities
// Follows Kevin's v1 data contract

export type EdgeKind = "uses" | "contains" | "feeds";

export interface GraphNode {
  id: string;
  label: string;
  type: string; // per-graph vocabulary (e.g., "tool", "routine", "setup", "system")
  summary?: string;
  href?: string; // if present, node links to detail page
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string; // subject of the relationship
  to: string;
  kind: EdgeKind;
}

export interface Graph {
  id: string;
  title: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// --- Fixture Data: Life Management System ---

export const lifeMgmtSystemGraph: Graph = {
  id: "life-mgmt-system",
  title: "Life Management System",
  nodes: [
    {
      id: "notion-setup",
      label: "Notion setup",
      type: "setup",
      summary: "Configuration and architecture of the Notion workspace that powers the life management system.",
      href: "/life-mgmt-system/notion-setup",
      x: 100,
      y: 80,
    },
    {
      id: "notion",
      label: "Notion",
      type: "tool",
      summary: "The central digital tool for capturing, organizing, and tracking everything in the life management system.",
      href: "/life-mgmt-system/notion",
      x: 220,
      y: 200,
    },
    {
      id: "paper-planner",
      label: "paper planner",
      type: "tool",
      x: 400,
      y: 80,
    },
    {
      id: "weekly-review",
      label: "weekly review",
      type: "routine",
      summary: "A recurring ritual to review the past week, plan the next, and maintain system integrity.",
      href: "/life-mgmt-system/weekly-review",
      x: 120,
      y: 340,
    },
    {
      id: "household-finance",
      label: "household finance",
      type: "system",
      summary: "The subsystem for tracking income, expenses, budgets, and financial goals.",
      href: "/life-mgmt-system/household-finance",
      x: 520,
      y: 280,
    },
    {
      id: "checking",
      label: "checking account",
      type: "tool",
      x: 620,
      y: 400,
    },
  ],
  edges: [
    { from: "notion-setup", to: "notion", kind: "contains" },
    { from: "weekly-review", to: "notion", kind: "uses" },
    { from: "weekly-review", to: "paper-planner", kind: "uses" },
    { from: "household-finance", to: "checking", kind: "contains" },
    { from: "weekly-review", to: "household-finance", kind: "feeds" },
  ],
};

// --- Graph Utilities ---

/** Get all graphs (for future multi-graph support) */
export function getAllGraphs(): Graph[] {
  return [lifeMgmtSystemGraph];
}

/** Get a graph by ID */
export function getGraphById(id: string): Graph | undefined {
  return getAllGraphs().find((g) => g.id === id);
}

/** Get a node by ID within a graph */
export function getNodeById(graph: Graph, nodeId: string): GraphNode | undefined {
  return graph.nodes.find((n) => n.id === nodeId);
}

/** Get all nodes that have detail pages (href defined) */
export function getNodesWithHref(graph: Graph): GraphNode[] {
  return graph.nodes.filter((n) => n.href !== undefined);
}

/** Get neighbor node IDs for a given node (connected by any edge) */
export function getNeighborIds(graph: Graph, nodeId: string): string[] {
  const neighbors = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.from === nodeId) {
      neighbors.add(edge.to);
    } else if (edge.to === nodeId) {
      neighbors.add(edge.from);
    }
  }
  return Array.from(neighbors);
}

/** Get edges connected to a node */
export function getConnectedEdges(graph: Graph, nodeId: string): GraphEdge[] {
  return graph.edges.filter((e) => e.from === nodeId || e.to === nodeId);
}

/** Calculate bounding box for a graph's nodes */
export function getGraphBounds(graph: Graph): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (graph.nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  
  const padding = 120; // padding for node labels
  const xs = graph.nodes.map((n) => n.x);
  const ys = graph.nodes.map((n) => n.y);
  
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding / 2;
  const maxY = Math.max(...ys) + padding;
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
