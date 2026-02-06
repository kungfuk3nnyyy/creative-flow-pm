import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    notFound();
  }

  const { projectId } = await params;

  const [activities, comments] = await Promise.all([
    prisma.activityLog.findMany({
      where: {
        projectId,
        organizationId: session.user.organizationId,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    }),
    prisma.comment.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    }),
  ]);

  return (
    <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Comments - 8 cols */}
      <div className="xl:col-span-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentForm projectId={projectId} />

            {comments.length === 0 ? (
              <p className="text-sm text-stone text-center py-6 mt-4">
                No comments yet. Start a discussion.
              </p>
            ) : (
              <CommentList
                comments={comments}
                currentUserId={session.user.id}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Log - 4 cols */}
      <div className="xl:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No activity yet"
                description="Activity will appear here as the project progresses."
              />
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-2.5 py-2 border-b border-stone/5 last:border-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-linen flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-medium text-slate">
                        {activity.user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) ?? "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ink">
                        <span className="font-medium">
                          {activity.user?.name ?? "System"}
                        </span>{" "}
                        <span className="text-slate">
                          {formatAction(activity.action)}
                        </span>
                      </p>
                      <time className="text-[10px] text-stone mt-0.5 block">
                        {new Date(activity.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    "project.created": "created this project",
    "project.updated": "updated the project",
    "project.status_changed": "changed the project status",
    "project.archived": "archived the project",
    "project.deleted": "deleted the project",
    "milestone.created": "added a milestone",
    "milestone.updated": "updated a milestone",
    "milestone.completed": "completed a milestone",
    "milestone.reopened": "reopened a milestone",
    "milestone.deleted": "deleted a milestone",
    "task.created": "created a task",
    "task.updated": "updated a task",
    "task.status_changed": "moved a task",
    "task.deleted": "deleted a task",
    "expense.created": "submitted an expense",
    "expense.approved": "approved an expense",
    "expense.rejected": "rejected an expense",
    "invoice.created": "created an invoice",
    "invoice.sent": "sent an invoice",
    "payment.recorded": "recorded a payment",
    "file.uploaded": "uploaded a file",
    "file.deleted": "deleted a file",
    "comment.created": "added a comment",
    "vendor.created": "added a vendor",
    "team.created": "created a team",
    "team.member_added": "added a team member",
    "team.member_removed": "removed a team member",
  };

  return actionMap[action] ?? action.replace(/\./g, " ");
}
