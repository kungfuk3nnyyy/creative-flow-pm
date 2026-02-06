import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  FolderKanban,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  StatusBadge,
  getProjectStatusVariant,
} from "@/components/shared/status-badge";
import { VENDOR_CATEGORY_LABELS } from "@/lib/validations/vendor";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/project";
import { cn } from "@/lib/utils";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    notFound();
  }

  const { vendorId } = await params;

  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      organizationId: session.user.organizationId,
    },
    include: {
      projects: {
        include: {
          project: {
            select: { id: true, name: true, status: true, type: true },
          },
        },
      },
    },
  });

  if (!vendor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/vendors"
          className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Vendors
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-h2 text-ink">{vendor.name}</h1>
            {!vendor.isActive && (
              <span className="text-xs text-stone bg-parchment px-2.5 py-1 rounded-full border border-stone/10">
                Inactive
              </span>
            )}
          </div>
          <p className="text-body-sm text-slate mt-1">
            {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-8 space-y-6">
          {/* Notes */}
          {vendor.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-slate whitespace-pre-wrap">
                  {vendor.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Associated Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.projects.length === 0 ? (
                <p className="text-body-sm text-stone text-center py-6">
                  Not assigned to any projects.
                </p>
              ) : (
                <div className="space-y-3">
                  {vendor.projects.map(({ project }) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-linen transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FolderKanban className="w-4 h-4 text-stone" />
                        <span className="text-sm font-medium text-ink">
                          {project.name}
                        </span>
                      </div>
                      <StatusBadge
                        variant={getProjectStatusVariant(project.status)}
                        label={PROJECT_STATUS_LABELS[project.status] ?? project.status}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendor.contactName && (
                <p className="text-sm font-medium text-ink">
                  {vendor.contactName}
                </p>
              )}
              {vendor.email && (
                <div className="flex items-center gap-2 text-sm text-slate">
                  <Mail className="w-4 h-4 text-stone" />
                  <a
                    href={`mailto:${vendor.email}`}
                    className="hover:text-terracotta-500 transition-colors"
                  >
                    {vendor.email}
                  </a>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center gap-2 text-sm text-slate">
                  <Phone className="w-4 h-4 text-stone" />
                  {vendor.phone}
                </div>
              )}
              {vendor.website && (
                <div className="flex items-center gap-2 text-sm text-slate">
                  <Globe className="w-4 h-4 text-stone" />
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-terracotta-500 transition-colors truncate"
                  >
                    {vendor.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-start gap-2 text-sm text-slate">
                  <MapPin className="w-4 h-4 text-stone shrink-0 mt-0.5" />
                  <span className="whitespace-pre-wrap">{vendor.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {vendor.rating && (
            <Card>
              <CardHeader>
                <CardTitle>Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < vendor.rating!
                          ? "text-warning fill-warning"
                          : "text-stone/30",
                      )}
                    />
                  ))}
                  <span className="ml-2 text-sm text-slate font-medium">
                    {vendor.rating}/5
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
