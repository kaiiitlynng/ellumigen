import { useState } from "react";
import { ChevronDown, GitBranch } from "lucide-react";
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
  timestamp?: Date;
}

interface ChatBranchTreeProps {
  nodes: BranchTreeNode[];
  onSelectNode?: (nodeId: string) => void;
  onSelectBranch?: (branchId: string) => void;
}

const NODE_SIZE = 10; // px diameter for main nodes
const BRANCH_NODE_SIZE = 8;
const ROW_HEIGHT = 32; // px per row
const BUTTON_PAD = 4; // px-1 = 4px left padding on buttons
const MAIN_X = 18; // center X of main column dots
const BRANCH_X = 44; // center X of branch column dots

export function ChatBranchTree({ nodes, onSelectNode, onSelectBranch }: ChatBranchTreeProps) {
  return (
    <Collapsible defaultOpen className="px-3">
      <CollapsibleTrigger className="section-label flex items-center gap-1 w-full">
        <GitBranch className="w-3 h-3" />
        Current Chat
        <ChevronDown className="w-3 h-3 ml-auto transition-transform duration-200 [[data-state=closed]>&]:rotate-[-90deg]" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        {nodes.map((node) => (
          <BranchTreeLayout key={node.id} node={node} onSelect={onSelectNode} onSelectBranch={onSelectBranch} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function BranchTreeLayout({
  node,
  onSelect,
  onSelectBranch,
}: {
  node: BranchTreeNode;
  onSelect?: (id: string) => void;
  onSelectBranch?: (branchId: string) => void;
}) {
  const mainChain: BranchTreeNode[] = [];
  let current: BranchTreeNode | undefined = node;
  while (current) {
    mainChain.push(current);
    const children = current.children || [];
    current = children.find((c) => !c.isBranch);
  }

  const branchesPerMain: { chain: BranchTreeNode[]; label?: string }[][] = mainChain.map((item) => {
    const branchKids = item.branchChildren || (item.children || []).filter((c) => c.isBranch);
    return branchKids.map((branch) => {
      const chain: BranchTreeNode[] = [];
      let c: BranchTreeNode | undefined = branch;
      while (c) {
        chain.push(c);
        const ch = c.children || [];
        c = ch.find((x) => !x.isBranch);
      }
      return { chain, label: branch.branchLabel };
    });
  });

  const mainRowIndex: number[] = [];
  const branchRowStart: number[] = [];
  let nextRow = 0;

  for (let i = 0; i < mainChain.length; i++) {
    mainRowIndex.push(nextRow);
    nextRow++;
    branchRowStart.push(nextRow);
    const maxBranchLen = branchesPerMain[i].reduce((max, b) => Math.max(max, b.chain.length), 0);
    nextRow += maxBranchLen;
  }

  const totalRows = nextRow;
  const svgHeight = totalRows * ROW_HEIGHT;

  const branchRenders: { mainIdx: number; chain: BranchTreeNode[]; label?: string; startRow: number }[] = [];
  branchesPerMain.forEach((branches, mainIdx) => {
    branches.forEach((branch) => {
      branchRenders.push({
        mainIdx,
        chain: branch.chain,
        label: branch.label,
        startRow: branchRowStart[mainIdx],
      });
    });
  });

  return (
    <div className="relative" style={{ minHeight: svgHeight }}>
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height={svgHeight}
        style={{ overflow: "visible" }}
      >
        {mainChain.length > 1 && (
          <line
            x1={MAIN_X}
            y1={mainRowIndex[0] * ROW_HEIGHT + ROW_HEIGHT / 2}
            x2={MAIN_X}
            y2={mainRowIndex[mainChain.length - 1] * ROW_HEIGHT + ROW_HEIGHT / 2}
            stroke="#0070C0"
            strokeWidth={2}
          />
        )}

        {branchRenders.map((branch, bi) => {
          const startY = mainRowIndex[branch.mainIdx] * ROW_HEIGHT + ROW_HEIGHT / 2;
          const firstBranchY = branch.startRow * ROW_HEIGHT + ROW_HEIGHT / 2;
          const lastBranchY = (branch.startRow + branch.chain.length - 1) * ROW_HEIGHT + ROW_HEIGHT / 2;

          return (
            <g key={bi}>
              <path
                d={`M ${MAIN_X} ${startY} Q ${BRANCH_X} ${startY}, ${BRANCH_X} ${firstBranchY}`}
                fill="none"
                stroke="#D9D9D9"
                strokeWidth={2}
              />
              {branch.chain.length > 1 && (
                <line
                  x1={BRANCH_X}
                  y1={firstBranchY}
                  x2={BRANCH_X}
                  y2={lastBranchY}
                  stroke="#D9D9D9"
                  strokeWidth={2}
                />
              )}
            </g>
          );
        })}
      </svg>

      {mainChain.map((item, idx) => (
        <button
          key={item.id}
          onClick={() => {
            if (item.branchId) onSelectBranch?.(item.branchId);
            else onSelect?.(item.id);
          }}
          className="absolute flex items-center gap-2 hover:bg-secondary rounded-md px-1 transition-colors"
          style={{
            top: mainRowIndex[idx] * ROW_HEIGHT,
            left: 0,
            height: ROW_HEIGHT,
          }}
        >
          <div
            className="shrink-0 rounded-full flex items-center justify-center"
            style={{
              width: NODE_SIZE,
              height: NODE_SIZE,
              marginLeft: MAIN_X - BUTTON_PAD - NODE_SIZE / 2,
            }}
          >
            <MainDot status={item.status} isActive={item.isActive} />
          </div>
          <span className="truncate text-muted-foreground text-xs ml-1" style={{ maxWidth: 100 }}>
            {item.label}
          </span>
          {item.isMain && (
            <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
              main
            </span>
          )}
        </button>
      ))}

      {branchRenders.map((branch, bi) =>
        branch.chain.map((item, ci) => {
          const rowIdx = branch.startRow + ci;
          return (
            <div
              key={`${bi}-${item.id}`}
              className="absolute"
              style={{ top: rowIdx * ROW_HEIGHT, left: 0, height: ROW_HEIGHT, width: "100%" }}
            >
              <button
                onClick={() => {
                  if (item.branchId) onSelectBranch?.(item.branchId);
                  else onSelect?.(item.id);
                }}
                className="flex items-center gap-2 h-full hover:bg-secondary rounded-md px-1 transition-colors w-full"
              >
                <div
                  className="shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: BRANCH_NODE_SIZE,
                    height: BRANCH_NODE_SIZE,
                    marginLeft: BRANCH_X - BUTTON_PAD - BRANCH_NODE_SIZE / 2,
                  }}
                >
                  <BranchDot status={item.status} isActive={item.isActive} />
                </div>
                <span className="truncate text-muted-foreground text-xs ml-1" style={{ maxWidth: 80 }}>
                  {ci === 0 ? "" : item.label}
                </span>
                {ci === 0 && branch.label && (
                  <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium ml-auto">
                    {branch.label}
                  </span>
                )}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

function MainDot({ status, isActive }: { status: BranchTreeNode["status"]; isActive?: boolean }) {
  const base = "rounded-full";
  const color = { backgroundColor: "#0070C0" };
  if (status === "active" || isActive) {
    return (
      <span className="relative flex items-center justify-center w-[10px] h-[10px]">
        <span className={cn(base, "w-[10px] h-[10px]")} style={color} />
        <span
          className="absolute w-[14px] h-[14px] rounded-full opacity-50"
          style={{ borderWidth: 2, borderColor: "#0070C0" }}
        />
      </span>
    );
  }
  return <span className={cn(base, "w-[10px] h-[10px]")} style={color} />;
}

function BranchDot({ status, isActive }: { status: BranchTreeNode["status"]; isActive?: boolean }) {
  const color = { backgroundColor: "#D9D9D9" };
  if (status === "active" || isActive) {
    return (
      <span className="relative flex items-center justify-center w-[8px] h-[8px]">
        <span className="rounded-full w-[8px] h-[8px]" style={color} />
      </span>
    );
  }
  return <span className="rounded-full w-[8px] h-[8px]" style={color} />;
}
