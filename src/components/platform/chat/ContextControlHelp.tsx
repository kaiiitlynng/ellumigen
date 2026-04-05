import { motion } from "framer-motion";
import { Info, X } from "lucide-react";

interface ContextControlHelpProps {
  onClose: () => void;
}

export function ContextControlHelp({ onClose }: ContextControlHelpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="border border-blue-200 bg-blue-50 rounded-xl p-5 max-w-3xl mx-auto"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-semibold text-blue-800">How Context Control Works</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-blue-100 transition-colors"
        >
          <X className="w-4 h-4 text-blue-400" />
        </button>
      </div>
      <ul className="space-y-2 text-sm text-blue-700">
        <li className="flex items-start gap-2">
          <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
          <span>
            Type <kbd className="px-1.5 py-0.5 rounded bg-blue-100 border border-blue-200 text-xs font-mono text-blue-800">@</kbd> to see available context
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
          Add datasets to constrain data sources
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
          Reference previous responses to build on them
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
          Specify methods to control analysis approach
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
          Set modes to change agent behavior
        </li>
      </ul>
    </motion.div>
  );
}
