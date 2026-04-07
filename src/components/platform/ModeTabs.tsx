import { ChevronLeft, ChevronRight } from "lucide-react";

interface PanelHeaderProps {
  label: string;
  icon: React.ElementType;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function PanelHeader({ label, icon: Icon, isCollapsed, onToggleCollapse }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-secondary/30 shrink-0">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        {!isCollapsed && (
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
      <button
        onClick={onToggleCollapse}
        className="p-1 rounded hover:bg-secondary transition-colors"
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
