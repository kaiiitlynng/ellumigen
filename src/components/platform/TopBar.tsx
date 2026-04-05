import { Share2, User } from "lucide-react";
import { ModeTabs } from "./ModeTabs";
import type { InterfaceMode } from "@/types/chat";

interface TopBarProps {
  activeModes: InterfaceMode[];
  onToggleMode: (mode: InterfaceMode) => void;
}

export function TopBar({ activeModes, onToggleMode }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-background">
      <div />
      <ModeTabs activeModes={activeModes} onToggleMode={onToggleMode} />
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </header>
  );
}
