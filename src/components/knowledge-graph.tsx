"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
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

// Plain SVG chevron paths (no nested svg elements)
function ChevronRightIcon({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <path
      d={`M ${x + size * 0.3} ${y + size * 0.2} L ${x + size * 0.7} ${y + size * 0.5} L ${x + size * 0.3} ${y + size * 0.8}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={size * 0.15}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function ChevronDownIcon({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <path
      d={`M ${x + size * 0.2} ${y + size * 0.3} L ${x + size * 0.5} ${y + size * 0.7} L ${x + size * 0.8} ${y + size * 0.3}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={size * 0.15}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function GraphEdgeLine({
  fromNode,
  toNode,
  isHighlighted,
  isDimmed,
}: {
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
  const chevronSize = 12;

  return (
    <g
      opacity={opacity}
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
          style={{ cursor: "pointer" }}
        >
          <rect
            x={node.x - 8}
            y={node.y - 8}
            width={16}
            height={16}
            fill="transparent"
          />
          {isCollapsed ? (
            <ChevronRightIcon x={node.x - 6} y={node.y - 6} size={chevronSize} />
          ) : (
            <ChevronDownIcon x={node.x - 6} y={node.y - 6} size={chevronSize} />
          )}
        </g>
      )}

      {/* Node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={isHighlighted ? NODE_RADIUS + 1.5 : NODE_RADIUS}
        fill="currentColor"
      />

      {/* Node label */}
      <text
        x={node.x + (hasChildren ? 12 : 10)}
        y={node.y + 4}
        fontSize={10}
        fontFamily="var(--font-ibm-plex-sans), sans-serif"
        fill="currentColor"
      >
        {node.label}
      </text>

      {/* Type label */}
      <text
        x={node.x + (hasChildren ? 12 : 10)}
        y={node.y - 8}
        fontSize={8}
        fontFamily="var(--font-ibm-plex-mono), monospace"
        fill="currentColor"
        opacity={0.5}
        style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
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
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  // Get graph bounds (memoized)
  const bounds = useMemo(() => getGraphBounds(graph), [graph]);
  
  // Initialize camera to show the full graph bounds
  const [camera, setCamera] = useState<Camera>(() => {
    // Start with a view that shows all nodes
    const padding = 100;
    return {
      x: bounds.minX - padding,
      y: bounds.minY - padding,
      scale: 0.08, // Start very zoomed out to guarantee nodes are visible
    };
  });
  
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
    const { width, height } = containerSize;
    if (width === 0 || height === 0) return;
    
    const scaleX = width / bounds.width;
    const scaleY = height / bounds.height;
    const newScale = Math.min(scaleX, scaleY) * 0.85;
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    // Center the view on the graph bounds
    const viewWidth = width / clampedScale;
    const viewHeight = height / clampedScale;
    
    setCamera({
      x: bounds.minX + (bounds.width - viewWidth) / 2,
      y: bounds.minY + (bounds.height - viewHeight) / 2,
      scale: clampedScale,
    });
  }, [bounds, containerSize]);

  // Measure container and fit to view on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    // Initial measurement
    updateSize();

    // Use ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Fit to view when container size is known
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      fitToView();
    }
  }, [containerSize.width, containerSize.height, fitToView]);

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const { width, height } = containerSize;
      if (width === 0 || height === 0) return;
      
      const viewWidth = width / camera.scale;
      const viewHeight = height / camera.scale;
      const dx = ((e.clientX - panStart.x) / width) * viewWidth;
      const dy = ((e.clientY - panStart.y) / height) * viewHeight;
      
      setCamera((prev) => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    },
    [isPanning, panStart, camera.scale, containerSize]
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

  // Calculate viewBox from camera and container size
  const viewWidth = containerSize.width / camera.scale;
  const viewHeight = containerSize.height / camera.scale;
  const viewBox = `${camera.x} ${camera.y} ${viewWidth} ${viewHeight}`;

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
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Knowledge graph: ${graph.title} with ${visibleNodes.length} visible nodes`}
        style={{ color: "var(--foreground)" }}
      >
        <title>{graph.title}</title>
        <desc>
          A knowledge graph showing {visibleNodes.length} of {graph.nodes.length} nodes.
          Use scroll to zoom, drag to pan. Click chevrons to expand/collapse.
        </desc>

        {/* Edges */}
        <g>
          {visibleEdges.map((edge) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            return (
              <GraphEdgeLine
                key={`${edge.from}-${edge.to}-${edge.kind}`}
                fromNode={fromNode}
                toNode={toNode}
                isHighlighted={isEdgeHighlighted(edge)}
                isDimmed={isEdgeDimmed(edge)}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
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
