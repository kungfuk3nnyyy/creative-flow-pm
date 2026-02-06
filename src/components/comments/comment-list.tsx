"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCommentAction } from "@/actions/comment.actions";
import { cn } from "@/lib/utils";

interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface CommentListProps {
  comments: CommentItem[];
  currentUserId: string;
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(commentId: string) {
    startTransition(async () => {
      await deleteCommentAction(commentId);
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-4">
      {comments.map((comment) => {
        const isOwn = comment.author.id === currentUserId;
        const initials = comment.author.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div
            key={comment.id}
            className={cn(
              "flex items-start gap-3 group",
              isPending && "opacity-60",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-terracotta-50 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-terracotta-600">
                {initials}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-ink">
                  {comment.author.name}
                </span>
                <time className="text-xs text-stone">
                  {new Date(comment.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="text-sm text-slate whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>

            {isOwn && (
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={isPending}
                className="p-1 rounded text-stone opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                aria-label="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
