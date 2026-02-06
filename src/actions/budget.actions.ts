"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import { createFinancialAuditLog } from "@/lib/services/audit.service";
import {
  createBudgetSchema,
  updateBudgetTotalSchema,
  addCategorySchema,
  updateCategorySchema,
} from "@/lib/validations/budget";
import { allocateFromTemplate } from "@/lib/financial/budget";
import { BUDGET_TEMPLATES } from "@/lib/financial/constants";
import { cents } from "@/lib/financial/types";
import { UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Create a budget for a project.
 * Optionally uses a template based on the project type.
 * Requires MANAGER role.
 */
export async function createBudgetAction(
  input: {
    projectId: string;
    totalAmountCents: number;
    notes?: string;
    useTemplate?: boolean;
  },
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

  const parsed = createBudgetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  // Verify project belongs to org
  const project = await prisma.project.findFirst({
    where: {
      id: parsed.data.projectId,
      organizationId: user.organizationId,
    },
  });

  if (!project) {
    return { success: false, error: "Project not found." };
  }

  // Check if budget already exists
  const existing = await prisma.budget.findFirst({
    where: { projectId: parsed.data.projectId },
  });

  if (existing) {
    return { success: false, error: "Project already has a budget." };
  }

  const totalCents = cents(parsed.data.totalAmountCents);

  // Determine categories from template or empty
  let categoryData: { name: string; allocatedCents: number; sortOrder: number }[] = [];

  if (parsed.data.useTemplate) {
    const template = BUDGET_TEMPLATES[project.type];
    if (template) {
      const allocated = allocateFromTemplate(totalCents, template.categories);
      categoryData = allocated.map((cat, i) => ({
        name: cat.name,
        allocatedCents: cat.allocatedCents,
        sortOrder: i,
      }));
    }
  }

  const budget = await prisma.budget.create({
    data: {
      projectId: parsed.data.projectId,
      totalAmountCents: totalCents,
      notes: parsed.data.notes || null,
      categories: {
        create: categoryData,
      },
    },
    include: { categories: true },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "budget.created",
    entityType: "Budget",
    entityId: budget.id,
    afterData: {
      totalAmountCents: budget.totalAmountCents,
      categories: budget.categories.length,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "budget.created",
    entityType: "Budget",
    entityId: budget.id,
    projectId: parsed.data.projectId,
    metadata: { totalAmountCents: budget.totalAmountCents },
  });

  revalidatePath(`/projects/${parsed.data.projectId}/budget`);

  return { success: true, data: { id: budget.id } };
}

/**
 * Update the total budget amount.
 * Requires MANAGER role.
 */
export async function updateBudgetTotalAction(
  input: { budgetId: string; totalAmountCents: number },
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

  const parsed = updateBudgetTotalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const budget = await prisma.budget.findFirst({
    where: { id: parsed.data.budgetId },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!budget || budget.project.organizationId !== user.organizationId) {
    return { success: false, error: "Budget not found." };
  }

  const beforeTotal = budget.totalAmountCents;

  await prisma.budget.update({
    where: { id: parsed.data.budgetId },
    data: { totalAmountCents: parsed.data.totalAmountCents },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "budget.total_updated",
    entityType: "Budget",
    entityId: parsed.data.budgetId,
    beforeData: { totalAmountCents: beforeTotal },
    afterData: { totalAmountCents: parsed.data.totalAmountCents },
  });

  revalidatePath(`/projects/${budget.project.id}/budget`);

  return { success: true };
}

/**
 * Add a category to a budget.
 * Requires MANAGER role.
 */
export async function addBudgetCategoryAction(
  input: { budgetId: string; name: string; allocatedCents: number },
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

  const parsed = addCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const budget = await prisma.budget.findFirst({
    where: { id: parsed.data.budgetId },
    include: {
      project: { select: { id: true, organizationId: true } },
      categories: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 },
    },
  });

  if (!budget || budget.project.organizationId !== user.organizationId) {
    return { success: false, error: "Budget not found." };
  }

  const nextSort = (budget.categories[0]?.sortOrder ?? -1) + 1;

  const category = await prisma.budgetCategory.create({
    data: {
      budgetId: parsed.data.budgetId,
      name: parsed.data.name,
      allocatedCents: parsed.data.allocatedCents,
      sortOrder: nextSort,
    },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "budget.category_added",
    entityType: "BudgetCategory",
    entityId: category.id,
    afterData: { name: category.name, allocatedCents: category.allocatedCents },
  });

  revalidatePath(`/projects/${budget.project.id}/budget`);

  return { success: true, data: { id: category.id } };
}

/**
 * Update a budget category (name or allocation).
 * Requires MANAGER role.
 */
export async function updateBudgetCategoryAction(
  input: { categoryId: string; name?: string; allocatedCents?: number },
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

  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const category = await prisma.budgetCategory.findFirst({
    where: { id: parsed.data.categoryId },
    include: {
      budget: {
        include: {
          project: { select: { id: true, organizationId: true } },
        },
      },
    },
  });

  if (!category || category.budget.project.organizationId !== user.organizationId) {
    return { success: false, error: "Category not found." };
  }

  const { categoryId, ...data } = parsed.data;

  await prisma.budgetCategory.update({
    where: { id: categoryId },
    data,
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "budget.category_updated",
    entityType: "BudgetCategory",
    entityId: categoryId,
    beforeData: { name: category.name, allocatedCents: category.allocatedCents },
    afterData: data,
  });

  revalidatePath(`/projects/${category.budget.project.id}/budget`);

  return { success: true };
}

/**
 * Delete a budget category.
 * Requires MANAGER role.
 */
export async function deleteBudgetCategoryAction(
  categoryId: string,
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

  const category = await prisma.budgetCategory.findFirst({
    where: { id: categoryId },
    include: {
      budget: {
        include: {
          project: { select: { id: true, organizationId: true } },
        },
      },
      _count: { select: { expenses: true } },
    },
  });

  if (!category || category.budget.project.organizationId !== user.organizationId) {
    return { success: false, error: "Category not found." };
  }

  if (category._count.expenses > 0) {
    return {
      success: false,
      error: "Cannot delete a category with linked expenses. Reassign them first.",
    };
  }

  await prisma.budgetCategory.delete({ where: { id: categoryId } });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "budget.category_deleted",
    entityType: "BudgetCategory",
    entityId: categoryId,
    beforeData: { name: category.name, allocatedCents: category.allocatedCents },
  });

  revalidatePath(`/projects/${category.budget.project.id}/budget`);

  return { success: true };
}
