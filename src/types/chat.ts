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

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  folderId?: string;
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
