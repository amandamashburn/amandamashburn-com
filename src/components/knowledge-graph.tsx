"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  type Graph,
  type GraphNode,
  type GraphEdge,
  getNeighborIds,
  getGraphBounds,
} from "@/lib/graph";

interface KnowledgeGraphProps {
  graph: Graph;
}

const NODE_RADIUS = 6;

function GraphEdgeLine({
  fromNode,
  toNode,
  isHighlighted,
  isDimmed,
}: {
  edge: GraphEdge;
  fromNode: GraphNode;
  toNode: GraphNode;
  isHighlighted: boolean;
  isDimmed: boolean;
}) {
  const opacity = isDimmed ? 0.15 : isHighlighted ? 1 : 0.4;

  return (
    <line
      x1={fromNode.x}
      y1={fromNode.y}
      x2={toNode.x}
      y2={toNode.y}
      stroke="currentColor"
      strokeWidth={isHighlighted ? 2 : 1}
      strokeOpacity={opacity}
      className="text-foreground transition-all duration-150"
      aria-hidden="true"
    />
  );
}

function GraphNodeCircle({
  node,
  isHighlighted,
  isDimmed,
  onHover,
  onLeave,
  onClick,
}: {
  node: GraphNode;
  isHighlighted: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const hasLink = node.href !== undefined;
  const opacity = isDimmed ? 0.2 : 1;

  return (
    <g
      className={`transition-opacity duration-150 ${hasLink ? "cursor-pointer" : ""}`}
      style={{ opacity }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={hasLink ? onClick : undefined}
      onKeyDown={
        hasLink
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      tabIndex={hasLink ? 0 : undefined}
      role={hasLink ? "link" : "img"}
      aria-label={`${node.label} (${node.type})${hasLink ? " - click to view details" : ""}`}
    >
      <circle
        cx={node.x}
        cy={node.y}
        r={isHighlighted ? NODE_RADIUS + 2 : NODE_RADIUS}
        fill="currentColor"
        className={`text-foreground transition-all duration-150 ${
          hasLink ? "hover:text-foreground" : ""
        }`}
      />
      <text
        x={node.x}
        y={node.y - NODE_RADIUS - 12}
        textAnchor="middle"
        className="fill-current text-foreground font-sans text-xs"
      >
        {node.label}
      </text>
      <text
        x={node.x}
        y={node.y - NODE_RADIUS - 24}
        textAnchor="middle"
        className="fill-current text-muted-foreground font-mono text-[10px] uppercase tracking-wider"
      >
        {node.type}
      </text>
    </g>
  );
}

export function KnowledgeGraph({ graph }: KnowledgeGraphProps) {
  const router = useRouter();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const bounds = getGraphBounds(graph);
  const viewBox = `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`;

  const neighborIds = useMemo(() => {
    return hoveredNodeId
      ? new Set(getNeighborIds(graph, hoveredNodeId))
      : new Set<string>();
  }, [graph, hoveredNodeId]);

  const isNodeHighlighted = useCallback(
    (nodeId: string) => {
      if (!hoveredNodeId) return false;
      return nodeId === hoveredNodeId || neighborIds.has(nodeId);
    },
    [hoveredNodeId, neighborIds]
  );

  const isNodeDimmed = useCallback(
    (nodeId: string) => {
      if (!hoveredNodeId) return false;
      return !isNodeHighlighted(nodeId);
    },
    [hoveredNodeId, isNodeHighlighted]
  );

  const isEdgeHighlighted = useCallback(
    (edge: GraphEdge) => {
      if (!hoveredNodeId) return false;
      return edge.from === hoveredNodeId || edge.to === hoveredNodeId;
    },
    [hoveredNodeId]
  );

  const isEdgeDimmed = useCallback(
    (edge: GraphEdge) => {
      if (!hoveredNodeId) return false;
      return !isEdgeHighlighted(edge);
    },
    [hoveredNodeId, isEdgeHighlighted]
  );

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={viewBox}
        className="w-full min-w-[600px]"
        style={{ height: `${bounds.height}px`, maxHeight: "500px" }}
        role="img"
        aria-label={`Knowledge graph: ${graph.title}`}
      >
        <title>{graph.title}</title>
        <desc>
          A knowledge graph showing {graph.nodes.length} nodes and{" "}
          {graph.edges.length} connections in the {graph.title}.
        </desc>

        {graph.edges.map((edge) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <GraphEdgeLine
              key={`${edge.from}-${edge.to}-${edge.kind}`}
              edge={edge}
              fromNode={fromNode}
              toNode={toNode}
              isHighlighted={isEdgeHighlighted(edge)}
              isDimmed={isEdgeDimmed(edge)}
            />
          );
        })}

        {graph.nodes.map((node) => (
          <GraphNodeCircle
            key={node.id}
            node={node}
            isHighlighted={isNodeHighlighted(node.id)}
            isDimmed={isNodeDimmed(node.id)}
            onHover={() => setHoveredNodeId(node.id)}
            onLeave={() => setHoveredNodeId(null)}
            onClick={() => {
              if (node.href) {
                router.push(node.href);
              }
            }}
          />
        ))}
      </svg>
    </div>
  );
}
