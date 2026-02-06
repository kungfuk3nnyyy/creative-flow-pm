"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
  removeTeamMemberSchema,
} from "@/lib/validations/team";
import { UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Create a new team.
 * Requires MANAGER role.
 */
export async function createTeamAction(
  input: { name: string; description?: string },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = createTeamSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  // Check unique team name within org
  const existing = await prisma.team.findFirst({
    where: {
      organizationId: user.organizationId,
      name: parsed.data.name,
    },
  });

  if (existing) {
    return { success: false, error: "A team with this name already exists." };
  }

  const team = await prisma.team.create({
    data: {
      organizationId: user.organizationId,
      name: parsed.data.name,
      description: parsed.data.description || null,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "team.created",
    entityType: "Team",
    entityId: team.id,
    metadata: { name: team.name },
  });

  revalidatePath("/team");

  return { success: true, data: { id: team.id } };
}

/**
 * Update team details.
 * Requires MANAGER role.
 */
export async function updateTeamAction(
  input: { id: string; name?: string; description?: string },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = updateTeamSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const team = await prisma.team.findFirst({
    where: { id: parsed.data.id, organizationId: user.organizationId },
  });

  if (!team) {
    return { success: false, error: "Team not found." };
  }

  const { id, ...data } = parsed.data;

  await prisma.team.update({
    where: { id },
    data,
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "team.updated",
    entityType: "Team",
    entityId: id,
    metadata: { fields: Object.keys(data) },
  });

  revalidatePath("/team");

  return { success: true, data: { id } };
}

/**
 * Add a member to a team.
 * Requires MANAGER role.
 */
export async function addTeamMemberAction(
  input: { teamId: string; userId: string },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = addTeamMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  // Verify team and user belong to same org
  const [team, member] = await Promise.all([
    prisma.team.findFirst({
      where: { id: parsed.data.teamId, organizationId: user.organizationId },
    }),
    prisma.user.findFirst({
      where: {
        id: parsed.data.userId,
        organizationId: user.organizationId,
        isActive: true,
      },
    }),
  ]);

  if (!team) {
    return { success: false, error: "Team not found." };
  }
  if (!member) {
    return { success: false, error: "User not found." };
  }

  // Check if already a member
  const existing = await prisma.teamMember.findFirst({
    where: {
      teamId: parsed.data.teamId,
      userId: parsed.data.userId,
    },
  });

  if (existing) {
    return { success: false, error: "User is already a team member." };
  }

  await prisma.teamMember.create({
    data: {
      teamId: parsed.data.teamId,
      userId: parsed.data.userId,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "team.member_added",
    entityType: "Team",
    entityId: parsed.data.teamId,
    metadata: { memberId: parsed.data.userId, memberName: member.name },
  });

  revalidatePath("/team");

  return { success: true };
}

/**
 * Remove a member from a team.
 * Requires MANAGER role.
 */
export async function removeTeamMemberAction(
  input: { teamId: string; userId: string },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = removeTeamMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: parsed.data.teamId,
      userId: parsed.data.userId,
    },
    include: {
      team: { select: { organizationId: true } },
    },
  });

  if (!membership || membership.team.organizationId !== user.organizationId) {
    return { success: false, error: "Team membership not found." };
  }

  await prisma.teamMember.delete({ where: { id: membership.id } });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "team.member_removed",
    entityType: "Team",
    entityId: parsed.data.teamId,
    metadata: { memberId: parsed.data.userId },
  });

  revalidatePath("/team");

  return { success: true };
}

/**
 * Delete a team.
 * Requires ADMIN role.
 */
export async function deleteTeamAction(
  teamId: string,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const team = await prisma.team.findFirst({
    where: { id: teamId, organizationId: user.organizationId },
  });

  if (!team) {
    return { success: false, error: "Team not found." };
  }

  await prisma.team.delete({ where: { id: teamId } });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "team.deleted",
    entityType: "Team",
    entityId: teamId,
    metadata: { name: team.name },
  });

  revalidatePath("/team");

  return { success: true };
}
