"use client";

import { useState, useCallback } from "react";
import { LayoutGrid, List, FolderKanban } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "./project-card";
import { ProjectTable } from "./project-table";
import { ProjectFilters } from "./project-filters";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/shared/spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "table";

export function ProjectsList() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  // Reset page when filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);
  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);
  const handleTypeChange = useCallback((value: string) => {
    setType(value);
    setPage(1);
  }, []);

  const { data, isLoading, error } = useProjects({
    search: search || undefined,
    status: (status as "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED") || undefined,
    type: (type as "INTERIOR_DESIGN" | "CONFERENCE_DECOR" | "EXHIBITION" | "INSTALLATION" | "EXPERIENTIAL" | "OTHER") || undefined,
    page,
    perPage: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ProjectFilters
          search={search}
          status={status}
          type={type}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onTypeChange={handleTypeChange}
        />

        <div className="flex items-center gap-1 bg-parchment rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "grid"
                ? "bg-paper text-ink shadow-sm"
                : "text-stone hover:text-ink",
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "table"
                ? "bg-paper text-ink shadow-sm"
                : "text-stone hover:text-ink",
            )}
            aria-label="Table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-error-soft border border-error/20 rounded-xl p-4 text-sm text-error">
          {error.message}
        </div>
      )}

      {data && data.projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title={search || status || type ? "No matching projects" : "No projects yet"}
          description={
            search || status || type
              ? "Try adjusting your filters to find what you are looking for."
              : "Create your first project to start tracking budgets, milestones, and invoices."
          }
          actionLabel={!(search || status || type) ? "Create Project" : undefined}
          actionHref={!(search || status || type) ? "/projects/new" : undefined}
        />
      )}

      {data && data.projects.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-paper rounded-2xl border border-stone/10 shadow-sm overflow-hidden">
              <ProjectTable projects={data.projects} />
            </div>
          )}

          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            perPage={data.pagination.perPage}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
