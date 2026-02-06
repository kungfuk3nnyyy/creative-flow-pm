"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthError } from "@/lib/auth-utils";
import { updateProfileSchema, updateOrgSettingsSchema } from "@/lib/validations/settings";
import { UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function updateProfileAction(
  _prevState: ActionResult | null,
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

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  await prisma.user.update({
    where: { id: user.userId },
    data: { name: parsed.data.name },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateOrgSettingsAction(
  _prevState: ActionResult | null,
  formData: FormData,
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

  const parsed = updateOrgSettingsSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    taxRatePercent: formData.get("taxRatePercent"),
    invoicePrefix: formData.get("invoicePrefix"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  await prisma.organization.update({
    where: { id: user.organizationId },
    data: {
      name: parsed.data.name,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      website: parsed.data.website || null,
      taxRateBasisPoints: parsed.data.taxRatePercent,
      invoicePrefix: parsed.data.invoicePrefix,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}
