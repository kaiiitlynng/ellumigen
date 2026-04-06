import type { ChatMessage } from "@/types/chat";
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
    hypothesis: 0,
    data: 0,
    analysis: 0,
    exploration: 0,
  };

  for (const { category, patterns } of CATEGORY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        scores[category]++;
      }
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
  // Remove markdown formatting
  const clean = text
    .replace(/[#*_`~\[\]()]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  // Try to get the first meaningful sentence
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

  // Summarize from content
  const clean = assistantMsg.content.replace(/[#*_`~\[\]()]/g, "").replace(/\n+/g, " ").trim();
  if (clean.length <= 60) return clean;
  return clean.slice(0, 60).replace(/\s+\S*$/, "") + "...";
}

// ── Main builder: messages → branch tree nodes ────────────────

export function buildBranchTreeFromMessages(
  messages: ChatMessage[],
  isLoading: boolean
): BranchTreeNode[] {
  if (messages.length === 0) return [];

  // Group messages into exchange pairs (user + assistant response)
  const exchanges: { user: ChatMessage; assistant?: ChatMessage }[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      const nextMsg = messages[i + 1];
      const assistant = nextMsg?.role === "assistant" ? nextMsg : undefined;
      exchanges.push({ user: msg, assistant });
      if (assistant) i++; // skip the assistant message
    } else if (msg.role === "assistant" && exchanges.length === 0) {
      // Orphan assistant message (e.g. from createChat with pre-populated messages)
      exchanges.push({ user: msg, assistant: undefined });
    }
  }

  if (exchanges.length === 0) return [];

  // Build a linear chain of nodes (first node is "main")
  const nodes: BranchTreeNode[] = exchanges.map((exchange, idx) => {
    const combinedText = exchange.user.content + " " + (exchange.assistant?.content || "");
    const category = detectCategory(combinedText);
    const isLatest = idx === exchanges.length - 1;
    const status = detectStatus(exchange.user, exchange.assistant, isLatest, isLoading);

    return {
      id: exchange.user.id,
      label: summarize(exchange.user.content),
      status,
      isMain: idx === 0,
      isActive: isLatest,
      category,
      description: buildDescription(exchange.assistant),
      emoji: status === "warning" ? "⚠️" : status === "complete" && idx === 0 ? "🟢" : undefined,
    };
  });

  // Build as a nested tree: each node is a child of the previous
  // This creates a linear conversation flow
  if (nodes.length === 1) return nodes;

  // Nest them: last node is deepest child
  for (let i = nodes.length - 2; i >= 0; i--) {
    nodes[i].children = [nodes[i + 1]];
  }

  return [nodes[0]];
}

// ── Convert branch tree to map nodes (for ConversationMap) ────

export function branchTreeToMapNodes(
  nodes: BranchTreeNode[],
  parentId?: string
): MapNode[] {
  const result: MapNode[] = [];
  for (const node of nodes) {
    const childIds = node.children?.map((c) => c.id) || [];
    result.push({
      id: node.id,
      label: node.label,
      description: node.description || "",
      category: node.category || "exploration",
      parentId,
      children: childIds,
      branchLabel: node.branchLabel,
      isMain: node.isMain,
    });
    if (node.children) {
      result.push(...branchTreeToMapNodes(node.children, node.id));
    }
  }
  return result;
}
