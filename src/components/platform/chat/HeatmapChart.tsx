import { useMemo } from "react";
import { ChartWrapper, type ChartSettings } from "./ChartSettings";

interface HeatmapProps {
  title?: string;
}

const GENES = ["MDM2", "BAX", "CDKN1A", "BCL2", "TP63", "GADD45A", "PUMA", "FAS", "NOXA", "SESN2"];
const SAMPLES = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12"];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function interpolateColor(
  val: number,
  min: number,
  max: number,
  lowColor: string,
  highColor: string
): string {
  const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
  const [r1, g1, b1] = hexToRgb(lowColor);
  const [r2, g2, b2] = hexToRgb(highColor);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

const DEFAULT_SETTINGS: ChartSettings = {
  xMin: 0,
  xMax: 12,
  yMin: -3,
  yMax: 3,
  colorDown: "#1e50dc",
  colorNeutral: "#ffffbe",
  colorUp: "#ff4b28",
  xLabel: "Samples",
  yLabel: "Genes",
};

export function HeatmapChart({ title = "Expression Heatmap — Top DEGs" }: HeatmapProps) {
  const matrix = useMemo(() => {
    return GENES.map((gene, gi) =>
      SAMPLES.map((_, si) => {
        const seed = gi * 100 + si + 42;
        return parseFloat(((seededRandom(seed) - 0.5) * 6).toFixed(2));
      })
    );
  }, []);

  const cellSize = 36;
  const labelWidth = 72;
  const labelHeight = 40;

  return (
    <ChartWrapper defaultSettings={DEFAULT_SETTINGS} dataSource="TCGA-BRCA Expression">
      {(settings) => (
        <div className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 pr-8">{title}</h3>
          <div className="overflow-x-auto">
            <div className="inline-block">
              {/* Column headers */}
              <div className="flex" style={{ marginLeft: labelWidth }}>
                {SAMPLES.map((s) => (
                  <div
                    key={s}
                    className="text-[10px] text-muted-foreground font-mono text-center"
                    style={{ width: cellSize, height: labelHeight }}
                  >
                    {s}
                  </div>
                ))}
              </div>
              {/* Rows */}
              {GENES.map((gene, gi) => (
                <div key={gene} className="flex items-center">
                  <div
                    className="text-xs text-foreground font-mono pr-2 text-right shrink-0"
                    style={{ width: labelWidth }}
                  >
                    {gene}
                  </div>
                  {SAMPLES.map((_, si) => {
                    const val = matrix[gi][si];
                    const clampedVal = Math.max(settings.yMin, Math.min(settings.yMax, val));
                    const mid = (settings.yMin + settings.yMax) / 2;
                    const bgColor =
                      clampedVal < mid
                        ? interpolateColor(clampedVal, settings.yMin, mid, settings.colorDown, settings.colorNeutral)
                        : interpolateColor(clampedVal, mid, settings.yMax, settings.colorNeutral, settings.colorUp);
                    return (
                      <div
                        key={si}
                        className="border border-background/20 cursor-default"
                        style={{
                          width: cellSize,
                          height: cellSize - 8,
                          backgroundColor: bgColor,
                        }}
                        title={`${gene} / ${SAMPLES[si]}: ${val}`}
                      />
                    );
                  })}
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-[10px] text-muted-foreground">{settings.yMin}</span>
                <div
                  className="h-3 rounded-sm"
                  style={{
                    width: 120,
                    background: `linear-gradient(to right, ${settings.colorDown}, ${settings.colorNeutral}, ${settings.colorUp})`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">+{settings.yMax}</span>
                <span className="text-[10px] text-muted-foreground ml-2">log₂FC</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ChartWrapper>
  );
}
