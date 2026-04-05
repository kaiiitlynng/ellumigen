import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ThoughtEntry } from "@/types/chat";

interface ThoughtProcessProps {
  entries: ThoughtEntry[];
  isLive?: boolean;
  summary?: string;
}

export function ThoughtProcess({ entries, isLive, summary }: ThoughtProcessProps) {
  const [expanded, setExpanded] = useState(false);

  const defaultSummary = "The user wants to analyze differential gene expression in TCGA-BRCA breast cancer samples. They need to compare TP53 wildtype vs mutant groups across RNA-seq expression data.\n\nThe analysis involves loading expression matrices from TCGA-BRCA and TCGA-LUAD datasets, filtering by TP53 mutation status, running DESeq2 differential expression, and generating volcano plot and heatmap visualizations.\n\nThey want a comprehensive statistical summary with FDR-corrected results and interactive data visualizations.";

  const displaySummary = summary || defaultSummary;

  return (
    <div className="w-full mt-3 mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 mb-2 group"
      >
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.div>
        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Reasoning
        </span>
        {isLive && (
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-5 border-l-2 border-border space-y-2 pb-2">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {displaySummary}
              </p>

              {entries.length > 0 && (
                <div className="space-y-0.5 pt-1">
                  {entries.map((entry, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={`text-xs leading-relaxed ${
                        entry.type === "success"
                          ? "text-emerald-500"
                          : entry.type === "highlight"
                          ? "text-foreground font-medium"
                          : "text-muted-foreground/70"
                      }`}
                    >
                      {entry.text}
                    </motion.p>
                  ))}
                </div>
              )}

              {isLive && (
                <div className="flex items-center gap-1 pt-1">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
