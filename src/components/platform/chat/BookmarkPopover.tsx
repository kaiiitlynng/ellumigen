import { useState } from "react";
import { Bookmark, Plus, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BookmarkCollection } from "@/types/chat";

interface BookmarkPopoverProps {
  isBookmarked: boolean;
  activeCollectionIds: string[];
  collections: BookmarkCollection[];
  onToggleCollection: (collectionId: string) => void;
  onCreateCollection: (name: string) => void;
}

const COLLECTION_COLORS: Record<string, string> = {
  "Methods & Protocols": "bg-rose-700",
  "Key Findings": "bg-purple-700",
  "Datasets": "bg-blue-700",
};

export function BookmarkPopover({
  isBookmarked,
  activeCollectionIds,
  collections,
  onToggleCollection,
  onCreateCollection,
}: BookmarkPopoverProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateCollection(newName.trim());
      setNewName("");
      setIsCreating(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-1 rounded hover:bg-secondary transition-colors"
          title="Bookmark"
        >
          <Bookmark
            className={`w-3.5 h-3.5 ${
              isBookmarked ? "fill-accent text-accent" : "text-muted-foreground"
            }`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" side="top" align="start">
        {/* Header */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-3 h-3 text-foreground fill-foreground" />
            <span className="text-xs font-medium text-foreground">
              {isBookmarked ? "Saved!" : "Save to..."}
            </span>
          </div>
        </div>

        {/* Collections label + Add New */}
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Collections</span>
          <button
            onClick={() => setIsCreating(true)}
            className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:bg-secondary transition-colors"
          >
            ADD NEW
          </button>
        </div>

        {/* Collection list */}
        <div className="px-1.5 pb-1.5 space-y-0.5">
          {collections.map((col) => {
            const isActive = activeCollectionIds.includes(col.id);
            return (
              <button
                key={col.id}
                onClick={() => onToggleCollection(col.id)}
                className="flex items-center justify-between w-full px-1.5 py-1 rounded-md hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className={`w-3 h-3 shrink-0 fill-current ${col.color}`} />
                  <span className="text-xs text-foreground">{col.name}</span>
                </div>
                {isActive ? (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border" />
                )}
              </button>
            );
          })}

          {isCreating && (
            <div className="flex items-center gap-1 px-1.5 pt-0.5">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Collection name"
                className="flex-1 text-xs bg-secondary rounded px-1.5 py-0.5 text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={handleCreate}
                className="p-0.5 rounded hover:bg-secondary transition-colors"
              >
                <Plus className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
