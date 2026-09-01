// Knowledge Graph data types and utilities
// Follows Kevin's v1/v1.1 data contract

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

// --- Graph Utilities ---

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

/** Build a map of parent -> children for contains edges */
export function buildContainsTree(graph: Graph): Map<string, string[]> {
  const childrenMap = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (edge.kind === "contains") {
      const children = childrenMap.get(edge.from) || [];
      children.push(edge.to);
      childrenMap.set(edge.from, children);
    }
  }
  return childrenMap;
}

/** Build a map of child -> parent for contains edges */
export function buildParentMap(graph: Graph): Map<string, string> {
  const parentMap = new Map<string, string>();
  for (const edge of graph.edges) {
    if (edge.kind === "contains") {
      parentMap.set(edge.to, edge.from);
    }
  }
  return parentMap;
}

/** Get all descendants of a node via contains edges (recursive) */
export function getContainsDescendants(
  graph: Graph,
  nodeId: string,
  childrenMap?: Map<string, string[]>
): Set<string> {
  const children = childrenMap || buildContainsTree(graph);
  const descendants = new Set<string>();

  function collectDescendants(id: string) {
    const nodeChildren = children.get(id) || [];
    for (const childId of nodeChildren) {
      descendants.add(childId);
      collectDescendants(childId);
    }
  }

  collectDescendants(nodeId);
  return descendants;
}

/** Check if a node has children via contains edges */
export function hasContainsChildren(
  graph: Graph,
  nodeId: string,
  childrenMap?: Map<string, string[]>
): boolean {
  const children = childrenMap || buildContainsTree(graph);
  const nodeChildren = children.get(nodeId);
  return nodeChildren !== undefined && nodeChildren.length > 0;
}

/** Get direct children of a node via contains edges */
export function getDirectChildren(
  graph: Graph,
  nodeId: string,
  childrenMap?: Map<string, string[]>
): string[] {
  const children = childrenMap || buildContainsTree(graph);
  return children.get(nodeId) || [];
}

/** Find root nodes (nodes not contained by anything) */
export function findRootNodes(graph: Graph): string[] {
  const parentMap = buildParentMap(graph);
  return graph.nodes
    .filter((node) => !parentMap.has(node.id))
    .map((node) => node.id);
}

/** Calculate bounding box for a graph's nodes */
export function getGraphBounds(graph: Graph): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (graph.nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  const padding = 150;
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

/** Calculate bounding box for visible nodes only */
export function getVisibleBounds(
  graph: Graph,
  visibleNodeIds: Set<string>
): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  const visibleNodes = graph.nodes.filter((n) => visibleNodeIds.has(n.id));

  if (visibleNodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  const padding = 150;
  const xs = visibleNodes.map((n) => n.x);
  const ys = visibleNodes.map((n) => n.y);

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

/** Get unique node types in the graph */
export function getNodeTypes(graph: Graph): string[] {
  const types = new Set(graph.nodes.map((n) => n.type));
  return Array.from(types).sort();
}
