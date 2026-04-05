import { Database, BarChart3 } from "lucide-react";

const TAG_STYLES: Record<string, { bg: string; text: string; icon: typeof Database }> = {
  "TCGA-BRCA": { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: Database },
  "statistical-analysis": { bg: "bg-violet-50 border-violet-200", text: "text-violet-700", icon: BarChart3 },
  "TCGA-LUAD": { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: Database },
};

const DEFAULT_STYLE = { bg: "bg-secondary border-border", text: "text-foreground", icon: Database };

interface ContextTagsProps {
  tags: string[];
  variant?: "user" | "assistant";
}

export function ContextTags({ tags, variant = "user" }: ContextTagsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      {variant === "assistant" && (
        <span className="text-xs font-medium text-muted-foreground mr-1">/ Context Used:</span>
      )}
      {tags.map((tag) => {
        const style = TAG_STYLES[tag] || DEFAULT_STYLE;
        const Icon = style.icon;
        return (
          <span
            key={tag}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${style.bg} ${style.text}`}
          >
            <Icon className="w-3 h-3" />
            /{tag}
          </span>
        );
      })}
    </div>
  );
}
