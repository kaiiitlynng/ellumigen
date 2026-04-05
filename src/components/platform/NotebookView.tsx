import { useState, useCallback } from "react";
import { Plus, Play, Trash2, ChevronDown, ChevronRight, FileCode, Type, GripVertical } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import ReactMarkdown from "react-markdown";

type CellType = "code" | "markdown";

interface Cell {
  id: string;
  type: CellType;
  content: string;
  output?: string;
  isRunning?: boolean;
  isCollapsed?: boolean;
}

const DEMO_CELLS: Cell[] = [
  {
    id: "c1",
    type: "markdown",
    content: "# TCGA-BRCA Differential Expression\n\nThis notebook performs a basic differential expression analysis on the TCGA-BRCA dataset, comparing TP53 wildtype vs mutant samples.",
  },
  {
    id: "c2",
    type: "code",
    content: `import pandas as pd\nimport numpy as np\nfrom scipy import stats\n\n# Load expression matrix\ndf = pd.read_csv("tcga_brca_expression.csv", index_col=0)\nprint(f"Loaded {df.shape[0]} genes × {df.shape[1]} samples")`,
    output: "Loaded 20531 genes × 1098 samples",
  },
  {
    id: "c3",
    type: "code",
    content: `# Load mutation annotations\nmutations = pd.read_csv("tcga_brca_mutations.csv")\ntp53_mutant = mutations[mutations["gene"] == "TP53"]["sample_id"].tolist()\ntp53_wt = [s for s in df.columns if s not in tp53_mutant]\n\nprint(f"TP53 mutant: {len(tp53_mutant)} samples")\nprint(f"TP53 wildtype: {len(tp53_wt)} samples")`,
    output: "TP53 mutant: 412 samples\nTP53 wildtype: 686 samples",
  },
  {
    id: "c4",
    type: "code",
    content: `# Perform t-test for each gene\nresults = []\nfor gene in df.index[:100]:  # Demo subset\n    wt_expr = df.loc[gene, tp53_wt]\n    mut_expr = df.loc[gene, tp53_mutant]\n    t_stat, p_val = stats.ttest_ind(wt_expr, mut_expr)\n    log2fc = np.log2(mut_expr.mean() / wt_expr.mean())\n    results.append({"gene": gene, "log2FC": log2fc, "p_value": p_val})\n\nresults_df = pd.DataFrame(results)\nresults_df["padj"] = stats.false_discovery_control(results_df["p_value"])\nsig = results_df[results_df["padj"] < 0.05]\nprint(f"Significant DEGs: {len(sig)} / {len(results_df)}")`,
  },
];

let cellCounter = 10;

