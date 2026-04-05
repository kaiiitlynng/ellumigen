import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

interface DraggableVisualizationProps {
  type: "volcano" | "heatmap" | "datatable";
  title: string;
  children: ReactNode;
}

export function DraggableVisualization({ type, title, children }: DraggableVisualizationProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/ellumigen-viz",
      JSON.stringify({ type, title })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="relative group/drag">
      <div
        draggable
        onDragStart={handleDragStart}
        className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/80 backdrop-blur-sm border border-border text-muted-foreground opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        title="Drag to Canvas"
      >
        <GripVertical className="w-3 h-3" />
        <span className="text-[10px] font-medium">Drag to Canvas</span>
      </div>
      {children}
    </div>
  );
}
