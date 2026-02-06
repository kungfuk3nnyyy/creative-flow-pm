"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { createCommentAction } from "@/actions/comment.actions";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
  projectId: string;
}

export function CommentForm({ projectId }: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await createCommentAction({
        projectId,
        content: content.trim(),
      });
      if (result.success) {
        setContent("");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to post comment.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={2}
          className="flex-1 px-3 py-2.5 rounded-xl bg-paper border border-stone/20 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100 transition-all duration-150 resize-none"
        />
        <Button
          type="submit"
          variant="primary"
          size="icon"
          loading={isPending}
          disabled={!content.trim()}
          className="self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
