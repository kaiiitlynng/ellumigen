import { MessageSquare, FileCode, Layout, ChevronLeft, ChevronRight } from "lucide-react";
import type { InterfaceMode } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ModeTabsProps {
  activeModes: InterfaceMode[];
  onToggleMode: (mode: InterfaceMode) => void;
}

const modes: { id: InterfaceMode; label: string; icon: React.ElementType }[] = [
  { id: "conversation", label: "Chat", icon: MessageSquare },
  { id: "freeform", label: "Canvas", icon: Layout },
  { id: "notebook", label: "Code", icon: FileCode },
];

export function ModeTabs({ activeModes, onToggleMode }: ModeTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = activeModes.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onToggleMode(m.id)}
            className={cn(
              "mode-tab flex items-center gap-1.5",
              isActive && "mode-tab-active bg-background shadow-sm"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

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
