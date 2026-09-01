"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import {
  type Graph,
  type GraphNode,
  type GraphEdge,
  getNeighborIds,
  getGraphBounds,
  buildContainsTree,
  getContainsDescendants,
  hasContainsChildren,
} from "@/lib/graph";

interface KnowledgeGraphProps {
  graph: Graph;
}

const NODE_RADIUS = 5;
const MIN_SCALE = 0.1;
const MAX_SCALE = 2;
const ZOOM_STEP = 0.15;

interface Camera {
  x: number;
  y: number;
  scale: number;
}

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
  const opacity = isDimmed ? 0.08 : isHighlighted ? 0.8 : 0.25;

  return (
    <line
      x1={fromNode.x}
      y1={fromNode.y}
      x2={toNode.x}
      y2={toNode.y}
      stroke="currentColor"
      strokeWidth={isHighlighted ? 1.5 : 1}
      strokeOpacity={opacity}
      className="text-foreground transition-opacity duration-150"
      aria-hidden="true"
    />
  );
}

function GraphNodeElement({
  node,
  isHighlighted,
  isDimmed,
  isCollapsed,
  hasChildren,
  onHover,
  onLeave,
  onToggleCollapse,
}: {
  node: GraphNode;
  isHighlighted: boolean;
  isDimmed: boolean;
  isCollapsed: boolean;
  hasChildren: boolean;
  onHover: () => void;
  onLeave: () => void;
  onToggleCollapse: () => void;
}) {
  const opacity = isDimmed ? 0.15 : 1;

  return (
    <g
      className="transition-opacity duration-150"
      style={{ opacity }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      tabIndex={0}
      role="treeitem"
      aria-expanded={hasChildren ? !isCollapsed : undefined}
      aria-label={`${node.label} (${node.type})${hasChildren ? (isCollapsed ? " - collapsed" : " - expanded") : ""}`}
    >
      {/* Click target for expand/collapse */}
      {hasChildren && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleCollapse();
            }
          }}
          className="cursor-pointer"
        >
          <rect
            x={node.x - 8}
            y={node.y - 8}
            width={16}
            height={16}
            fill="transparent"
          />
          {isCollapsed ? (
            <ChevronRight
              x={node.x - 6}
              y={node.y - 6}
              width={12}
              height={12}
              className="text-muted-foreground"
            />
          ) : (
            <ChevronDown
              x={node.x - 6}
              y={node.y - 6}
              width={12}
              height={12}
              className="text-muted-foreground"
            />
          )}
        </g>
      )}

      {/* Node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={isHighlighted ? NODE_RADIUS + 1.5 : NODE_RADIUS}
        fill="currentColor"
        className="text-foreground transition-all duration-150"
      />

      {/* Node label */}
      <text
        x={node.x + (hasChildren ? 12 : 10)}
        y={node.y + 3}
        className="fill-current text-foreground font-sans text-[10px] select-none"
        style={{ pointerEvents: "none" }}
      >
        {node.label}
      </text>

      {/* Type label */}
      <text
        x={node.x + (hasChildren ? 12 : 10)}
        y={node.y - 8}
        className="fill-current text-muted-foreground font-mono text-[8px] uppercase tracking-wider select-none"
        style={{ pointerEvents: "none" }}
      >
        {node.type}
      </text>
    </g>
  );
}

function ZoomControls({
  onZoomIn,
  onZoomOut,
  onFitToView,
  scale,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  scale: number;
}) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-background/80 backdrop-blur-sm border border-foreground/10 rounded p-1">
      <button
        onClick={onZoomIn}
        disabled={scale >= MAX_SCALE}
        className="p-1.5 rounded hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIn size={16} className="text-foreground" />
      </button>
      <button
        onClick={onZoomOut}
        disabled={scale <= MIN_SCALE}
        className="p-1.5 rounded hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom out"
      >
        <ZoomOut size={16} className="text-foreground" />
      </button>
      <div className="h-px bg-foreground/10 my-0.5" />
      <button
        onClick={onFitToView}
        className="p-1.5 rounded hover:bg-foreground/5 transition-colors"
        aria-label="Fit to view"
      >
        <Maximize2 size={16} className="text-foreground" />
      </button>
      <div className="text-center font-mono text-[9px] text-muted-foreground py-1">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}

