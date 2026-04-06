import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { BranchNodeCategory } from "@/types/chat";
import { cn } from "@/lib/utils";

const BRANCH_COLUMN_OFFSET = 320;
const BRANCH_CURVE_RADIUS = 40;
const MERGE_BEND_RADIUS = 40;

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
  branchId?: string;
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

interface MergeConnector {
  id: string;
  path: string;
}

const CATEGORY_STYLES: Record<BranchNodeCategory, { bg: string; text: string; label: string }> = {
  hypothesis: { bg: "bg-emerald-100", text: "text-emerald-700", label: "HYPOTHESIS" },
  data: { bg: "bg-amber-100", text: "text-amber-700", label: "DATA" },
  analysis: { bg: "bg-red-100", text: "text-red-700", label: "ANALYSIS" },
  exploration: { bg: "bg-violet-100", text: "text-violet-700", label: "EXPLORATION" },
};

function isMergedBranch(node: Pick<MapNode, "branchLabel" | "merged">): boolean {
  return node.branchLabel === "merged" || !!node.merged;
}

function getMergeAnchorId(node: Pick<MapNode, "branchId" | "id">): string {
  return node.branchId || node.id;
}

function measureMergeConnectors(container: HTMLDivElement): {
  connectors: MergeConnector[];
  width: number;
  height: number;
} {
  const containerRect = container.getBoundingClientRect();
  const targetElements = Array.from(container.querySelectorAll<HTMLElement>("[data-merge-target]"));
  const targetMap = new Map(
    targetElements.flatMap((element) => {
      const mergeId = element.dataset.mergeTarget;
      return mergeId ? [[mergeId, element] as const] : [];
    })
  );

  const connectors: MergeConnector[] = [];
  let width = container.scrollWidth;
  let height = container.scrollHeight;

  for (const sourceElement of Array.from(container.querySelectorAll<HTMLElement>("[data-merge-source]"))) {
    const mergeId = sourceElement.dataset.mergeSource;
    if (!mergeId) continue;

    const targetElement = targetMap.get(mergeId);
    if (!targetElement) continue;

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const startX = sourceRect.left - containerRect.left + sourceRect.width / 2;
    const startY = sourceRect.top - containerRect.top + sourceRect.height / 2;
    const endX = targetRect.left - containerRect.left + targetRect.width / 2;
    const endY = targetRect.top - containerRect.top + targetRect.height / 2;
    const bendRadius = Math.min(MERGE_BEND_RADIUS, Math.max(24, Math.abs(startX - endX) / 4));

    // Mirror the branch-out curve: go down vertically from source, then curve horizontally into the main line
    connectors.push({
      id: mergeId,
      path: `M ${startX} ${startY} L ${startX} ${endY - bendRadius} Q ${startX} ${endY} ${startX - bendRadius} ${endY} L ${endX} ${endY}`,
    });

    width = Math.max(width, startX + 24, endX + 24);
    height = Math.max(height, startY + 24, endY + 24);
  }

  return {
    connectors,
    width: Math.ceil(width),
    height: Math.ceil(height),
  };
}

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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [mergeConnectors, setMergeConnectors] = useState<MergeConnector[]>([]);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    let frame = 0;

    const updateConnectors = () => {
      const nextMeasurement = measureMergeConnectors(container);
      setMergeConnectors(nextMeasurement.connectors);
      setOverlaySize({ width: nextMeasurement.width, height: nextMeasurement.height });
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateConnectors);
    };

    scheduleUpdate();

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [activeNodeId, nodes]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <h2 className="text-lg font-medium text-muted-foreground">{title}</h2>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div
          ref={contentRef}
          className="relative flex flex-col items-center gap-0 min-w-fit"
          style={{ paddingRight: "400px" }}
        >
          <svg
            className="pointer-events-none absolute left-0 top-0 overflow-visible"
            width={overlaySize.width || undefined}
            height={overlaySize.height || undefined}
            fill="none"
          >
            {mergeConnectors.map((connector) => (
              <path
                key={connector.id}
                d={connector.path}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                fill="none"
              />
            ))}
          </svg>

          {rootNodes.map((node) => (
            <NodeTree
              key={node.id}
              node={node}
              nodeMap={nodeMap}
              activeNodeId={activeNodeId}
              onSelectNode={onSelectNode}
              onAddBranch={onAddBranch}
              mergeTargetIds={[]}
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
  mergeTargetIds,
  mergeSourceId,
}: {
  node: MapNode;
  nodeMap: Record<string, MapNode>;
  activeNodeId?: string;
  onSelectNode?: (id: string) => void;
  onAddBranch?: (parentId: string) => void;
  mergeTargetIds?: string[];
  mergeSourceId?: string;
}) {
  const children = node.children.map((id) => nodeMap[id]).filter(Boolean);
  const style = CATEGORY_STYLES[node.category];
  const isActive = node.id === activeNodeId;
  const mainChild = children.find((child) => !child.isBranch);
  const branchChildren = children.filter((child) => child.isBranch);
  const mergedBranches = mainChild ? branchChildren.filter(isMergedBranch) : [];

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
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
        {mergeTargetIds && mergeTargetIds.map((id) => (
          <span
            key={id}
            data-merge-target={id}
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border"
            aria-hidden="true"
          />
        ))}
      </div>

      {(mainChild || branchChildren.length > 0) && (
        <div className="relative flex flex-col items-center">
          <div className="w-px bg-border" style={{ height: branchChildren.length > 0 ? "24px" : "32px" }} />

          {branchChildren.length > 0 && (
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-border z-10 shrink-0" />

              <svg
                className="absolute pointer-events-none overflow-visible"
                style={{ left: "50%", top: "50%" }}
                width="1"
                height="1"
                fill="none"
              >
                {branchChildren.map((_, index) => {
                  const endX = (index + 1) * BRANCH_COLUMN_OFFSET;
                  return (
                    <g key={index}>
                      <path
                        d={`M 0 0 L ${endX - BRANCH_CURVE_RADIUS} 0 Q ${endX} 0 ${endX} ${BRANCH_CURVE_RADIUS}`}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                        fill="none"
                      />
                      <circle cx={endX} cy={BRANCH_CURVE_RADIUS} r="3.5" fill="hsl(var(--border))" />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

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

          {mainChild && (
            <NodeTree
              node={mainChild}
              nodeMap={nodeMap}
              activeNodeId={activeNodeId}
              onSelectNode={onSelectNode}
              onAddBranch={onAddBranch}
              mergeTargetIds={mergedBranches.map((b) => getMergeAnchorId(b))}
              mergeSourceId={mergeSourceId}
            />
          )}

          {branchChildren.map((branch, index) => {
            const curveEndY = 24 + 6 + BRANCH_CURVE_RADIUS;
            const isMerged = isMergedBranch(branch);
            const mergeAnchorId = getMergeAnchorId(branch);

            return (
              <div
                key={branch.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `calc(50% + ${(index + 1) * BRANCH_COLUMN_OFFSET}px)`,
                  top: `${curveEndY}px`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="w-px h-4 bg-border" />
                <div className="mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {branch.branchLabel || `Branch ${index + 1}`}
                  </span>
                </div>
                <div className="w-px h-4 bg-border" />
                <NodeTree
                  node={branch}
                  nodeMap={nodeMap}
                  activeNodeId={activeNodeId}
                  onSelectNode={onSelectNode}
                  onAddBranch={onAddBranch}
                  mergeSourceId={isMerged && mainChild ? mergeAnchorId : undefined}
                />
              </div>
            );
          })}
        </div>
      )}

      {children.length === 0 && mergeSourceId && (
        <>
          <div className="w-px h-4 bg-border" />
          <span
            data-merge-source={mergeSourceId}
            className="block h-2 w-2 rounded-full bg-border"
            aria-hidden="true"
          />
        </>
      )}

      {children.length === 0 && !mergeSourceId && (
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
