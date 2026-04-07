export type MessageRole = "user" | "assistant";

export interface ResponsePlan {
  title: string;
  subtitle?: string;
  approach: string[];
  dataSources?: string[];
  estimatedLength?: string;
  statisticalDepth?: string;
}

export interface TaskStep {
  id: string;
  label: string;
  status: "pending" | "running" | "complete";
  duration?: string;
}

export interface ThoughtEntry {
  text: string;
  type: "normal" | "success" | "highlight";
}

export interface DataTableConfig {
  columns: { key: string; label: string }[];
  data: Record<string, string | number>[];
}

export interface ChatMessageMetadata {
  type?: "standard" | "plan" | "executing" | "context-help" | "data-table" | "visualizations";
  plan?: ResponsePlan;
  executionSteps?: TaskStep[];
  thoughtProcess?: ThoughtEntry[];
  contextUsed?: string[];
  dataTable?: DataTableConfig;
  showVolcano?: boolean;
  showHeatmap?: boolean;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  visualizations?: Visualization[];
  bookmarked?: boolean;
  contextTags?: string[];
  metadata?: ChatMessageMetadata;
}

export interface BookmarkedMessage {
  messageId: string;
  chatId: string;
  chatTitle: string;
  content: string;
  bookmarkedAt: Date;
  collectionId?: string;
}

export interface BookmarkCollection {
  id: string;
  name: string;
  color: string; // tailwind color class
  icon?: string;
  createdAt: Date;
}

export interface Visualization {
  id: string;
  type: "bar" | "line" | "scatter" | "heatmap" | "volcano" | "pca";
  title: string;
  data: any;
  filters?: VisualizationFilter[];
}

export interface VisualizationFilter {
  id: string;
  label: string;
  type: "select" | "range" | "toggle";
  options?: string[];
  value: any;
}

export type BranchNodeCategory = "hypothesis" | "data" | "analysis" | "exploration";

export interface BranchNode {
  id: string;
  chatId: string;
  label: string;
  description: string;
  category: BranchNodeCategory;
  parentNodeId?: string;
  children: string[];
  isMain?: boolean;
}

export interface BranchTree {
  rootNodeId: string;
  nodes: Record<string, BranchNode>;
}

export interface ChatBranch {
  id: string;
  label: string;
  parentMessageId: string; // message ID from which this branch diverges
  messages: ChatMessage[];
  createdAt: Date;
  merged?: boolean;
  mergedAtMessageId?: string; // the main thread message ID where this branch merges back
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  branches: ChatBranch[];
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  folderId?: string;
  branchTree?: BranchTree;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  chatIds: string[];
  datasetCount?: number;
  updatedAt: Date;
}

export type InterfaceMode = "conversation" | "notebook" | "freeform";

export interface SuggestionChip {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}
