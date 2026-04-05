import { useState, useMemo } from "react";
import { MessageSquare, FileText, Database, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chat } from "@/types/chat";

type HistoryTab = "chats" | "datasets" | "documents";
type SortOrder = "newest" | "oldest";

interface HistoryItem {
  id: string;
  title: string;
  description: string;
  updatedAt: Date;
  type: HistoryTab;
}

const DEMO_DATASETS: HistoryItem[] = [
  { id: "d1", title: "Tumor vs Normal DEG Results", description: "342 genes · CSV", updatedAt: new Date(Date.now() - 3600000), type: "datasets" },
  { id: "d2", title: "Immune Cell scRNA-seq Counts", description: "48,000 cells · H5AD", updatedAt: new Date(Date.now() - 86400000), type: "datasets" },
  { id: "d3", title: "WGS Variant Calls — Batch 14", description: "1.2M variants · VCF", updatedAt: new Date(Date.now() - 172800000), type: "datasets" },
];

const DEMO_DOCUMENTS: HistoryItem[] = [
  { id: "doc1", title: "RNA-seq Pipeline Report", description: "Analysis summary · PDF", updatedAt: new Date(Date.now() - 7200000), type: "documents" },
  { id: "doc2", title: "Gene Enrichment Notes", description: "Pathway annotations · Markdown", updatedAt: new Date(Date.now() - 259200000), type: "documents" },
];

interface HistoryViewProps {
  chats: Chat[];
  onSelectChat: (id: string) => void;
}

export function HistoryView({ chats, onSelectChat }: HistoryViewProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>("chats");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const tabs: { key: HistoryTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "chats", label: "Chats", icon: MessageSquare },
    { key: "datasets", label: "Datasets", icon: Database },
    { key: "documents", label: "Documents", icon: FileText },
  ];

  const items = useMemo(() => {
    let list: HistoryItem[];
    if (activeTab === "chats") {
      list = chats.map((c) => ({
        id: c.id,
        title: c.title,
        description: `${c.messages.length} messages`,
        updatedAt: c.updatedAt,
        type: "chats" as HistoryTab,
      }));
    } else if (activeTab === "datasets") {
      list = DEMO_DATASETS;
    } else {
      list = DEMO_DOCUMENTS;
    }

    return list.sort((a, b) =>
      sortOrder === "newest"
        ? b.updatedAt.getTime() - a.updatedAt.getTime()
        : a.updatedAt.getTime() - b.updatedAt.getTime()
    );
  }, [activeTab, sortOrder, chats]);

  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">History</h1>

        {/* Tab bar + sort */}
        <div className="flex items-center justify-between border-b border-border mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.key
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            >
              Sort by
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-background border border-border rounded-lg shadow-md z-10">
                <button
                  onClick={() => { setSortOrder("newest"); setSortOpen(false); }}
                  className={cn("w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors rounded-t-lg", sortOrder === "newest" && "font-medium text-foreground")}
                >
                  Most recent
                </button>
                <button
                  onClick={() => { setSortOrder("oldest"); setSortOpen(false); }}
                  className={cn("w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors rounded-b-lg", sortOrder === "oldest" && "font-medium text-foreground")}
                >
                  Oldest first
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Items list */}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No {activeTab} yet</p>
        ) : (
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = tabs.find((t) => t.key === item.type)!.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => item.type === "chats" ? onSelectChat(item.id) : undefined}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-left group"
                >
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatTimeAgo(item.updatedAt)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const ms = Date.now() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hrs ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}