export function NotebookView() {
  const [cells, setCells] = useState<Cell[]>(DEMO_CELLS);

  const addCell = useCallback((type: CellType, afterId?: string) => {
    const newCell: Cell = {
      id: `cell-${++cellCounter}`,
      type,
      content: type === "code" ? "# Write your code here\n" : "## New Section\n",
    };
    setCells((prev) => {
      if (!afterId) return [...prev, newCell];
      const idx = prev.findIndex((c) => c.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newCell);
      return next;
    });
  }, []);

  const updateCell = useCallback((id: string, content: string) => {
    setCells((prev) => prev.map((c) => (c.id === id ? { ...c, content } : c)));
  }, []);

  const deleteCell = useCallback((id: string) => {
    setCells((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setCells((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCollapsed: !c.isCollapsed } : c))
    );
  }, []);

  const runCell = useCallback((id: string) => {
    setCells((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isRunning: true } : c))
    );
    // Simulate execution
    setTimeout(() => {
      setCells((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const lines = c.content.split("\n").filter((l) => l.startsWith("print("));
          const output =
            c.output ||
            (lines.length > 0
              ? lines.map((l) => {
                  const match = l.match(/print\(f?"(.+?)"\)/);
                  return match ? match[1].replace(/{.*?}/g, "42") : "OK";
                }).join("\n")
              : "Execution complete (no output)");
          return { ...c, isRunning: false, output };
        })
      );
    }, 800 + Math.random() * 1200);
  }, []);

  const runAll = useCallback(() => {
    cells.filter((c) => c.type === "code").forEach((c, i) => {
      setTimeout(() => runCell(c.id), i * 1000);
    });
  }, [cells, runCell]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-background">
        <button
          onClick={() => addCell("code")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Code
        </button>
        <button
          onClick={() => addCell("markdown")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Markdown
        </button>
        <div className="w-px h-5 bg-border mx-1" />
        <button
          onClick={runAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Run All
        </button>
        <span className="ml-auto text-xs text-muted-foreground">
          {cells.length} cells · {cells.filter((c) => c.output).length} executed
        </span>
      </div>

      {/* Cells */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-3">
          <Reorder.Group axis="y" values={cells} onReorder={setCells} className="space-y-3">
            <AnimatePresence initial={false}>
              {cells.map((cell) => (
                <Reorder.Item
                  key={cell.id}
                  value={cell}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CellComponent
                    cell={cell}
                    onUpdate={updateCell}
                    onDelete={deleteCell}
                    onRun={runCell}
                    onToggleCollapse={toggleCollapse}
                    onAddBelow={(type) => addCell(type, cell.id)}
                  />
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {cells.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <FileCode className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Add a code or markdown cell to get started
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function CellComponent({
  cell,
  onUpdate,
  onDelete,
  onRun,
  onToggleCollapse,
  onAddBelow,
}: {
  cell: Cell;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onRun: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddBelow: (type: CellType) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isCode = cell.type === "code";

  return (
    <div
      className={`group rounded-xl border transition-colors ${
        isFocused
          ? "border-primary/40 shadow-sm shadow-primary/5"
          : "border-border"
      } bg-card`}
    >
      {/* Cell header */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/50">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 cursor-grab" />
        <button
          onClick={() => onToggleCollapse(cell.id)}
          className="p-0.5 rounded hover:bg-secondary transition-colors"
        >
          {cell.isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
        <span
          className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
            isCode
              ? "text-primary bg-primary/10"
              : "text-muted-foreground bg-secondary"
          }`}
        >
          {cell.type}
        </span>

        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isCode && (
            <button
              onClick={() => onRun(cell.id)}
              disabled={cell.isRunning}
              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              {cell.isRunning ? "Running…" : "Run"}
            </button>
          )}
          <button
            onClick={() => onAddBelow("code")}
            className="p-1 rounded hover:bg-secondary transition-colors"
            title="Add code cell below"
          >
            <Plus className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(cell.id)}
            className="p-1 rounded hover:bg-destructive/10 transition-colors"
            title="Delete cell"
          >
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Cell body */}
      {!cell.isCollapsed && (
        <>
          {isCode ? (
            <div className="relative">
              <textarea
                value={cell.content}
                onChange={(e) => onUpdate(cell.id, e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-[hsl(220,20%,8%)] text-emerald-300 font-mono text-sm p-4 resize-none focus:outline-none rounded-b-xl min-h-[80px]"
                rows={cell.content.split("\n").length + 1}
                spellCheck={false}
              />
              {cell.isRunning && (
                <div className="absolute top-2 right-3">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              {isFocused ? (
                <textarea
                  value={cell.content}
                  onChange={(e) => onUpdate(cell.id, e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-transparent text-foreground text-sm p-4 resize-none focus:outline-none min-h-[60px] font-mono"
                  rows={cell.content.split("\n").length + 1}
                />
              ) : (
                <div
                  onClick={() => setIsFocused(true)}
                  className="prose prose-sm max-w-none text-foreground p-4 cursor-text prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground"
                >
                  <ReactMarkdown>{cell.content}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Output */}
          {isCode && cell.output && (
            <div className="border-t border-border/50 bg-secondary/30 px-4 py-3 rounded-b-xl">
              <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">
                {cell.output}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
