import { useState } from "react";
import {
  Database,
  Search,
  Download,
  Eye,
  Calendar,
  HardDrive,
  Tag,
  ChevronDown,
  FileSpreadsheet,
  Dna,
  Activity,
  Microscope,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ArtifactType = "expression" | "clinical" | "genomic" | "imaging";

interface SampleDataset {
  id: string;
  name: string;
  description: string;
  type: ArtifactType;
  size: string;
  samples: number;
  genes?: number;
  features?: number;
  source: string;
  updatedAt: string;
  tags: string[];
}

const TYPE_CONFIG: Record<ArtifactType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  expression: { label: "Expression", icon: Dna, color: "text-emerald-500 bg-emerald-500/10" },
  clinical: { label: "Clinical", icon: Activity, color: "text-sky-500 bg-sky-500/10" },
  genomic: { label: "Genomic", icon: FileSpreadsheet, color: "text-amber-500 bg-amber-500/10" },
  imaging: { label: "Imaging", icon: Microscope, color: "text-violet-500 bg-violet-500/10" },
};

const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: "d1",
    name: "TCGA-BRCA RNA-seq",
    description: "Breast invasive carcinoma gene expression quantification from The Cancer Genome Atlas. Includes matched normal and tumor samples across all molecular subtypes.",
    type: "expression",
    size: "2.4 GB",
    samples: 1098,
    genes: 20531,
    source: "GDC Data Portal",
    updatedAt: "2026-03-14",
    tags: ["breast cancer", "RNA-seq", "TCGA", "paired-end"],
  },
  {
    id: "d2",
    name: "TCGA-LUAD Expression Matrix",
    description: "Lung adenocarcinoma normalized expression counts. Pre-processed with STAR aligner and featureCounts, TMM-normalized.",
    type: "expression",
    size: "1.8 GB",
    samples: 515,
    genes: 19847,
    source: "GDC Data Portal",
    updatedAt: "2026-03-10",
    tags: ["lung cancer", "RNA-seq", "TCGA", "adenocarcinoma"],
  },
  {
    id: "d3",
    name: "METABRIC Clinical Outcomes",
    description: "Clinical annotations for 1,904 breast cancer patients including survival time, treatment history, PAM50 subtype, and TP53 mutation status.",
    type: "clinical",
    size: "12 MB",
    samples: 1904,
    features: 34,
    source: "cBioPortal",
    updatedAt: "2026-02-28",
    tags: ["breast cancer", "survival", "clinical", "METABRIC"],
  },
  {
    id: "d4",
    name: "gnomAD v4.1 — Exome Variants",
    description: "Population allele frequencies from 807,162 exomes. Filtered to coding variants with MAF > 0.01% across global populations.",
    type: "genomic",
    size: "14.7 GB",
    samples: 807162,
    features: 287,
    source: "gnomAD",
    updatedAt: "2026-03-01",
    tags: ["exome", "population genetics", "variants", "allele frequency"],
  },
  {
    id: "d5",
    name: "CCLE Mutation Profiles",
    description: "Somatic mutation calls for 1,739 cancer cell lines across 37 tissue types. Annotated with functional impact predictions.",
    type: "genomic",
    size: "340 MB",
    samples: 1739,
    genes: 18120,
    source: "DepMap Portal",
    updatedAt: "2026-03-08",
    tags: ["cell lines", "mutations", "CCLE", "somatic"],
  },
  {
    id: "d6",
    name: "CAMELYON17 — Pathology Tiles",
    description: "Histopathology image patches (256×256 px) extracted from sentinel lymph node sections. Labeled for metastatic vs. normal tissue classification.",
    type: "imaging",
    size: "48.2 GB",
    samples: 500,
    features: 1200000,
    source: "Grand Challenge",
    updatedAt: "2026-01-22",
    tags: ["pathology", "H&E", "metastasis", "deep learning"],
  },
  {
    id: "d7",
    name: "GTEx v8 — Multi-tissue Expression",
    description: "Bulk RNA-seq expression from 54 human tissues across 948 donors. TPM-normalized with batch correction applied.",
    type: "expression",
    size: "6.1 GB",
    samples: 17382,
    genes: 20315,
    source: "GTEx Portal",
    updatedAt: "2026-02-15",
    tags: ["multi-tissue", "normal", "GTEx", "RNA-seq"],
  },
  {
    id: "d8",
    name: "UK Biobank — Cardiometabolic Panel",
    description: "Selected phenotypic variables for 78,400 participants covering BMI, blood pressure, lipid panels, HbA1c, and physical activity metrics.",
    type: "clinical",
    size: "890 MB",
    samples: 78400,
    features: 52,
    source: "UK Biobank",
    updatedAt: "2026-03-18",
    tags: ["cardiometabolic", "epidemiology", "UK Biobank", "phenotypes"],
  },
];

type FilterType = "all" | ArtifactType;

export function ArtifactsView() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = SAMPLE_DATASETS.filter((d) => {
    const matchesType = activeFilter === "all" || d.type === activeFilter;
    const matchesSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "expression", label: "Expression" },
    { key: "clinical", label: "Clinical" },
    { key: "genomic", label: "Genomic" },
    { key: "imaging", label: "Imaging" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Artifacts</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Browse and reference sample datasets in your analyses. Use{" "}
            <code className="text-xs px-1.5 py-0.5 rounded bg-secondary font-mono">@dataset-name</code>{" "}
            in chat to include them as context.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search datasets by name, source, or tag…"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-muted-foreground mr-1" />
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeFilter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} dataset{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Dataset List */}
        <div className="space-y-3">
          {filtered.map((dataset) => {
            const config = TYPE_CONFIG[dataset.type];
            const Icon = config.icon;
            const isExpanded = expandedId === dataset.id;

            return (
              <div
                key={dataset.id}
                className="rounded-xl border border-border bg-background hover:border-border/80 transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : dataset.id)}
                  className="w-full text-left p-5 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{dataset.name}</h3>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", config.color)}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {dataset.description}
                      </p>

                      {/* Quick stats */}
                      <div className="flex items-center gap-4 mt-2.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <HardDrive className="w-3 h-3" /> {dataset.size}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Database className="w-3 h-3" /> {dataset.samples.toLocaleString()} samples
                        </span>
                        {dataset.genes && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Dna className="w-3 h-3" /> {dataset.genes.toLocaleString()} genes
                          </span>
                        )}
                        {dataset.features && !dataset.genes && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="w-3 h-3" /> {dataset.features.toLocaleString()} features
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" /> {dataset.updatedAt}
                        </span>
                      </div>
                    </div>

                    {/* Expand indicator */}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 mt-1",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-border/50 mt-0">
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Source</p>
                        <p className="text-sm text-foreground">{dataset.source}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Last Updated</p>
                        <p className="text-sm text-foreground">{dataset.updatedAt}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {dataset.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2 flex gap-2 pt-2">
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]">
                          <Eye className="w-3.5 h-3.5" />
                          Preview Data
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors active:scale-[0.97]">
                          <Download className="w-3.5 h-3.5" />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Database className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No datasets match your search.</p>
              <button
                onClick={() => { setSearch(""); setActiveFilter("all"); }}
                className="text-xs text-primary hover:underline mt-2"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
