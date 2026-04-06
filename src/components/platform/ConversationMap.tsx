import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Merge, Map } from "lucide-react";
import type { BranchNodeCategory } from "@/types/chat";
import { cn } from "@/lib/utils";

export interface MapNode {
  id: string;
  label: string;
  description: string;
  category: BranchNodeCategory;
  parentId?: string;
  children: string[];
  isMain?: boolean;
  branchLabel?: string;
  isBranch?: boolean;
}

interface ConversationMapProps {
  title: string;
  subtitle?: string;
  nodes: MapNode[];
  activeNodeId?: string;
  onSelectNode?: (nodeId: string) => void;
  onAddBranch?: (parentNodeId: string) => void;
  onBringToMain?: () => void;
  onReturnToMain?: () => void;
  onClose: () => void;
  isOnBranch?: boolean;
}

const CATEGORY_STYLES: Record<BranchNodeCategory, { bg: string; text: string; label: string }> = {
  hypothesis: { bg: "bg-emerald-100", text: "text-emerald-700", label: "HYPOTHESIS" },
  data: { bg: "bg-amber-100", text: "text-amber-700", label: "DATA" },
  analysis: { bg: "bg-red-100", text: "text-red-700", label: "ANALYSIS" },
  exploration: { bg: "bg-violet-100", text: "text-violet-700", label: "EXPLORATION" },
};

export function ConversationMap({
  title,
  subtitle,
  nodes,
  activeNodeId,
  onSelectNode,
  onAddBranch,
  onBringToMain,
  onReturnToMain,
  onClose,
  isOnBranch,
}: ConversationMapProps) {
  // Build a tree structure from flat nodes
  const rootNodes = nodes.filter((n) => !n.parentId);
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          {subtitle && (
            <span className="text-sm text-muted-foreground">
              Exploring: {title} – {subtitle}
            </span>
          )}
          {!subtitle && (
            <span className="text-sm text-muted-foreground">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOnBranch && (
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
        </div>
      </header>

      {/* Map title bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <h2 className="text-lg font-medium text-muted-foreground">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Map className="w-3.5 h-3.5" />
            Conversation Map
          </button>
        </div>
      </div>

      {/* Map content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="flex flex-col items-center gap-0 min-w-fit">
          {rootNodes.map((node) => (
            <NodeTree
              key={node.id}
              node={node}
              nodeMap={nodeMap}
              activeNodeId={activeNodeId}
              onSelectNode={onSelectNode}
              onAddBranch={onAddBranch}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NodeTree({
  node,
  nodeMap,
  activeNodeId,
  onSelectNode,
  onAddBranch,
}: {
  node: MapNode;
  nodeMap: Record<string, MapNode>;
  activeNodeId?: string;
  onSelectNode?: (id: string) => void;
  onAddBranch?: (parentId: string) => void;
}) {
  const children = node.children.map((id) => nodeMap[id]).filter(Boolean);
  const style = CATEGORY_STYLES[node.category];
  const isActive = node.id === activeNodeId;
  const hasBranches = children.length > 1;

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => onSelectNode?.(node.id)}
        className={cn(
          "w-[280px] p-4 rounded-xl border text-left transition-all hover:shadow-md",
          isActive
            ? "border-primary shadow-md ring-2 ring-primary/20"
            : "border-border bg-background"
        )}
      >
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", style.bg, style.text)}>
          {style.label}
        </span>
        <h3 className="text-sm font-semibold text-foreground mt-2">{node.label}</h3>
        <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
      </motion.button>

      {/* Connector line down */}
      {children.length > 0 && (
        <div className="w-px h-8 bg-border" />
      )}

      {/* Branch point */}
      {hasBranches ? (
        <div className="relative flex flex-col items-center">
          {/* Horizontal line across branches */}
          <div className="flex items-start gap-12">
            {children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Branch label */}
                <div className="mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {child.branchLabel || `Branch ${i + 1}`}
                  </span>
                </div>
                {/* Connector */}
                <div className="w-px h-4 bg-border" />
                {/* Recursive tree */}
                <NodeTree
                  node={child}
                  nodeMap={nodeMap}
                  activeNodeId={activeNodeId}
                  onSelectNode={onSelectNode}
                  onAddBranch={onAddBranch}
                />
              </div>
            ))}
          </div>
        </div>
      ) : children.length === 1 ? (
        <NodeTree
          node={children[0]}
          nodeMap={nodeMap}
          activeNodeId={activeNodeId}
          onSelectNode={onSelectNode}
          onAddBranch={onAddBranch}
        />
      ) : null}

      {/* Add branch button at leaf nodes */}
      {children.length === 0 && (
        <>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => onAddBranch?.(node.id)}
            className="w-7 h-7 rounded-full border border-dashed border-border flex items-center justify-center hover:bg-secondary hover:border-muted-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </>
      )}
    </div>
  );
}
