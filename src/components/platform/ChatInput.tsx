import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ArrowUp, HelpCircle, Hash, Database, BarChart3, FlaskConical, GitBranch, Dna, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface DropdownItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const DATASET_OPTIONS: DropdownItem[] = [
  { id: "TCGA-BRCA", label: "TCGA-BRCA", description: "Breast cancer RNA-seq expression", icon: Database },
  { id: "TCGA-LUAD", label: "TCGA-LUAD", description: "Lung adenocarcinoma expression", icon: Database },
  { id: "TCGA-COAD", label: "TCGA-COAD", description: "Colon adenocarcinoma dataset", icon: Database },
  { id: "GTEx-Brain", label: "GTEx-Brain", description: "Normal brain tissue expression", icon: Dna },
  { id: "ClinVar-Pathogenic", label: "ClinVar-Pathogenic", description: "Pathogenic variant annotations", icon: FileText },
];

const METHOD_OPTIONS: DropdownItem[] = [
  { id: "statistical-analysis", label: "statistical-analysis", description: "DESeq2, t-test, ANOVA, survival analysis", icon: BarChart3 },
  { id: "pathway-enrichment", label: "pathway-enrichment", description: "GO, KEGG, Reactome enrichment", icon: GitBranch },
  { id: "clustering", label: "clustering", description: "K-means, hierarchical, UMAP", icon: FlaskConical },
  { id: "dimensionality-reduction", label: "dimensionality-reduction", description: "PCA, t-SNE, UMAP projections", icon: FlaskConical },
];

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  onHelpClick?: () => void;
}

export function ChatInput({ onSend, disabled, onHelpClick }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [showDropdown, setShowDropdown] = useState<"@" | "/" | null>(null);
  const [dropdownIndex, setDropdownIndex] = useState(0);
  const [triggerPos, setTriggerPos] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOptions = showDropdown === "@" ? DATASET_OPTIONS : showDropdown === "/" ? METHOD_OPTIONS : [];
  const filteredOptions = activeOptions.filter((opt) => {
    if (triggerPos === null) return true;
    const query = value.slice(triggerPos + 1).toLowerCase();
    return opt.label.toLowerCase().includes(query) || opt.description.toLowerCase().includes(query);
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  const insertOption = useCallback((item: DropdownItem) => {
    if (triggerPos === null) return;
    const prefix = showDropdown === "@" ? "@" : "/";
    const before = value.slice(0, triggerPos);
    const after = value.slice(textareaRef.current?.selectionStart ?? value.length);
    const newValue = `${before}${prefix}${item.label} ${after}`;
    setValue(newValue);
    setShowDropdown(null);
    setTriggerPos(null);
    setDropdownIndex(0);
    setTimeout(() => {
      if (textareaRef.current) {
        const cursorPos = before.length + prefix.length + item.label.length + 1;
        textareaRef.current.selectionStart = cursorPos;
        textareaRef.current.selectionEnd = cursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  }, [triggerPos, showDropdown, value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setValue(newValue);

    // Check if we should open a dropdown
    const charBefore = newValue[cursorPos - 1];
    if (charBefore === "@" || charBefore === "/") {
      const trigger = charBefore as "@" | "/";
      // Only trigger if at start or preceded by space
      if (cursorPos === 1 || newValue[cursorPos - 2] === " ") {
        setShowDropdown(trigger);
        setTriggerPos(cursorPos - 1);
        setDropdownIndex(0);
        return;
      }
    }

    // If dropdown is open, check if we're still in the trigger word
    if (showDropdown && triggerPos !== null) {
      const textAfterTrigger = newValue.slice(triggerPos + 1, cursorPos);
      if (textAfterTrigger.includes(" ") || cursorPos <= triggerPos) {
        setShowDropdown(null);
        setTriggerPos(null);
      }
    }
  };

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    setShowDropdown(null);
    setTriggerPos(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showDropdown && filteredOptions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setDropdownIndex((prev) => (prev + 1) % filteredOptions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setDropdownIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertOption(filteredOptions[dropdownIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowDropdown(null);
        setTriggerPos(null);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container relative">
      {/* Dropdown menu */}
      <AnimatePresence>
        {showDropdown && filteredOptions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 mx-3 rounded-xl border border-border bg-popover shadow-lg overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground">
                {showDropdown === "@" ? "Datasets & Files" : "Methods & Skills"}
              </span>
            </div>
            <div className="py-1 max-h-52 overflow-y-auto">
              {filteredOptions.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => insertOption(item)}
                    onMouseEnter={() => setDropdownIndex(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      i === dropdownIndex ? "bg-accent/50" : "hover:bg-secondary"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                      showDropdown === "@" ? "bg-emerald-500/10 text-emerald-600" : "bg-violet-500/10 text-violet-600"
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {showDropdown === "@" ? "@" : "/"}{item.label}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type @ for datasets, / for methods..."
        rows={1}
        disabled={disabled}
        className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={onHelpClick}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:bg-secondary transition-colors"
            title="Context control help"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Add Context</span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onHelpClick}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            title="Help"
          >
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="p-1.5 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
