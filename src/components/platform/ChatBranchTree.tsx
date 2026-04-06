import { useState } from "react";
import { ChevronDown, GitBranch, Circle, CheckCircle2, AlertCircle, Smile } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface BranchTreeNode {
  id: string;
  label: string;
  isMain?: boolean;
  isActive?: boolean;
  status: "active" | "complete" | "warning" | "idle";
  emoji?: string;
  children?: BranchTreeNode[];
  depth?: number;
  category?: "hypothesis" | "data" | "analysis" | "exploration";
  description?: string;
  branchLabel?: string;
}

interface ChatBranchTreeProps {
  nodes: BranchTreeNode[];
  onSelectNode?: (nodeId: string) => void;
}

export function ChatBranchTree({ nodes, onSelectNode }: ChatBranchTreeProps) {
  return (
    <Collapsible defaultOpen className="px-3">
      <CollapsibleTrigger className="section-label flex items-center gap-1 w-full">
        <GitBranch className="w-3 h-3" />
        Current Chat
        <ChevronDown className="w-3 h-3 ml-auto transition-transform duration-200 [[data-state=closed]>&]:rotate-[-90deg]" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <div className="space-y-0">
          {nodes.map((node) => (
            <TreeNode key={node.id} node={node} depth={0} onSelect={onSelectNode} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function TreeNode({
  node,
  depth,
  onSelect,
}: {
  node: BranchTreeNode;
  depth: number;
  onSelect?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const statusIcon = {
    active: <Circle className="w-2.5 h-2.5 fill-blue-500 text-blue-500" />,
    complete: <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />,
    warning: <AlertCircle className="w-2.5 h-2.5 text-amber-500" />,
    idle: <Circle className="w-2.5 h-2.5 text-muted-foreground" />,
  };

  return (
    <div>
      <button
        onClick={() => onSelect?.(node.id)}
        className={cn(
          "flex items-center gap-2 w-full text-left py-1 px-2 rounded-md text-sm transition-colors hover:bg-secondary",
          node.isActive && "bg-secondary font-medium"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Vertical line connector */}
        {depth > 0 && (
          <div
            className="absolute border-l border-border"
            style={{ left: `${depth * 16 + 4}px`, height: "100%" }}
          />
        )}

        {/* Status dot */}
        <span className="shrink-0">{statusIcon[node.status]}</span>

        {/* Label */}
        <span className="truncate text-muted-foreground text-xs">
          {node.label}
        </span>

        {/* Badges */}
        {node.isMain && (
          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
            main
          </span>
        )}
        {node.emoji && (
          <span className="shrink-0 text-xs">{node.emoji}</span>
        )}

        {hasChildren && (
          <ChevronDown
            className={cn(
              "w-3 h-3 ml-auto shrink-0 text-muted-foreground transition-transform",
              !expanded && "-rotate-90"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          />
        )}
      </button>

      {hasChildren && expanded && (
        <div className="relative">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
