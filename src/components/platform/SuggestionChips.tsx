import { BarChart3, Eye, GitBranch, FileText } from "lucide-react";

interface SuggestionChipsProps {
  onSelect: (prompt: string) => void;
}

const suggestions = [
  { icon: BarChart3, label: "Analyze dataset", prompt: "Analyze the uploaded dataset and provide a summary of key findings, distributions, and potential outliers." },
  { icon: Eye, label: "Visualize data", prompt: "Create a visualization of the data showing the most important patterns and relationships." },
  { icon: GitBranch, label: "Generate workflow", prompt: "Generate a computational biology workflow for analyzing this dataset." },
  { icon: FileText, label: "Summarize paper", prompt: "Summarize the key findings, methods, and conclusions from this research paper." },
];

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {suggestions.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.label}
            onClick={() => onSelect(s.prompt)}
            className="suggestion-chip"
          >
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
