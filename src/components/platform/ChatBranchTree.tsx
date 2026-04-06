import { useState } from "react";
import { ChevronDown, GitBranch, Circle, CheckCircle2, AlertCircle } from "lucide-react";
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
  isBranch?: boolean;
  branchId?: string;
  branchChildren?: BranchTreeNode[];
}

interface ChatBranchTreeProps {
  nodes: BranchTreeNode[];
  onSelectNode?: (nodeId: string) => void;
  onSelectBranch?: (branchId: string) => void;
}

export function ChatBranchTree({ nodes, onSelectNode, onSelectBranch }: ChatBranchTreeProps) {
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
            <LinearTree key={node.id} node={node} onSelect={onSelectNode} onSelectBranch={onSelectBranch} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Renders the main thread as a vertical line of dots,
 * with branches diverging to the right via dashed connector lines.
 */
function LinearTree({
  node,
  onSelect,
  onSelectBranch,
}: {
  node: BranchTreeNode;
  onSelect?: (id: string) => void;
  onSelectBranch?: (branchId: string) => void;
}) {
  // Flatten the linear chain (follow first non-branch child)
  const mainChain: BranchTreeNode[] = [];
  let current: BranchTreeNode | undefined = node;
  while (current) {
    mainChain.push(current);
    // Find the main (non-branch) child
    const children = current.children || [];
    current = children.find((c) => !c.isBranch);
  }

  return (
    <div className="relative pl-4">
      {/* Vertical connector line */}
      {mainChain.length > 1 && (
        <div
          className="absolute left-[19px] top-[14px] w-px bg-blue-400"
          style={{ height: `calc(100% - 14px)` }}
        />
      )}

      {mainChain.map((item, idx) => {
        // Get branch children at this node
        const branchKids = item.branchChildren || (item.children || []).filter((c) => c.isBranch);

        return (
          <div key={item.id} className="relative">
            {/* Main node row */}
            <button
              onClick={() => {
                if (item.branchId) {
                  onSelectBranch?.(item.branchId);
                } else {
                  onSelect?.(item.id);
                }
              }}
              className={cn(
                "flex items-center gap-2 w-full text-left py-1.5 px-1 rounded-md text-sm transition-colors hover:bg-secondary relative z-10",
                item.isActive && "font-medium"
              )}
            >
              <NodeDot status={item.status} />
              <span className="truncate text-muted-foreground text-xs flex-1">
                {item.label}
              </span>
              {item.isMain && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                  main
                </span>
              )}
              {item.emoji && (
                <span className="shrink-0 text-xs">{item.emoji}</span>
              )}
            </button>

            {/* Branch divergence — rendered to the right with dashed connector */}
            {branchKids.length > 0 && (
              <div className="ml-4 relative">
                {branchKids.map((branch) => (
                  <BranchLine
                    key={branch.id}
                    node={branch}
                    onSelect={onSelect}
                    onSelectBranch={onSelectBranch}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BranchLine({
  node,
  onSelect,
  onSelectBranch,
}: {
  node: BranchTreeNode;
  onSelect?: (id: string) => void;
  onSelectBranch?: (branchId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  // Flatten branch chain
  const chain: BranchTreeNode[] = [];
  let current: BranchTreeNode | undefined = node;
  while (current) {
    chain.push(current);
    const children = current.children || [];
    current = children.find((c) => !c.isBranch);
  }

  return (
    <div className="relative pl-3 mb-1">
      {/* Dashed horizontal + vertical connector */}
      <div className="absolute left-0 top-[14px] w-3 border-t border-dashed border-amber-400" />
      {chain.length > 1 && expanded && (
        <div
          className="absolute left-[11px] top-[14px] w-px border-l border-dashed border-amber-400"
          style={{ height: `calc(100% - 14px)` }}
        />
      )}

      {/* Branch label */}
      {node.branchLabel && (
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
            {node.branchLabel}
          </span>
          {chain.length > 1 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 rounded hover:bg-secondary"
            >
              <ChevronDown className={cn("w-2.5 h-2.5 text-muted-foreground transition-transform", !expanded && "-rotate-90")} />
            </button>
          )}
        </div>
      )}

      {(expanded ? chain : chain.slice(0, 1)).map((item) => {
        const branchKids = item.branchChildren || (item.children || []).filter((c) => c.isBranch);
        return (
          <div key={item.id} className="relative">
            <button
              onClick={() => {
                if (item.branchId) {
                  onSelectBranch?.(item.branchId);
                } else {
                  onSelect?.(item.id);
                }
              }}
              className={cn(
                "flex items-center gap-2 w-full text-left py-1 px-1 rounded-md text-sm transition-colors hover:bg-secondary",
                item.isActive && "font-medium"
              )}
            >
              <NodeDot status={item.status} isBranch />
              <span className="truncate text-muted-foreground text-xs">
                {item.label}
              </span>
            </button>
            {branchKids.length > 0 && (
              <div className="ml-4">
                {branchKids.map((b) => (
                  <BranchLine key={b.id} node={b} onSelect={onSelect} onSelectBranch={onSelectBranch} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NodeDot({ status, isBranch }: { status: BranchTreeNode["status"]; isBranch?: boolean }) {
  if (status === "active") {
    return (
      <span className="relative shrink-0 flex items-center justify-center w-3 h-3">
        <span className={cn(
          "w-2 h-2 rounded-full",
          isBranch ? "bg-amber-500" : "bg-blue-500"
        )} />
        <span className={cn(
          "absolute w-3 h-3 rounded-full animate-ping opacity-30",
          isBranch ? "bg-amber-400" : "bg-blue-400"
        )} />
      </span>
    );
  }
  if (status === "complete") {
    return <CheckCircle2 className={cn("w-3 h-3 shrink-0", isBranch ? "text-amber-500" : "text-blue-500")} />;
  }
  if (status === "warning") {
    return <AlertCircle className="w-3 h-3 shrink-0 text-amber-500" />;
  }
  return (
    <span className="shrink-0 flex items-center justify-center w-3 h-3">
      <span className={cn(
        "w-2 h-2 rounded-full",
        isBranch ? "bg-amber-400/60" : "bg-blue-400/60"
      )} />
    </span>
  );
}
