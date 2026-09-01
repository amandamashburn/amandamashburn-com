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

// Visual constants - sized for an explorable map feel
const NODE_RADIUS = 8;
const NODE_RADIUS_HOVER = 10;
const EDGE_WIDTH = 1.5;
const EDGE_WIDTH_HOVER = 2.5;
const LABEL_FONT_SIZE = 14;
const TYPE_FONT_SIZE = 10;
const MIN_SCALE = 0.03;  // Can zoom way out to see full map
const MAX_SCALE = 1.5;   // Can zoom in to read details
const ZOOM_FACTOR = 1.15; // Smooth zoom steps

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
  // Higher contrast: normal edges visible, dimmed still faint, highlighted bold
  const opacity = isDimmed ? 0.12 : isHighlighted ? 1 : 0.5;
  const width = isHighlighted ? EDGE_WIDTH_HOVER : EDGE_WIDTH;

  return (
    <line
      x1={fromNode.x}
      y1={fromNode.y}
      x2={toNode.x}
      y2={toNode.y}
      stroke="currentColor"
      strokeWidth={width}
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
  // Higher contrast: normal nodes solid, dimmed fainter but still visible
  const opacity = isDimmed ? 0.25 : 1;
  const chevronSize = 18;
  const radius = isHighlighted ? NODE_RADIUS_HOVER : NODE_RADIUS;

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
      style={{ cursor: "pointer" }}
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
        >
          <rect
            x={node.x - chevronSize / 2}
            y={node.y - chevronSize / 2}
            width={chevronSize}
            height={chevronSize}
            fill="transparent"
          />
          <g opacity={0.7}>
            {isCollapsed ? (
              <ChevronRightIcon x={node.x - chevronSize / 2} y={node.y - chevronSize / 2} size={chevronSize} />
            ) : (
              <ChevronDownIcon x={node.x - chevronSize / 2} y={node.y - chevronSize / 2} size={chevronSize} />
            )}
          </g>
        </g>
      )}

      {/* Node circle - larger and more prominent */}
      <circle
        cx={node.x}
        cy={node.y}
        r={radius}
        fill="currentColor"
      />

      {/* Node label - larger, readable */}
      <text
        x={node.x + (hasChildren ? 16 : 14)}
        y={node.y + 5}
        fontSize={LABEL_FONT_SIZE}
        fontFamily="var(--font-ibm-plex-sans), system-ui, sans-serif"
        fontWeight={isHighlighted ? 500 : 400}
        fill="currentColor"
      >
        {node.label}
      </text>

      {/* Type label - smaller but still legible */}
      <text
        x={node.x + (hasChildren ? 16 : 14)}
        y={node.y - 12}
        fontSize={TYPE_FONT_SIZE}
        fontFamily="var(--font-ibm-plex-mono), monospace"
        fill="currentColor"
        opacity={0.6}
        style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
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
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-background/90 backdrop-blur-sm border border-foreground/20 rounded-lg p-1.5 shadow-sm">
      <button
        onClick={onZoomIn}
        disabled={scale >= MAX_SCALE}
        className="p-2 rounded-md hover:bg-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIn size={18} className="text-foreground" />
      </button>
      <button
        onClick={onZoomOut}
        disabled={scale <= MIN_SCALE}
        className="p-2 rounded-md hover:bg-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom out"
      >
        <ZoomOut size={18} className="text-foreground" />
      </button>
      <div className="h-px bg-foreground/15 my-1" />
      <button
        onClick={onFitToView}
        className="p-2 rounded-md hover:bg-foreground/10 transition-colors"
        aria-label="Fit to view"
      >
        <Maximize2 size={18} className="text-foreground" />
      </button>
      <div className="text-center font-mono text-xs text-foreground/70 py-1 tabular-nums">
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
  
  // Initialize camera to show the full graph
  const [camera, setCamera] = useState<Camera>(() => ({
    x: bounds.minX,
    y: bounds.minY,
    scale: 0.06,
  }));
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [cameraStart, setCameraStart] = useState({ x: 0, y: 0 });

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

  // Fit to view - frames the entire graph
  const fitToView = useCallback(() => {
    const { width, height } = containerSize;
    if (width === 0 || height === 0) return;
    
    // Calculate scale to fit graph with padding
    const scaleX = width / bounds.width;
    const scaleY = height / bounds.height;
    const newScale = Math.min(scaleX, scaleY) * 0.85;
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    // Center the graph in the viewport
    const viewWidth = width / clampedScale;
    const viewHeight = height / clampedScale;
    
    setCamera({
      x: bounds.minX + (bounds.width - viewWidth) / 2,
      y: bounds.minY + (bounds.height - viewHeight) / 2,
      scale: clampedScale,
    });
  }, [bounds, containerSize]);

  // Zoom toward cursor position
  const zoomAtPoint = useCallback((newScale: number, clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    
    // Get cursor position relative to container
    const cursorX = clientX - rect.left;
    const cursorY = clientY - rect.top;
    
    // Convert to world coordinates at current scale
    const worldX = camera.x + (cursorX / camera.scale);
    const worldY = camera.y + (cursorY / camera.scale);
    
    // Calculate new camera position to keep cursor point fixed
    const newCameraX = worldX - (cursorX / clampedScale);
    const newCameraY = worldY - (cursorY / clampedScale);
    
    setCamera({
      x: newCameraX,
      y: newCameraY,
      scale: clampedScale,
    });
  }, [camera]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    zoomAtPoint(camera.scale * ZOOM_FACTOR, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [camera.scale, zoomAtPoint]);

  const zoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    zoomAtPoint(camera.scale / ZOOM_FACTOR, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [camera.scale, zoomAtPoint]);

  // Measure container and fit to view on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    updateSize();

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

  // Pan handlers - 1:1 tracking
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setCameraStart({ x: camera.x, y: camera.y });
    },
    [camera.x, camera.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      
      // Direct 1:1 pixel-to-world mapping
      const dx = (e.clientX - panStart.x) / camera.scale;
      const dy = (e.clientY - panStart.y) / camera.scale;
      
      setCamera((prev) => ({
        ...prev,
        x: cameraStart.x - dx,
        y: cameraStart.y - dy,
      }));
    },
    [isPanning, panStart, cameraStart, camera.scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel zoom toward cursor
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      zoomAtPoint(camera.scale * factor, e.clientX, e.clientY);
    },
    [camera.scale, zoomAtPoint]
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
      className="relative w-full h-[700px] overflow-hidden bg-background border border-foreground/15 rounded-lg"
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
          Scroll to zoom, drag to pan. Click nodes with chevrons to expand/collapse.
        </desc>

        {/* Edges - render first so they're behind nodes */}
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
      <div className="absolute top-4 left-4 font-mono text-xs text-foreground/70 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-foreground/15">
        {visibleNodes.length} / {graph.nodes.length} nodes
      </div>
    </div>
  );
}
