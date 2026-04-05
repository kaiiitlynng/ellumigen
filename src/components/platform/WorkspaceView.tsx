import { Lock, Share2, ChevronDown, FileEdit, Globe, FileText } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  visibility: "private" | "shared";
  updatedAt: string;
}

const DEMO_PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Differential Expression — Tumor vs Normal",
    description: "RNA-seq analysis",
    visibility: "private",
    updatedAt: "20 min ago",
  },
  {
    id: "p2",
    title: "Single-Cell Clustering — Immune Cell Dataset",
    description: "UMAP visualization",
    visibility: "shared",
    updatedAt: "2 hrs ago",
  },
  {
    id: "p3",
    title: "Variant Calling — WGS Sample Batch 14",
    description: "Genome pipeline",
    visibility: "private",
    updatedAt: "Yesterday",
  },
];

interface ExampleTemplate {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  chatTitle: string;
  userMessage: string;
  assistantMessage: string;
}

const EXAMPLE_TEMPLATES: ExampleTemplate[] = [
  {
    id: "e1",
    icon: FileEdit,
    text: "Start a new computational biology workflow",
    chatTitle: "Computational Biology Workflow",
    userMessage: "I'd like to start a new computational biology workflow. Can you help me set up a pipeline for analyzing gene expression data?",
    assistantMessage: `## Getting Started with Your Workflow

Great choice! Here's a recommended workflow for gene expression analysis:

### Step 1: Data Acquisition
- Select your dataset source (GEO, TCGA, or upload your own)
- Define sample groups and metadata

### Step 2: Quality Control
- Assess raw data quality with FastQC
- Trim adapters and low-quality bases

### Step 3: Alignment & Quantification
- Align reads to reference genome (STAR/HISAT2)
- Quantify transcript abundance (featureCounts/Salmon)

### Step 4: Differential Expression
- Normalize counts (DESeq2/edgeR)
- Identify differentially expressed genes

### Step 5: Downstream Analysis
- Pathway enrichment (GSEA, GO analysis)
- Visualization (volcano plots, heatmaps)

What dataset would you like to work with? You can reference datasets using the **@** symbol (e.g., @TCGA-BRCA) or upload your own data.`,
  },
  {
    id: "e2",
    icon: Globe,
    text: "Perform analyses such as PCA and UMAP",
    chatTitle: "PCA & UMAP Analysis",
    userMessage: "Can you perform PCA and UMAP dimensionality reduction on a single-cell RNA-seq dataset to identify cell clusters?",
    assistantMessage: `## Dimensionality Reduction Analysis

I'll walk you through PCA and UMAP analysis for single-cell clustering:

### PCA Results
- **Components analyzed**: 50 principal components
- **Variance explained by PC1**: 12.4%
- **Variance explained by PC2**: 8.7%
- **Elbow point**: PC 15 (recommended cutoff)

### UMAP Clustering
Using the top 15 PCs, UMAP reveals **8 distinct cell clusters**:

| Cluster | Cell Count | Marker Genes | Putative Identity |
|---------|-----------|--------------|-------------------|
| 0 | 2,341 | CD3D, CD3E | T cells |
| 1 | 1,892 | CD14, LYZ | Monocytes |
| 2 | 1,456 | MS4A1, CD79A | B cells |
| 3 | 987 | NKG7, GNLY | NK cells |
| 4 | 654 | FCGR3A | CD16+ Monocytes |
| 5 | 432 | FCER1A, CST3 | Dendritic cells |
| 6 | 298 | PPBP | Megakaryocytes |
| 7 | 156 | IL7R, CCR7 | Naive T cells |

Would you like me to generate the UMAP visualization or explore specific clusters in more detail?`,
  },
  {
    id: "e3",
    icon: FileText,
    text: "Create informative plots (e.g., box plots, scatter plots)",
    chatTitle: "Data Visualization",
    userMessage: "Help me create publication-quality plots for my gene expression data — I need box plots comparing expression across groups and scatter plots for correlation analysis.",
    assistantMessage: `## Visualization Suite

I can generate several publication-ready plot types for your data:

### Available Visualizations

1. **Box Plots** — Compare gene expression across sample groups
   - Customizable: outlier display, jitter points, significance brackets
   - Support for grouped and faceted layouts

2. **Scatter Plots** — Correlation between two genes or conditions
   - With regression line and R² value
   - Color-coded by sample group or metadata

3. **Volcano Plots** — Differential expression overview
   - Highlight significant genes with labels
   - Adjustable FC and p-value thresholds

4. **Heatmaps** — Expression patterns across genes and samples
   - Hierarchical clustering with dendrograms
   - Custom color scales and annotations

### Next Steps
To get started, please provide:
- Your **dataset** (use @ to reference, e.g., @TCGA-BRCA)
- The **genes or comparisons** you're interested in
- Any **formatting preferences** (color scheme, figure dimensions)

Which plot type would you like to create first?`,
  },
];

interface WorkspaceViewProps {
  onStartExample?: (chatTitle: string, userMessage: string, assistantMessage: string) => void;
}

export function WorkspaceView({ onStartExample }: WorkspaceViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground mb-8">Your Workspace</h1>

        {/* Projects section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Projects</h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              Filter by
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_PROJECTS.map((project) => (
              <button
                key={project.id}
                className="text-left p-5 rounded-xl border border-border bg-background hover:bg-secondary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  {project.visibility === "private" ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Private
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      Shared
                    </>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-snug mb-2">
                  {project.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {project.description} · {project.updatedAt}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Examples section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAMPLE_TEMPLATES.map((example) => {
              const Icon = example.icon;
              return (
                <button
                  key={example.id}
                  onClick={() => onStartExample?.(example.chatTitle, example.userMessage, example.assistantMessage)}
                  className="text-left p-5 rounded-xl border border-border bg-background hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="mb-8">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {example.text}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
