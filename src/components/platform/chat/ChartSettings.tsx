import { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export interface ChartSettings {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  colorUp: string;
  colorDown: string;
  colorNeutral: string;
  xLabel: string;
  yLabel: string;
}

interface ChartSettingsPanelProps {
  settings: ChartSettings;
  onChange: (settings: ChartSettings) => void;
  onClose: () => void;
  dataSource?: string;
}

function ChartSettingsPanel({ settings, onChange, onClose, dataSource }: ChartSettingsPanelProps) {
  const update = (partial: Partial<ChartSettings>) =>
    onChange({ ...settings, ...partial });

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 240, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="border-l border-border bg-card shrink-0 overflow-hidden"
    >
      <div className="w-[240px] p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Chart Settings</h4>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Data source */}
        {dataSource && (
          <div>
            <label className="text-xs text-muted-foreground">Data Source</label>
            <p className="text-sm text-foreground mt-0.5">{dataSource}</p>
          </div>
        )}

        {/* X-axis */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">X-axis</label>
          <select
            value={settings.xLabel}
            onChange={(e) => update({ xLabel: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option>{settings.xLabel}</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">Min</label>
              <input
                type="number"
                value={settings.xMin}
                onChange={(e) => update({ xMin: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Max</label>
              <input
                type="number"
                value={settings.xMax}
                onChange={(e) => update({ xMax: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Y-axis */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Y-axis</label>
          <select
            value={settings.yLabel}
            onChange={(e) => update({ yLabel: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option>{settings.yLabel}</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">Min</label>
              <input
                type="number"
                value={settings.yMin}
                onChange={(e) => update({ yMin: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Max</label>
              <input
                type="number"
                value={settings.yMax}
                onChange={(e) => update({ yMax: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Datapoint Colors */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Datapoint Colors</label>
          <ColorRow label="Primary / Up" color={settings.colorUp} onChange={(c) => update({ colorUp: c })} />
          <ColorRow label="Secondary / Down" color={settings.colorDown} onChange={(c) => update({ colorDown: c })} />
          <ColorRow label="Neutral" color={settings.colorNeutral} onChange={(c) => update({ colorNeutral: c })} />
        </div>
      </div>
    </motion.div>
  );
}

function ColorRow({ label, color, onChange }: { label: string; color: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded-md border border-border cursor-pointer p-0 bg-transparent"
      />
      <span className="text-xs text-foreground">{label}</span>
    </div>
  );
}

interface ChartWrapperProps {
  children: (settings: ChartSettings) => React.ReactNode;
  defaultSettings: ChartSettings;
  dataSource?: string;
}

export function ChartWrapper({ children, defaultSettings, dataSource }: ChartWrapperProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ChartSettings>(defaultSettings);

  return (
    <div className="flex rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex-1 relative min-w-0">
        {/* Three-dot menu */}
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg hover:bg-secondary transition-colors"
          title="Chart settings"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
        {children(settings)}
      </div>
      <AnimatePresence>
        {showSettings && (
          <ChartSettingsPanel
            settings={settings}
            onChange={setSettings}
            onClose={() => setShowSettings(false)}
            dataSource={dataSource}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
