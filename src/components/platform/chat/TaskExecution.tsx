import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { TaskStep } from "@/types/chat";

interface TaskExecutionProps {
  steps: TaskStep[];
  completedCount: number;
  totalCount: number;
}

export function TaskExecution({ steps, completedCount, totalCount }: TaskExecutionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Generating badge */}
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Generating Response...
        </span>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount} tasks complete
        </span>
      </div>

      {/* Task list */}
      <div className="border border-border rounded-xl bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <h3 className="text-sm font-semibold text-foreground">Task Execution</h3>
        </div>
        <div className="px-5 pb-4 space-y-1">
          {steps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
                step.status === "running" ? "bg-blue-50 border border-blue-100" : ""
              }`}
            >
              {step.status === "complete" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : step.status === "running" ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/30 shrink-0" />
              )}
              <span
                className={`text-sm flex-1 ${
                  step.status === "complete"
                    ? "text-muted-foreground line-through"
                    : step.status === "running"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground/50"
                }`}
              >
                {step.label}
              </span>
              {step.status === "complete" && step.duration && (
                <span className="text-xs text-muted-foreground">{step.duration}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
