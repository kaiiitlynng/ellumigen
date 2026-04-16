import { useState } from "react";
import { FlaskConical, Plus, Trash2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useCustomMethods,
  addCustomMethod,
  deleteCustomMethod,
} from "@/stores/customMethodsStore";
import { DEFAULT_METHODS } from "@/lib/defaultMethods";

export function MethodsView() {
  const methods = useCustomMethods();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!label.trim()) {
      setError("Method name is required.");
      return;
    }
    const created = addCustomMethod(label, description);
    if (!created) {
      setError("A method with that name already exists, or the name is invalid.");
      return;
    }
    setLabel("");
    setDescription("");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Methods
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create custom methods that show up in chat when you type{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-xs font-mono">
              /
            </kbd>
            .
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6 mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New method
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Name
              </label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. survival-analysis"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Will be inserted as{" "}
                <span className="font-mono text-foreground">
                  /{label.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "your-method"}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this method does..."
                rows={2}
                maxLength={200}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Create method
              </Button>
            </div>
          </form>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Default methods{" "}
            <span className="text-muted-foreground font-normal">
              ({DEFAULT_METHODS.length})
            </span>
          </h2>
          <ul className="space-y-2">
            {DEFAULT_METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <li
                  key={m.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-violet-500/10 text-violet-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground font-mono">
                      /{m.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {m.description}
                    </div>
                  </div>
                  <span
                    className="p-1.5 text-muted-foreground"
                    title="Built-in method"
                    aria-label="Built-in method"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Your methods{" "}
            <span className="text-muted-foreground font-normal">
              ({methods.length})
            </span>
          </h2>
          {methods.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <FlaskConical className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No custom methods yet. Create one above to get started.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {methods.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-violet-500/10 text-violet-600">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground font-mono">
                      /{m.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {m.description}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCustomMethod(m.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                    aria-label={`Delete method ${m.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
