"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  Search,
  FolderKanban,
  FileText,
  Receipt,
  Building2,
  ArrowRight,
  X,
} from "lucide-react";

interface SearchResult {
  type: "project" | "invoice" | "expense" | "vendor";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  status?: string;
}

const TYPE_ICONS = {
  project: FolderKanban,
  invoice: FileText,
  expense: Receipt,
  vendor: Building2,
} as const;

const TYPE_LABELS = {
  project: "Project",
  invoice: "Invoice",
  expense: "Expense",
  vendor: "Vendor",
} as const;

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const close = useUIStore((s) => s.closeCommandPalette);
  const openPalette = useUIStore((s) => s.openCommandPalette);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          close();
        } else {
          openPalette();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close, openPalette]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      // Slight delay to ensure DOM is ready
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } catch {
      // Silently fail search
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  function handleSelect(result: SearchResult) {
    close();
    router.push(result.href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-modal bg-ink/30 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />

      {/* Dialog */}
      <div
        className="fixed top-[20%] left-1/2 -translate-x-1/2 z-modal w-full max-w-lg"
        role="dialog"
        aria-label="Search"
        aria-modal="true"
      >
        <div className="bg-paper rounded-2xl shadow-lg border border-stone/10 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-stone/10">
            <Search className="w-5 h-5 text-stone shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search projects, invoices, expenses, vendors..."
              className="flex-1 py-4 bg-transparent text-sm text-ink placeholder:text-stone outline-none"
              aria-label="Search"
              aria-autocomplete="list"
              aria-controls="command-results"
              aria-activedescendant={
                results[activeIndex] ? `result-${results[activeIndex].id}` : undefined
              }
            />
            <button
              onClick={close}
              className="p-1 rounded text-stone hover:text-ink transition-colors"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div
            id="command-results"
            role="listbox"
            className="max-h-80 overflow-y-auto"
          >
            {loading && query.length >= 2 ? (
              <div className="px-4 py-8 text-center text-sm text-stone">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, i) => {
                  const Icon = TYPE_ICONS[result.type];
                  return (
                    <button
                      key={result.id}
                      id={`result-${result.id}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        i === activeIndex ? "bg-linen" : "hover:bg-linen/50",
                      )}
                    >
                      <Icon className="w-4 h-4 text-stone shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink truncate">
                            {result.title}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-stone bg-linen px-1.5 py-0.5 rounded shrink-0">
                            {TYPE_LABELS[result.type]}
                          </span>
                        </div>
                        {result.subtitle && (
                          <p className="text-xs text-stone truncate mt-0.5">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-3 h-3 text-stone shrink-0 opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            ) : query.length >= 2 && !loading ? (
              <div className="px-4 py-8 text-center text-sm text-stone">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-stone">
                Type at least 2 characters to search
              </div>
            )}
          </div>

          {/* Footer hints */}
          <div className="px-4 py-2.5 border-t border-stone/10 flex items-center gap-4 text-[10px] text-stone">
            <span>
              <kbd className="px-1.5 py-0.5 bg-linen rounded text-[10px]">
                Up/Down
              </kbd>{" "}
              to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-linen rounded text-[10px]">
                Enter
              </kbd>{" "}
              to select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-linen rounded text-[10px]">
                Esc
              </kbd>{" "}
              to close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
