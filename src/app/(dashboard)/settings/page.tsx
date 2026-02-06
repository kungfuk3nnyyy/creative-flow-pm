import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata = {
  title: "Settings - CreativeFlow",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.organizationId) {
    redirect("/login");
  }

  const [user, org] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { name: true, email: true, role: true },
    }),
    prisma.organization.findUniqueOrThrow({
      where: { id: session.user.organizationId },
      select: {
        name: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        taxRateBasisPoints: true,
        invoicePrefix: true,
      },
    }),
  ]);

  const canEditOrg = user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 text-ink font-display">Settings</h1>
        <p className="text-sm text-stone mt-1">Manage your profile and organization preferences.</p>
      </div>

      <SettingsTabs userName={user.name} userEmail={user.email} org={org} canEditOrg={canEditOrg} />
    </div>
  );
}
