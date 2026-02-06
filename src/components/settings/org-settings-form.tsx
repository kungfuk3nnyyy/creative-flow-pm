"use client";

import { useActionState, useEffect } from "react";
import { updateOrgSettingsAction } from "@/actions/settings.actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/stores/toast-store";

interface OrgSettingsFormProps {
  org: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    taxRateBasisPoints: number;
    invoicePrefix: string;
  };
  canEdit: boolean;
}

export function OrgSettingsForm({ org, canEdit }: OrgSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateOrgSettingsAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Organization settings updated.");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const taxRatePercent = (org.taxRateBasisPoints / 100).toFixed(2);

  if (!canEdit) {
    return (
      <div className="space-y-6 max-w-lg">
        <p className="text-sm text-stone">
          Only Managers and Admins can edit organization settings.
        </p>
        <div className="space-y-4">
          <ReadOnlyField label="Organization Name" value={org.name} />
          <ReadOnlyField label="Address" value={org.address} />
          <ReadOnlyField label="Phone" value={org.phone} />
          <ReadOnlyField label="Email" value={org.email} />
          <ReadOnlyField label="Website" value={org.website} />
          <ReadOnlyField label="Tax Rate" value={`${taxRatePercent}%`} />
          <ReadOnlyField label="Invoice Prefix" value={org.invoicePrefix} />
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 max-w-lg">
      <Input
        label="Organization Name"
        name="name"
        defaultValue={org.name}
        required
        disabled={isPending}
      />

      <Textarea
        label="Address"
        name="address"
        defaultValue={org.address ?? ""}
        disabled={isPending}
        className="min-h-[80px]"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={org.phone ?? ""}
          disabled={isPending}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          defaultValue={org.email ?? ""}
          disabled={isPending}
        />
      </div>

      <Input
        label="Website"
        name="website"
        type="url"
        placeholder="https://"
        defaultValue={org.website ?? ""}
        disabled={isPending}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Default Tax Rate (%)"
          name="taxRatePercent"
          type="number"
          min={0}
          max={100}
          step={0.01}
          defaultValue={taxRatePercent}
          disabled={isPending}
        />

        <Input
          label="Invoice Prefix"
          name="invoicePrefix"
          defaultValue={org.invoicePrefix}
          required
          disabled={isPending}
        />
      </div>

      <p className="text-xs text-stone">
        Enter the tax rate as a percentage (e.g., 16.00 for 16%). This applies as the default for
        new invoices.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 rounded-xl bg-terracotta-500 text-white text-sm font-medium hover:bg-terracotta-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving..." : "Save Organization"}
      </button>
    </form>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-label text-slate">{label}</p>
      <p className="text-sm text-ink">{value || "-"}</p>
    </div>
  );
}
