import { useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { ChartWrapper, type ChartSettings } from "./ChartSettings";

interface VolcanoPoint {
  gene: string;
  log2FC: number;
  negLog10P: number;
  significant: boolean;
  direction: "up" | "down" | "ns";
}

interface VolcanoPlotProps {
  data?: VolcanoPoint[];
  title?: string;
}

const DEFAULT_DATA: VolcanoPoint[] = [
  { gene: "MDM2", log2FC: 3.42, negLog10P: 14.9, significant: true, direction: "up" },
  { gene: "CDKN1A", log2FC: -2.87, negLog10P: 11.5, significant: true, direction: "down" },
  { gene: "BAX", log2FC: 2.15, negLog10P: 10.1, significant: true, direction: "up" },
  { gene: "BCL2", log2FC: -1.93, negLog10P: 8.7, significant: true, direction: "down" },
  { gene: "TP63", log2FC: 1.87, negLog10P: 9.2, significant: true, direction: "up" },
  { gene: "GADD45A", log2FC: 1.65, negLog10P: 7.8, significant: true, direction: "up" },
  { gene: "PUMA", log2FC: -1.54, negLog10P: 7.1, significant: true, direction: "down" },
  { gene: "NOXA", log2FC: 1.42, negLog10P: 6.5, significant: true, direction: "up" },
  { gene: "FAS", log2FC: -1.38, negLog10P: 5.9, significant: true, direction: "down" },
  { gene: "SESN2", log2FC: 1.21, negLog10P: 5.4, significant: true, direction: "up" },
  ...Array.from({ length: 80 }, (_, i) => ({
    gene: `Gene${i + 1}`,
    log2FC: (Math.random() - 0.5) * 2,
    negLog10P: Math.random() * 3.5,
    significant: false,
    direction: "ns" as const,
  })),
];

const DEFAULT_SETTINGS: ChartSettings = {
  xMin: -5,
  xMax: 5,
  yMin: 0,
  yMax: 16,
  colorUp: "#d93025",
  colorDown: "#4285f4",
  colorNeutral: "#9aa0a6",
  xLabel: "log₂ Fold Change",
  yLabel: "-log₁₀(p-value)",
};

export function VolcanoPlot({ data = DEFAULT_DATA, title = "Volcano Plot — TP53 Wildtype vs Mutant" }: VolcanoPlotProps) {
  return (
    <ChartWrapper defaultSettings={DEFAULT_SETTINGS} dataSource="TCGA-BRCA Expression">
      {(settings) => (
        <div className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 pr-8">{title}</h3>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="log2FC"
                name="log₂FC"
                domain={[settings.xMin, settings.xMax]}
                label={{ value: settings.xLabel, position: "bottom", offset: 20, style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 } }}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                stroke="hsl(var(--border))"
              />
              <YAxis
                type="number"
                dataKey="negLog10P"
                name="-log₁₀(p)"
                domain={[settings.yMin, settings.yMax]}
                label={{ value: settings.yLabel, angle: -90, position: "insideLeft", offset: -5, style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 } }}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                stroke="hsl(var(--border))"
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload as VolcanoPoint;
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
                      <p className="text-sm font-semibold text-foreground">{d.gene}</p>
                      <p className="text-xs text-muted-foreground">log₂FC: {d.log2FC.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">-log₁₀(p): {d.negLog10P.toFixed(1)}</p>
                    </div>
                  );
                }}
              />
              <ReferenceLine x={-1} stroke="hsl(var(--muted-foreground) / 0.4)" strokeDasharray="4 4" />
              <ReferenceLine x={1} stroke="hsl(var(--muted-foreground) / 0.4)" strokeDasharray="4 4" />
              <ReferenceLine y={-Math.log10(0.05)} stroke="hsl(var(--muted-foreground) / 0.4)" strokeDasharray="4 4" />
              <Scatter data={data} fill={settings.colorNeutral}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      !entry.significant
                        ? settings.colorNeutral
                        : entry.direction === "up"
                        ? settings.colorUp
                        : settings.colorDown
                    }
                    r={entry.significant ? 5 : 3}
                    opacity={entry.significant ? 0.9 : 0.4}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: settings.colorUp }} />
              <span className="text-xs text-muted-foreground">Upregulated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: settings.colorDown }} />
              <span className="text-xs text-muted-foreground">Downregulated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: settings.colorNeutral }} />
              <span className="text-xs text-muted-foreground">Not significant</span>
            </div>
          </div>
        </div>
      )}
    </ChartWrapper>
  );
}
