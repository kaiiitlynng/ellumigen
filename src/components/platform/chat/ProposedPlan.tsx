import { motion } from "framer-motion";
import { Database } from "lucide-react";
import type { ResponsePlan } from "@/types/chat";

interface ProposedPlanProps {
  plan: ResponsePlan;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
}

export function ProposedPlan({ plan, onApprove, onReject, onEdit }: ProposedPlanProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Awaiting Approval badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Awaiting Approval
        </span>
      </div>

      {/* Plan card */}
      <div className="border-2 border-amber-300 rounded-xl overflow-hidden bg-background">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">{plan.title}</h3>
          <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
        </div>

        <div className="px-5 pb-4 space-y-4">
          {/* Analysis Approach */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Analysis Approach</p>
            <ul className="space-y-1.5">
              {plan.approach.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          {plan.dataSources && plan.dataSources.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Database className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-700">Data Sources</p>
                <p className="text-sm text-blue-600">{plan.dataSources.join(", ")}</p>
              </div>
            </div>
          )}

          {/* Metadata row */}
          <div className="flex gap-0 border-t border-border pt-3">
            {plan.estimatedLength && (
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Estimated length</p>
                <p className="text-sm font-medium text-foreground">{plan.estimatedLength}</p>
              </div>
            )}
            {plan.statisticalDepth && (
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Statistical depth</p>
                <p className="text-sm font-medium text-foreground">{plan.statisticalDepth}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border">
          <button
            onClick={onReject}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Reject & Modify
          </button>
          <button
            onClick={onEdit}
            className="text-sm text-foreground hover:text-foreground/80 transition-colors"
          >
            Edit Plan
          </button>
          <button
            onClick={onApprove}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Generate Response
          </button>
        </div>
      </div>
    </motion.div>
  );
}
