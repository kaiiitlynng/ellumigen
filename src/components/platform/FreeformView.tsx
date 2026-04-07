import { useState, useCallback, useRef, useEffect } from "react";
import {
  MousePointer2,
  StickyNote,
  Type,
  Image,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GripVertical,
  X,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { VolcanoPlot } from "./chat/VolcanoPlot";
import { HeatmapChart } from "./chat/HeatmapChart";
import { DataTable } from "./chat/DataTable";

export interface CanvasNode {
  id: string;
  type: "note" | "text" | "image" | "chart" | "volcano" | "heatmap" | "datatable";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
}

const NOTE_COLORS = [
  "hsl(48, 96%, 89%)",   // yellow
  "hsl(142, 72%, 87%)",  // green
  "hsl(217, 91%, 90%)",  // blue
  "hsl(330, 81%, 91%)",  // pink
  "hsl(270, 67%, 91%)",  // purple
];

const DEMO_NODES: CanvasNode[] = [
  {
    id: "n1",
    type: "note",
    x: 80,
    y: 60,
    width: 240,
    height: 160,
    content: "Hypothesis: TP53 mutations drive distinct transcriptional programs in BRCA subtypes",
    color: NOTE_COLORS[0],
  },
  {
    id: "n2",
    type: "note",
    x: 380,
    y: 80,
    width: 220,
    height: 140,
    content: "Check DESeq2 results for top 50 genes\n\n→ Compare with COSMIC census",
    color: NOTE_COLORS[2],
  },
  {
    id: "n3",
    type: "text",
    x: 120,
    y: 280,
    width: 300,
    height: 80,
    content: "Key pathway: p53 signaling (KEGG hsa04115) — 14 genes overlap with DEG list",
  },
  {
    id: "n4",
    type: "note",
    x: 660,
    y: 60,
    width: 200,
    height: 120,
    content: "TODO: Run survival analysis stratified by TP53 status × PAM50 subtype",
    color: NOTE_COLORS[3],
  },
  {
    id: "n5",
    type: "chart",
    x: 480,
    y: 260,
    width: 280,
    height: 180,
    content: "Gene Expression Distribution",
  },
];

let nodeCounter = 20;

export function FreeformView({ onNodeAdded }: { onNodeAdded?: () => void } = {}) {
  const [nodes, setNodes] = useState<CanvasNode[]>(DEMO_NODES);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "note" | "text">("select");
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const addNode = useCallback(
    (type: CanvasNode["type"], x?: number, y?: number) => {
      const newNode: CanvasNode = {
        id: `node-${++nodeCounter}`,
        type,
        x: x ?? 100 + Math.random() * 400,
        y: y ?? 100 + Math.random() * 300,
        width: type === "note" ? 220 : type === "chart" ? 280 : 260,
        height: type === "note" ? 140 : type === "chart" ? 180 : 60,
        content: type === "note" ? "New note…" : type === "chart" ? "Chart placeholder" : "New text block",
        color: type === "note" ? NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)] : undefined,
      };
      setNodes((prev) => [...prev, newNode]);
      setEditingId(newNode.id);
      setActiveTool("select");
    },
    []
  );

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) setEditingId(null);
  }, [editingId]);

  const updateNodeContent = useCallback((id: string, content: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, content } : n)));
  }, []);

  // Mouse handlers for dragging nodes
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (editingId === id) return;
      e.stopPropagation();
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      setDraggingId(id);
      setDragOffset({
        x: e.clientX / zoom - node.x - pan.x / zoom,
        y: e.clientY / zoom - node.y - pan.y / zoom,
      });
    },
    [nodes, zoom, pan, editingId]
  );

  // Canvas click to add node when tool is active
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === "note" || activeTool === "text") {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        addNode(activeTool, x, y);
      } else {
        setEditingId(null);
      }
    },
    [activeTool, pan, zoom, addNode]
  );

  // Canvas panning
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current && activeTool === "select") {
      isPanning.current = true;
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  }, [pan, activeTool]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId) {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === draggingId
              ? {
                  ...n,
                  x: e.clientX / zoom - dragOffset.x - pan.x / zoom,
                  y: e.clientY / zoom - dragOffset.y - pan.y / zoom,
                }
              : n
          )
        );
      }
      if (isPanning.current) {
        setPan({
          x: e.clientX - panStart.current.x,
          y: e.clientY - panStart.current.y,
        });
      }
    };
    const handleMouseUp = () => {
      setDraggingId(null);
      isPanning.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, dragOffset, zoom, pan]);

  // Zoom with scroll
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => Math.max(0.3, Math.min(2, z - e.deltaY * 0.002)));
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-background">
        <ToolButton
          icon={MousePointer2}
          label="Select"
          active={activeTool === "select"}
          onClick={() => setActiveTool("select")}
        />
        <ToolButton
          icon={StickyNote}
          label="Note"
          active={activeTool === "note"}
          onClick={() => setActiveTool("note")}
        />
        <ToolButton
          icon={Type}
          label="Text"
          active={activeTool === "text"}
          onClick={() => setActiveTool("text")}
        />
        <div className="w-px h-5 bg-border mx-1" />
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground font-mono w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          title="Reset view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="ml-auto text-xs text-muted-foreground">
          {nodes.length} items on canvas
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-hidden relative cursor-default"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.35) 1.2px, transparent 1.2px)`,
          backgroundSize: `20px 20px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("application/ellumigen-viz")) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }
        }}
        onDrop={(e) => {
          const vizData = e.dataTransfer.getData("application/ellumigen-viz");
          if (!vizData) return;
          e.preventDefault();
          const { type, title } = JSON.parse(vizData);
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = (e.clientX - rect.left - pan.x) / zoom;
          const y = (e.clientY - rect.top - pan.y) / zoom;
          const vizType = type as "volcano" | "heatmap" | "datatable";
          const newNode: CanvasNode = {
            id: `node-${++nodeCounter}`,
            type: vizType,
            x,
            y,
            width: vizType === "datatable" ? 400 : 360,
            height: vizType === "datatable" ? 300 : 280,
            content: title,
          };
          setNodes((prev) => [...prev, newNode]);
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {nodes.map((node) => (
            <CanvasNodeComponent
              key={node.id}
              node={node}
              isEditing={editingId === node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onDoubleClick={() => setEditingId(node.id)}
              onUpdate={(content) => updateNodeContent(node.id, content)}
              onDelete={() => deleteNode(node.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
      title={label}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function CanvasNodeComponent({
  node,
  isEditing,
  onMouseDown,
  onDoubleClick,
  onUpdate,
  onDelete,
}: {
  node: CanvasNode;
  isEditing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute group"
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: node.height,
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="w-3 h-3" />
      </button>

      {node.type === "note" ? (
        <div
          className="rounded-lg shadow-md p-4 cursor-move select-none h-full"
          style={{ backgroundColor: node.color || NOTE_COLORS[0] }}
        >
          {isEditing ? (
            <textarea
              autoFocus
              value={node.content}
              onChange={(e) => onUpdate(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full bg-transparent text-sm text-gray-800 resize-none focus:outline-none"
            />
          ) : (
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{node.content}</p>
          )}
        </div>
      ) : node.type === "text" ? (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm cursor-move select-none h-full">
          {isEditing ? (
            <textarea
              autoFocus
              value={node.content}
              onChange={(e) => onUpdate(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full bg-transparent text-sm text-foreground resize-none focus:outline-none"
            />
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap">{node.content}</p>
          )}
        </div>
      ) : node.type === "chart" ? (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm cursor-move select-none">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">{node.content}</span>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {[65, 40, 80, 55, 90, 35, 70, 50, 85, 45].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/60 transition-all hover:bg-primary"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-muted-foreground">Sample 1</span>
            <span className="text-[9px] text-muted-foreground">Sample 10</span>
          </div>
        </div>
      ) : node.type === "volcano" ? (
        <div className="rounded-lg border border-border bg-card shadow-sm cursor-move select-none overflow-hidden">
          <VolcanoPlot />
        </div>
      ) : node.type === "heatmap" ? (
        <div className="rounded-lg border border-border bg-card shadow-sm cursor-move select-none overflow-hidden">
          <HeatmapChart />
        </div>
      ) : node.type === "datatable" ? (
        <div className="rounded-lg border border-border bg-card shadow-sm cursor-move select-none overflow-auto p-3">
          <DataTable
            columns={[
              { key: "disease", label: "Disease" },
              { key: "sample_count", label: "Sample_count" },
            ]}
            data={[
              { disease: "melanoma", sample_count: 48 },
              { disease: "normal", sample_count: 171 },
              { disease: "breast cancer", sample_count: 83 },
              { disease: "adenocarcinoma", sample_count: 73 },
              { disease: "copd", sample_count: 98 },
              { disease: "acute monocytic leukemia", sample_count: 45 },
              { disease: "colorectal carcinoma", sample_count: 161 },
            ]}
          />
        </div>
      ) : null}
    </motion.div>
  );
}
