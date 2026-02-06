"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { uploadFileAction, deleteFileAction } from "@/actions/file.actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}

interface FileListProps {
  files: FileItem[];
  projectId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return FileSpreadsheet;
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("document"))
    return FileText;
  return File;
}

export function FileList({ files, projectId }: FileListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const file = fileList[0];
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadFileAction(formData);
      if (!result.success) {
        setError(result.error ?? "Upload failed.");
      } else {
        router.refresh();
      }
    });
  }

  function handleDelete(fileId: string, fileName: string) {
    if (!window.confirm(`Delete "${fileName}"?`)) return;

    startTransition(async () => {
      const result = await deleteFileAction(fileId);
      if (!result.success) {
        setError(result.error ?? "Delete failed.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-error-soft border border-error/20 rounded-xl p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleUpload(e.dataTransfer.files);
        }}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
          isDragging
            ? "border-terracotta-400 bg-terracotta-50"
            : "border-stone/20 hover:border-stone/40",
          isPending && "opacity-60 pointer-events-none",
        )}
      >
        <Upload className="w-8 h-8 text-stone mx-auto mb-3" />
        <p className="text-sm text-ink font-medium mb-1">
          Drag files here or click to upload
        </p>
        <p className="text-xs text-stone mb-4">
          Max 10MB. PDF, images, documents, spreadsheets
        </p>
        <label>
          <input
            type="file"
            className="sr-only"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={isPending}
          />
          <Button
            variant="secondary"
            size="sm"
            loading={isPending}
            className="pointer-events-none"
            tabIndex={-1}
          >
            Choose File
          </Button>
        </label>
      </div>

      {/* File List */}
      {files.length === 0 && (
        <EmptyState
          icon={FolderOpen}
          title="No files uploaded"
          description="Upload project files like contracts, designs, and reference materials."
        />
      )}

      {files.length > 0 && (
        <div className="bg-paper rounded-xl border border-stone/10 divide-y divide-stone/5">
          {files.map((file) => {
            const Icon = getFileIcon(file.mimeType);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 px-4 py-3 group hover:bg-linen/50 transition-colors"
              >
                <div className="p-2 bg-linen rounded-lg shrink-0">
                  <Icon className="w-4 h-4 text-slate" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-stone">
                    {formatFileSize(file.sizeBytes)}
                    {" -- "}
                    {new Date(file.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(file.id, file.name)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-stone opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error-soft transition-all"
                  aria-label={`Delete ${file.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
