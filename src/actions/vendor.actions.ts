"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import {
  createVendorSchema,
  updateVendorSchema,
} from "@/lib/validations/vendor";
import { UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Create a new vendor.
 * Requires MEMBER role.
 */
export async function createVendorAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MEMBER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const rawData = {
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    email: formData.get("email") as string | undefined,
    phone: formData.get("phone") as string | undefined,
    address: formData.get("address") as string | undefined,
    website: formData.get("website") as string | undefined,
    contactName: formData.get("contactName") as string | undefined,
    notes: formData.get("notes") as string | undefined,
    rating: formData.get("rating") as string | undefined,
  };

  const parsed = createVendorSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const vendor = await prisma.vendor.create({
    data: {
      organizationId: user.organizationId,
      name: parsed.data.name,
      category: parsed.data.category,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      website: parsed.data.website || null,
      contactName: parsed.data.contactName || null,
      notes: parsed.data.notes || null,
      rating: parsed.data.rating ?? null,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "vendor.created",
    entityType: "Vendor",
    entityId: vendor.id,
    metadata: { name: vendor.name, category: vendor.category },
  });

  revalidatePath("/vendors");

  redirect(`/vendors/${vendor.id}`);
}

/**
 * Update a vendor.
 * Requires MEMBER role.
 */
export async function updateVendorAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MEMBER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const rawData = {
    id: formData.get("id") as string,
    name: formData.get("name") as string | undefined,
    category: formData.get("category") as string | undefined,
    email: formData.get("email") as string | undefined,
    phone: formData.get("phone") as string | undefined,
    address: formData.get("address") as string | undefined,
    website: formData.get("website") as string | undefined,
    contactName: formData.get("contactName") as string | undefined,
    notes: formData.get("notes") as string | undefined,
    rating: formData.get("rating") as string | undefined,
  };

  const parsed = updateVendorSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const { id, ...data } = parsed.data;

  const vendor = await prisma.vendor.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!vendor) {
    return { success: false, error: "Vendor not found." };
  }

  await prisma.vendor.update({
    where: { id },
    data: {
      ...data,
      email: data.email || null,
      website: data.website || null,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "vendor.updated",
    entityType: "Vendor",
    entityId: id,
    metadata: { fields: Object.keys(data) },
  });

  revalidatePath(`/vendors/${id}`);
  revalidatePath("/vendors");

  return { success: true, data: { id } };
}

/**
 * Toggle vendor active/inactive.
 * Requires MANAGER role.
 */
export async function toggleVendorActiveAction(
  vendorId: string,
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

  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, organizationId: user.organizationId },
  });

  if (!vendor) {
    return { success: false, error: "Vendor not found." };
  }

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { isActive: !vendor.isActive },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: vendor.isActive ? "vendor.deactivated" : "vendor.activated",
    entityType: "Vendor",
    entityId: vendorId,
    metadata: { name: vendor.name },
  });

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath("/vendors");

  return { success: true };
}
