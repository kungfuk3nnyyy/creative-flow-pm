"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import { getStorageProvider, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from "@/lib/storage";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Upload a file to a project.
 * Accepts FormData with a "file" field and "projectId" field.
 */
export async function uploadFileAction(
  formData: FormData,
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

  const projectId = formData.get("projectId") as string;
  const file = formData.get("file") as File | null;

  if (!projectId) {
    return { success: false, error: "Project ID is required." };
  }

  if (!file || !(file instanceof File)) {
    return { success: false, error: "No file provided." };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File must be 10MB or smaller." };
  }

  // Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, error: "File type not supported." };
  }

  // Verify project access
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: user.organizationId },
  });

  if (!project) {
    return { success: false, error: "Project not found." };
  }

  // Generate storage key
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `${user.organizationId}/${projectId}/${timestamp}-${safeFileName}`;

  // Upload to storage
  const storage = getStorageProvider();
  const buffer = Buffer.from(await file.arrayBuffer());
  await storage.upload(storageKey, buffer, file.type);

  // Create database record
  const projectFile = await prisma.projectFile.create({
    data: {
      projectId,
      name: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      storageKey,
      uploadedById: user.userId,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "file.uploaded",
    entityType: "ProjectFile",
    entityId: projectFile.id,
    projectId,
    metadata: { name: file.name, size: file.size },
  });

  revalidatePath(`/projects/${projectId}/files`);

  return { success: true, data: { id: projectFile.id } };
}

/**
 * Delete a project file.
 */
export async function deleteFileAction(
  fileId: string,
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

  const file = await prisma.projectFile.findFirst({
    where: { id: fileId },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!file || file.project.organizationId !== user.organizationId) {
    return { success: false, error: "File not found." };
  }

  // Delete from storage
  const storage = getStorageProvider();
  await storage.delete(file.storageKey);

  // Delete database record
  await prisma.projectFile.delete({ where: { id: fileId } });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "file.deleted",
    entityType: "ProjectFile",
    entityId: fileId,
    projectId: file.project.id,
    metadata: { name: file.name },
  });

  revalidatePath(`/projects/${file.project.id}/files`);

  return { success: true };
}
