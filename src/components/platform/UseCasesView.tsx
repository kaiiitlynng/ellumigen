import { Dna, BarChart3, GitBranch, Microscope, FlaskConical, ArrowRight } from "lucide-react";

interface UseCase {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  domain: string;
  summary: string;
  steps: string[];
  tools: string[];
  outcome: string;
}

const USE_CASES: UseCase[] = [
  {
    id: "uc1",
    icon: Dna,
    title: "Differential Gene Expression Analysis",
    domain: "Transcriptomics",
    summary:
      "Identify differentially expressed genes between tumor and normal tissue using bulk RNA-seq data from TCGA, with downstream pathway enrichment and visualization.",
    steps: [
      "Import TCGA RNA-seq count matrices",
      "Normalize counts and perform quality control",
      "Run DESeq2 differential expression",
      "Apply multiple-testing correction (FDR < 0.05)",
      "Generate volcano plots, MA plots, and heatmaps",
      "Perform GO / KEGG pathway enrichment",
    ],
    tools: ["DESeq2", "clusterProfiler", "ggplot2"],
    outcome:
      "A ranked list of significant DEGs with pathway context, ready for experimental validation.",
  },
  {
    id: "uc2",
    icon: Microscope,
    title: "Single-Cell RNA-seq Clustering & Annotation",
    domain: "Single-Cell Genomics",
    summary:
      "Process 10x Chromium scRNA-seq data to discover cell populations in a tumor microenvironment, annotate clusters, and identify marker genes.",
    steps: [
      "Load Cell Ranger output (filtered feature-barcode matrices)",
      "Filter low-quality cells (mito%, nFeature thresholds)",
      "Normalize with SCTransform, run PCA",
      "Batch-correct with Harmony if multi-sample",
      "Cluster with Leiden algorithm, visualize via UMAP",
      "Annotate clusters using SingleR and known marker panels",
    ],
    tools: ["Seurat", "Harmony", "SingleR", "UMAP"],
    outcome:
      "Annotated UMAP embedding with cell-type labels, marker gene dot-plots, and differential abundance results.",
  },
  {
    id: "uc3",
    icon: BarChart3,
    title: "Survival Analysis Across Molecular Subtypes",
    domain: "Clinical Bioinformatics",
    summary:
      "Stratify cancer patients by molecular subtype and evaluate overall survival differences using Kaplan-Meier and Cox regression models.",
    steps: [
      "Merge clinical metadata with molecular subtype calls",
      "Construct Kaplan-Meier survival curves per subtype",
      "Perform log-rank tests for group comparisons",
      "Fit multivariate Cox proportional-hazards model",
      "Assess hazard ratios and confidence intervals",
      "Generate forest plots and survival curve figures",
    ],
    tools: ["survival (R)", "survminer", "ggforest"],
    outcome:
      "Publication-ready survival curves and a Cox model table quantifying subtype-specific prognostic risk.",
  },
  {
    id: "uc4",
    icon: GitBranch,
    title: "Variant Calling & Annotation Pipeline",
    domain: "Genomics",
    summary:
      "Detect somatic variants from matched tumor-normal whole-genome sequencing and annotate functional impact for driver gene discovery.",
    steps: [
      "Align reads to GRCh38 reference with BWA-MEM2",
      "Mark duplicates and recalibrate base quality scores",
      "Call somatic variants with Mutect2 (tumor-normal mode)",
      "Filter variants using GATK FilterMutectCalls",
      "Annotate with VEP for functional consequence",
      "Prioritize driver candidates using OncoKB / ClinVar",
    ],
    tools: ["BWA-MEM2", "GATK / Mutect2", "Ensembl VEP"],
    outcome:
      "A filtered VCF of high-confidence somatic mutations with clinical-grade functional annotations.",
  },
  {
    id: "uc5",
    icon: FlaskConical,
    title: "Drug Response Prediction from Multi-Omics",
    domain: "Pharmacogenomics",
    summary:
      "Integrate transcriptomic, proteomic, and mutation data to build a machine-learning model that predicts patient sensitivity to targeted therapies.",
    steps: [
      "Curate multi-omics feature matrices from CCLE / GDSC",
      "Impute missing values and harmonize feature spaces",
      "Engineer features (pathway scores, mutation burden)",
      "Train elastic-net and random-forest classifiers",
      "Evaluate via stratified cross-validation (AUROC)",
      "Interpret top predictive features with SHAP values",
    ],
    tools: ["scikit-learn", "SHAP", "pandas"],
    outcome:
      "A validated predictive model with interpretable biomarkers for therapy selection.",
  },
];

export function UseCasesView() {
  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Use Cases</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Explore common computational biology research workflows that Ellumigen
          can accelerate — from raw data to publication-ready results.
        </p>

        <div className="space-y-6">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            return (
              <article
                key={uc.id}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors group"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-primary/80 uppercase tracking-wider">
                      {uc.domain}
                    </span>
                    <h2 className="text-lg font-semibold text-foreground leading-snug mt-0.5">
                      {uc.title}
                    </h2>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {uc.summary}
                </p>

                {/* Workflow steps */}
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Workflow
                  </h3>
                  <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                    {uc.steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary font-mono text-xs mt-0.5 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tools + Outcome */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {uc.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-secondary-foreground"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium whitespace-nowrap">
                    <ArrowRight className="w-3.5 h-3.5" />
                    {uc.outcome.split(",")[0]}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
