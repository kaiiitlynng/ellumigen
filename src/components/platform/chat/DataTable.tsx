import { useState, useMemo } from "react";
import { ArrowUpDown, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataRow {
  [key: string]: string | number;
}

interface DataTableProps {
  columns: { key: string; label: string }[];
  data: DataRow[];
  itemsPerPageDefault?: number;
}

export function DataTable({ columns, data, itemsPerPageDefault = 7 }: DataTableProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageDefault);

  const filtered = useMemo(() => {
    let rows = [...data];
    for (const col of columns) {
      const f = filters[col.key]?.toLowerCase();
      if (f) {
        rows = rows.filter((r) =>
          String(r[col.key]).toLowerCase().includes(f)
        );
      }
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (typeof va === "number" && typeof vb === "number") {
          return sortDir === "asc" ? va - vb : vb - va;
        }
        return sortDir === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return rows;
  }, [data, columns, filters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paged = filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const rangeStart = filtered.length === 0 ? 0 : page * itemsPerPage + 1;
  const rangeEnd = Math.min((page + 1) * itemsPerPage, filtered.length);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="w-full rounded-xl border border-border overflow-hidden bg-background">
      {/* Filter row */}
      <div className="flex gap-2 p-3 border-b border-border bg-background">
        {columns.map((col) => (
          <div key={col.key} className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder={`Filter ${col.label.toLowerCase()}...`}
              value={filters[col.key] || ""}
              onChange={(e) => {
                setFilters((f) => ({ ...f, [col.key]: e.target.value }));
                setPage(0);
              }}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        ))}
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="text-left px-5 py-3 font-semibold text-foreground cursor-pointer select-none hover:bg-muted/80 transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.label}
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((row, i) => (
            <tr
              key={i}
              className="border-t border-border hover:bg-secondary/40 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-foreground">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {paged.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-muted-foreground">
                No matching data
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <input
            type="number"
            min={1}
            max={50}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Math.max(1, Number(e.target.value) || 1));
              setPage(0);
            }}
            className="w-14 px-2 py-1 rounded border border-border bg-background text-foreground text-center outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <span>
            {rangeStart}-{rangeEnd} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(0)} disabled={page === 0} className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
