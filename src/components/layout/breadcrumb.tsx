"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  pathname: string;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  expenses: "Expenses",
  invoices: "Invoices",
  "ar-aging": "AR Aging",
  reports: "Reports",
  vendors: "Vendors",
  team: "Team",
  settings: "Settings",
  new: "New",
  edit: "Edit",
  milestones: "Milestones",
  tasks: "Tasks",
  budgets: "Budgets",
  files: "Files",
  comments: "Comments",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSegments(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const items: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Skip UUID segments in breadcrumb labels (they stay in href for navigation)
    if (UUID_REGEX.test(segment)) {
      continue;
    }

    const label =
      ROUTE_LABELS[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({ label, href: currentPath });
  }

  return items;
}

export function Breadcrumb({ pathname }: BreadcrumbProps) {
  const items = getSegments(pathname);

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-body-sm">
      {items.map((item, i) => (
        <Fragment key={item.href}>
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone" />}
          {i === items.length - 1 ? (
            <span className="font-medium text-ink" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link href={item.href} className="text-slate hover:text-ink transition-colors">
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
