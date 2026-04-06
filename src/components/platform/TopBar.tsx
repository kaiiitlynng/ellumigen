import { Share2, User, Map, Merge, ArrowLeft } from "lucide-react";
import { ModeTabs } from "./ModeTabs";
import type { InterfaceMode } from "@/types/chat";

interface TopBarProps {
  activeModes: InterfaceMode[];
  onToggleMode: (mode: InterfaceMode) => void;
  branchContext?: {
    isOnBranch: boolean;
    branchTitle: string;
    parentTitle: string;
  };
  onOpenConversationMap?: () => void;
  onBringToMain?: () => void;
  onReturnToMain?: () => void;
}

export function TopBar({
  activeModes,
  onToggleMode,
  branchContext,
  onOpenConversationMap,
  onBringToMain,
  onReturnToMain,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-background">
      <div className="flex items-center gap-3 min-w-0">
        {branchContext?.isOnBranch && (
          <span className="text-sm text-muted-foreground truncate">
            Exploring: {branchContext.branchTitle} – from {branchContext.parentTitle}
          </span>
        )}
      </div>
      <ModeTabs activeModes={activeModes} onToggleMode={onToggleMode} />
      <div className="flex items-center gap-2">
        {branchContext?.isOnBranch && (
          <>
            <button
              onClick={onBringToMain}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Merge className="w-3.5 h-3.5" />
              Bring back to Main
            </button>
            <button
              onClick={onReturnToMain}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Main
            </button>
          </>
        )}
        <button
          onClick={onOpenConversationMap}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
        >
          <Map className="w-3.5 h-3.5" />
          Conversation Map
        </button>
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
