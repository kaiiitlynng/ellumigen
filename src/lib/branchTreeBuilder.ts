import type { ChatMessage, ChatBranch } from "@/types/chat";
import type { BranchTreeNode } from "@/components/platform/ChatBranchTree";
import type { MapNode } from "@/components/platform/ConversationMap";
import type { BranchNodeCategory } from "@/types/chat";

// ── Category detection based on message content ──────────────

const CATEGORY_PATTERNS: { category: BranchNodeCategory; patterns: RegExp[] }[] = [
  {
    category: "hypothesis",
    patterns: [
      /hypothes[ie]s/i, /predict/i, /expect/i, /propos/i, /theor/i,
      /suggest that/i, /we believe/i, /assume/i, /if.*then/i,
    ],
  },
  {
    category: "data",
    patterns: [
      /dataset/i, /data/i, /sample/i, /expression/i, /RNA-seq/i,
      /sequenc/i, /load/i, /import/i, /upload/i, /@\w+/i,
      /TCGA/i, /GEO/i, /matrix/i, /table/i, /csv/i,
    ],
  },
  {
    category: "analysis",
    patterns: [
      /analy[sz]/i, /differential/i, /enrichment/i, /statistical/i,
      /correlation/i, /regression/i, /DESeq/i, /fold.?change/i,
      /p.?value/i, /significant/i, /compare/i, /survival/i,
      /cluster/i, /PCA/i, /UMAP/i, /pathway/i,
    ],
  },
  {
    category: "exploration",
    patterns: [
      /explor/i, /visuali[sz]/i, /plot/i, /graph/i, /chart/i,
      /heatmap/i, /volcano/i, /look at/i, /show me/i, /what about/i,
      /can you/i, /try/i, /let's/i, /investigate/i,
    ],
  },
];

function detectCategory(text: string): BranchNodeCategory {
  const scores: Record<BranchNodeCategory, number> = {
    hypothesis: 0, data: 0, analysis: 0, exploration: 0,
  };
  for (const { category, patterns } of CATEGORY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) scores[category]++;
    }
  }
  const best = (Object.entries(scores) as [BranchNodeCategory, number][])
    .sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : "exploration";
}

// ── Status detection ──────────────────────────────────────────

function detectStatus(
  userMsg: ChatMessage,
  assistantMsg: ChatMessage | undefined,
  isLatest: boolean,
  isLoading: boolean
): BranchTreeNode["status"] {
  if (isLatest && isLoading) return "active";
  if (!assistantMsg) return isLatest ? "active" : "warning";
  const meta = assistantMsg.metadata;
  if (meta?.type === "executing") {
    const allDone = meta.executionSteps?.every((s) => s.status === "complete");
    return allDone ? "complete" : "active";
  }
  if (meta?.type === "plan") return "active";
  return "complete";
}

// ── Summarize a message into a short label ────────────────────

