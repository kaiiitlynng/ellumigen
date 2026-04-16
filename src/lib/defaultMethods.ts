import { BarChart3, FlaskConical, GitBranch, type LucideIcon } from "lucide-react";

export interface DefaultMethod {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const DEFAULT_METHODS: DefaultMethod[] = [
  {
    id: "statistical-analysis",
    label: "statistical-analysis",
    description: "DESeq2, t-test, ANOVA, survival analysis",
    icon: BarChart3,
  },
  {
    id: "pathway-enrichment",
    label: "pathway-enrichment",
    description: "GO, KEGG, Reactome enrichment",
    icon: GitBranch,
  },
  {
    id: "clustering",
    label: "clustering",
    description: "K-means, hierarchical, UMAP",
    icon: FlaskConical,
  },
  {
    id: "dimensionality-reduction",
    label: "dimensionality-reduction",
    description: "PCA, t-SNE, UMAP projections",
    icon: FlaskConical,
  },
];
