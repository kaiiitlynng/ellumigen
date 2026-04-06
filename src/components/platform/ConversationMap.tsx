import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { BranchNodeCategory } from "@/types/chat";

function formatTimeAgo(date?: Date): string {
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
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
  timestamp?: Date;
  merged?: boolean;
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
  const rootNodes = nodes.filter((n) => !n.parentId);
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Map title bar */}
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <h2 className="text-lg font-medium text-muted-foreground">{title}</h2>
      </div>

      {/* Map content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="flex flex-col items-center gap-0 min-w-fit" style={{ paddingRight: '400px' }}>
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

  const mainChild = children.find((c) => !c.isBranch);
  const branchChildren = children.filter((c) => c.isBranch);

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
        <div className="flex items-start justify-between gap-2">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", style.bg, style.text)}>
            {style.label}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
            {node.timestamp ? formatTimeAgo(node.timestamp instanceof Date ? node.timestamp : new Date(node.timestamp)) : "just now"}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground mt-2">{node.label}</h3>
        <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
      </motion.button>

      {/* Connectors + children */}
      {(mainChild || branchChildren.length > 0) && (
        <div className="relative flex flex-col items-center">
          {/* Vertical line segment: card bottom → dot center */}
          <div className="w-px bg-border" style={{ height: branchChildren.length > 0 ? '24px' : '32px' }} />

          {/* Branch point dot (acts as the junction) */}
          {branchChildren.length > 0 && (
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-border z-10 shrink-0" />

              {/* SVG connector: horizontal line from dot → curve down to branch */}
              <svg
                className="absolute pointer-events-none overflow-visible"
                style={{ left: '50%', top: '50%' }}
                width="1"
                height="1"
                fill="none"
              >
                {branchChildren.map((_, i) => {
                  const endX = (i + 1) * 320;
                  const curveRadius = 40;
                  return (
                    <g key={i}>
                      <path
                        d={`M 0 0 L ${endX - curveRadius} 0 Q ${endX} 0 ${endX} ${curveRadius}`}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                        fill="none"
                      />
                      <circle cx={endX} cy={curveRadius} r="3.5" fill="hsl(var(--border))" />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Vertical line: dot → Main label → main child card */}
          {branchChildren.length > 0 && mainChild && (
            <>
              <div className="w-px h-4 bg-border" />
              <div className="my-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground text-background font-medium">
                  Main
                </span>
              </div>
              <div className="w-px h-4 bg-border" />
            </>
          )}

          {/* If no main child, show add button */}
          {branchChildren.length > 0 && !mainChild && (
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

          {/* Main child node directly below, stays centered */}
          {mainChild && (
            <NodeTree
              node={mainChild}
              nodeMap={nodeMap}
              activeNodeId={activeNodeId}
              onSelectNode={onSelectNode}
              onAddBranch={onAddBranch}
            />
          )}

          {/* Branch columns */}
          {branchChildren.map((branch, i) => {
            const curveRadius = 40;
            const dotTop = 24 + 6;
            const curveEndY = dotTop + curveRadius;
            const isMerged = branch.branchLabel === "merged" || !!branch.merged;

            return (
              <div
                key={branch.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `calc(50% + ${(i + 1) * 320}px)`,
                  top: `${curveEndY}px`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="w-px h-4 bg-border" />
                <div className="mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {branch.branchLabel || `Branch ${i + 1}`}
                  </span>
                </div>
                <div className="w-px h-4 bg-border" />
                <NodeTree
                  node={branch}
                  nodeMap={nodeMap}
                  activeNodeId={activeNodeId}
                  onSelectNode={onSelectNode}
                  onAddBranch={onAddBranch}
                />

                {/* Merge-back connector: curves from bottom of branch back to the next main node */}
                {isMerged && mainChild && (
                  <svg
                    className="pointer-events-none overflow-visible"
                    width="1"
                    height="80"
                    fill="none"
                  >
                    {(() => {
                      const returnX = -((i + 1) * 320);
                      const curveR = 40;
                      return (
                        <g>
                          <line x1={0} y1={0} x2={0} y2={curveR} stroke="hsl(var(--border))" strokeWidth="1" />
                          <path
                            d={`M 0 ${curveR} Q 0 ${curveR * 2}, ${returnX + curveR} ${curveR * 2} L ${returnX} ${curveR * 2}`}
                            stroke="hsl(var(--border))"
                            strokeWidth="1"
                            fill="none"
                          />
                          <circle cx={returnX} cy={curveR * 2} r="3.5" fill="hsl(var(--border))" />
                        </g>
                      );
                    })()}
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}

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