function summarize(text: string, maxLen = 45): string {
  if (!text) return "Processing...";
  const clean = text.replace(/[#*_`~\[\]()]/g, "").replace(/\n+/g, " ").trim();
  const firstSentence = clean.split(/[.!?]/)[0]?.trim();
  const label = firstSentence || clean;
  if (label.length <= maxLen) return label;
  return label.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

// ── Build description from assistant response ─────────────────

function buildDescription(assistantMsg: ChatMessage | undefined): string {
  if (!assistantMsg) return "Awaiting response...";
  const meta = assistantMsg.metadata;
  if (meta?.type === "plan" && meta.plan) {
    return meta.plan.approach?.slice(0, 2).join(" → ") || "Plan proposed";
  }
  if (meta?.type === "executing") {
    const done = meta.executionSteps?.filter((s) => s.status === "complete").length || 0;
    const total = meta.executionSteps?.length || 0;
    return `Executing ${done}/${total} steps`;
  }
  if (meta?.type === "visualizations") {
    const parts: string[] = [];
    if (meta.dataTable) parts.push("Data table");
    if (meta.showVolcano) parts.push("Volcano plot");
    if (meta.showHeatmap) parts.push("Heatmap");
    return parts.join(" · ") || "Visualizations";
  }
  if (meta?.contextUsed?.length) {
    return `Using: ${meta.contextUsed.join(", ")}`;
  }
  const clean = assistantMsg.content.replace(/[#*_`~\[\]()]/g, "").replace(/\n+/g, " ").trim();
  if (clean.length <= 60) return clean;
  return clean.slice(0, 60).replace(/\s+\S*$/, "") + "...";
}

// ── Group messages into exchange pairs ────────────────────────

interface Exchange {
  user: ChatMessage;
  assistant?: ChatMessage;
}

function groupExchanges(messages: ChatMessage[]): Exchange[] {
  const exchanges: Exchange[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      const nextMsg = messages[i + 1];
      const assistant = nextMsg?.role === "assistant" ? nextMsg : undefined;
      exchanges.push({ user: msg, assistant });
      if (assistant) i++;
    } else if (msg.role === "assistant" && exchanges.length === 0) {
      exchanges.push({ user: msg, assistant: undefined });
    }
  }
  return exchanges;
}

// ── Build nodes from exchanges ────────────────────────────────

function exchangesToNodes(
  exchanges: Exchange[],
  isLoading: boolean,
  isMainThread: boolean
): BranchTreeNode[] {
  return exchanges.map((exchange, idx) => {
    const combinedText = exchange.user.content + " " + (exchange.assistant?.content || "");
    const category = detectCategory(combinedText);
    const isLatest = idx === exchanges.length - 1;
    const status = detectStatus(exchange.user, exchange.assistant, isLatest, isLoading);

    return {
      id: exchange.user.id,
      label: summarize(exchange.user.content),
      status,
      isMain: isMainThread && idx === 0,
      isActive: isLatest,
      category,
      description: buildDescription(exchange.assistant),
      emoji: status === "warning" ? "⚠️" : undefined,
      timestamp: exchange.user.timestamp,
    };
  });
}

// ── Main builder: messages + branches → branch tree nodes ─────

export function buildBranchTreeFromMessages(
  messages: ChatMessage[],
  branches: ChatBranch[],
  isLoading: boolean,
  activeBranchId?: string | null
): BranchTreeNode[] {
  if (messages.length === 0) return [];

  const mainExchanges = groupExchanges(messages);
  if (mainExchanges.length === 0) return [];

  const mainNodes = exchangesToNodes(mainExchanges, isLoading && !activeBranchId, true);

  // Build a map of parentMessageId → branches
  const branchMap = new Map<string, ChatBranch[]>();
  for (const branch of branches) {
    const existing = branchMap.get(branch.parentMessageId) || [];
    existing.push(branch);
    branchMap.set(branch.parentMessageId, existing);
  }

  // Attach branches to the correct main node
  // A branch's parentMessageId could be a user or assistant message.
  // We match it to the exchange that contains that message.
  for (const [parentMsgId, branchList] of branchMap) {
    // Find which main node this branches from
    const nodeIndex = mainExchanges.findIndex(
      (ex) => ex.user.id === parentMsgId || ex.assistant?.id === parentMsgId
    );
    if (nodeIndex === -1) continue;

    const branchChildren: BranchTreeNode[] = [];
    for (const branch of branchList) {
      const branchExchanges = groupExchanges(branch.messages);
      const isActiveBranch = branch.id === activeBranchId;
      const branchNodes = exchangesToNodes(
        branchExchanges,
        isLoading && isActiveBranch,
        false
      );

      // Determine merge target index if branch is merged
      let mergeTargetMainIndex: number | undefined;
      if (branch.merged && branch.mergedAtMessageId) {
        mergeTargetMainIndex = mainExchanges.findIndex(
          (ex) => ex.user.id === branch.mergedAtMessageId || ex.assistant?.id === branch.mergedAtMessageId
        );
        if (mergeTargetMainIndex === -1) {
          // Fallback: merge to last main node
          mergeTargetMainIndex = mainExchanges.length - 1;
        }
      }

      // If branch has no messages yet, create a placeholder node
      if (branchNodes.length === 0) {
        branchChildren.push({
          id: `branch-placeholder-${branch.id}`,
          label: branch.label || "Branch",
          status: branch.merged ? "complete" : "active",
          branchLabel: branch.merged ? "merged" : (branch.label || "Branch"),
          isBranch: true,
          branchId: branch.id,
          category: "exploration",
          description: branch.merged ? "Merged back to main" : "New branch — no messages yet",
          timestamp: branch.createdAt,
          merged: branch.merged,
          mergeTargetMainIndex,
        });
        continue;
      }

      // Set the first branch node's branchLabel
      branchNodes[0].branchLabel = branch.merged ? "merged" : (branch.label || "Branch");
      branchNodes[0].isBranch = true;
      branchNodes[0].branchId = branch.id;
      branchNodes[0].merged = branch.merged;
      branchNodes[0].mergeTargetMainIndex = mergeTargetMainIndex;

      // Nest branch nodes linearly
      for (let i = branchNodes.length - 2; i >= 0; i--) {
        branchNodes[i].children = [branchNodes[i + 1]];
      }
      branchChildren.push(branchNodes[0]);
    }

    if (branchChildren.length > 0) {
      if (!mainNodes[nodeIndex].children) {
        mainNodes[nodeIndex].children = [];
      }
      mainNodes[nodeIndex].branchChildren = branchChildren;
    }
  }

  // Nest main nodes linearly
  for (let i = mainNodes.length - 2; i >= 0; i--) {
    mainNodes[i].children = [
      ...(mainNodes[i].branchChildren || []),
      mainNodes[i + 1],
    ];
  }
  // Attach branch children of last node
  if (mainNodes.length > 0) {
    const last = mainNodes[mainNodes.length - 1];
    if (last.branchChildren && last.branchChildren.length > 0) {
      last.children = [...last.branchChildren];
    }
  }

  return [mainNodes[0]];
}

// ── Convert branch tree to map nodes (for ConversationMap) ────

export function branchTreeToMapNodes(
  nodes: BranchTreeNode[],
  parentId?: string
): MapNode[] {
  const result: MapNode[] = [];
  for (const node of nodes) {
    const allChildren = [
      ...(node.children || []),
    ];
    const childIds = allChildren.map((c) => c.id);
    result.push({
      id: node.id,
      label: node.label,
      description: node.description || "",
      category: node.category || "exploration",
      parentId,
      children: childIds,
      branchLabel: node.branchLabel,
      isMain: node.isMain,
      isBranch: node.isBranch,
      timestamp: node.timestamp,
    });
    if (node.children) {
      result.push(...branchTreeToMapNodes(node.children, node.id));
    }
  }
  return result;
}
