"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import { createCommentSchema } from "@/lib/validations/comment";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Create a comment on a project.
 */
export async function createCommentAction(
  input: { projectId: string; content: string },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  // Verify project access
  const project = await prisma.project.findFirst({
    where: {
      id: parsed.data.projectId,
      organizationId: user.organizationId,
    },
  });

  if (!project) {
    return { success: false, error: "Project not found." };
  }

  const comment = await prisma.comment.create({
    data: {
      projectId: parsed.data.projectId,
      authorId: user.userId,
      content: parsed.data.content,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "comment.created",
    entityType: "Comment",
    entityId: comment.id,
    projectId: parsed.data.projectId,
  });

  revalidatePath(`/projects/${parsed.data.projectId}/activity`);

  return { success: true, data: { id: comment.id } };
}

/**
 * Delete a comment. Only the author or ADMIN can delete.
 */
export async function deleteCommentAction(
  commentId: string,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const comment = await prisma.comment.findFirst({
    where: { id: commentId },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!comment || comment.project.organizationId !== user.organizationId) {
    return { success: false, error: "Comment not found." };
  }

  // Only author or ADMIN can delete
  if (comment.authorId !== user.userId && user.role !== "ADMIN") {
    return { success: false, error: "You can only delete your own comments." };
  }

  await prisma.comment.delete({ where: { id: commentId } });

  revalidatePath(`/projects/${comment.project.id}/activity`);

  return { success: true };
}
