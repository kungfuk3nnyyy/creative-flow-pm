"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProfileForm } from "./profile-form";
import { OrgSettingsForm } from "./org-settings-form";

type Tab = "profile" | "organization";

interface SettingsTabsProps {
  userName: string;
  userEmail: string;
  org: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    taxRateBasisPoints: number;
    invoicePrefix: string;
  };
  canEditOrg: boolean;
}

const tabs: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "organization", label: "Organization" },
];

export function SettingsTabs({ userName, userEmail, org, canEditOrg }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-stone/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-terracotta-500 text-ink"
                : "border-transparent text-stone hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && <ProfileForm userName={userName} userEmail={userEmail} />}

      {activeTab === "organization" && <OrgSettingsForm org={org} canEdit={canEditOrg} />}
    </div>
  );
}