export function KnowledgeGraph({ graph }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 0.5 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Build contains tree once
  const childrenMap = useMemo(() => buildContainsTree(graph), [graph]);

  // Calculate which nodes are hidden due to collapsed ancestors
  const hiddenNodes = useMemo(() => {
    const hidden = new Set<string>();
    for (const collapsedId of collapsedNodes) {
      const descendants = getContainsDescendants(graph, collapsedId, childrenMap);
      for (const descId of descendants) {
        hidden.add(descId);
      }
    }
    return hidden;
  }, [graph, collapsedNodes, childrenMap]);

  // Get visible nodes
  const visibleNodeIds = useMemo(() => {
    return new Set(graph.nodes.filter((n) => !hiddenNodes.has(n.id)).map((n) => n.id));
  }, [graph, hiddenNodes]);

  // Filter edges to only show those between visible nodes
  const visibleEdges = useMemo(() => {
    return graph.edges.filter(
      (e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)
    );
  }, [graph, visibleNodeIds]);

  const bounds = useMemo(() => getGraphBounds(graph), [graph]);

  // Neighbor highlighting
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

  // Toggle collapse for a node
  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      scale: Math.min(MAX_SCALE, prev.scale + ZOOM_STEP),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      scale: Math.max(MIN_SCALE, prev.scale - ZOOM_STEP),
    }));
  }, []);

  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / bounds.width;
    const scaleY = rect.height / bounds.height;
    const newScale = Math.min(scaleX, scaleY, 1) * 0.9;

    setCamera({
      x: bounds.minX + bounds.width / 2 - rect.width / 2 / newScale,
      y: bounds.minY + bounds.height / 2 - rect.height / 2 / newScale,
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale)),
    });
  }, [bounds]);

  // Initial fit to view
  useEffect(() => {
    const timer = setTimeout(fitToView, 100);
    return () => clearTimeout(timer);
  }, [fitToView]);

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const dx = (e.clientX - panStart.x) / camera.scale;
      const dy = (e.clientY - panStart.y) / camera.scale;
      setCamera((prev) => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    },
    [isPanning, panStart, camera.scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setCamera((prev) => ({
        ...prev,
        scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale + delta)),
      }));
    },
    []
  );

  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph]
  );

  const visibleNodes = useMemo(
    () => graph.nodes.filter((n) => visibleNodeIds.has(n.id)),
    [graph, visibleNodeIds]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] overflow-hidden bg-background border border-foreground/10 rounded"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
    >
      <svg
        className="w-full h-full"
        style={{
          transform: `scale(${camera.scale}) translate(${-camera.x}px, ${-camera.y}px)`,
          transformOrigin: "0 0",
        }}
        role="img"
        aria-label={`Knowledge graph: ${graph.title} with ${visibleNodes.length} visible nodes`}
      >
        <title>{graph.title}</title>
        <desc>
          A knowledge graph showing {visibleNodes.length} of {graph.nodes.length} nodes.
          Use scroll to zoom, drag to pan. Click chevrons to expand/collapse.
        </desc>

        {/* Edges */}
        <g className="edges">
          {visibleEdges.map((edge) => {
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
        </g>

        {/* Nodes */}
        <g className="nodes">
          {visibleNodes.map((node) => (
            <GraphNodeElement
              key={node.id}
              node={node}
              isHighlighted={isNodeHighlighted(node.id)}
              isDimmed={isNodeDimmed(node.id)}
              isCollapsed={collapsedNodes.has(node.id)}
              hasChildren={hasContainsChildren(graph, node.id, childrenMap)}
              onHover={() => setHoveredNodeId(node.id)}
              onLeave={() => setHoveredNodeId(null)}
              onToggleCollapse={() => toggleCollapse(node.id)}
            />
          ))}
        </g>
      </svg>

      <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitToView={fitToView}
        scale={camera.scale}
      />

      {/* Node count indicator */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-foreground/10">
        {visibleNodes.length} / {graph.nodes.length} nodes
      </div>
    </div>
  );
}
