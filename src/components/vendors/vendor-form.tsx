"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";
import { createVendorAction } from "@/actions/vendor.actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { VENDOR_CATEGORY_LABELS } from "@/lib/validations/vendor";

const categoryOptions = Object.entries(VENDOR_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const ratingOptions = [
  { value: "1", label: "1 - Poor" },
  { value: "2", label: "2 - Below Average" },
  { value: "3", label: "3 - Average" },
  { value: "4", label: "4 - Good" },
  { value: "5", label: "5 - Excellent" },
];

export function VendorForm() {
  const [state, formAction, isPending] = useActionState(
    createVendorAction,
    null,
  );

  return (
    <div className="max-w-2xl mx-auto">
      {state?.error && (
        <div className="mb-6 flex items-center gap-2 bg-error-soft border border-error/20 rounded-xl p-4 text-sm text-error">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="space-y-5">
          <Input
            label="Vendor Name"
            name="name"
            placeholder="e.g., Premier Fabrications"
            required
          />

          <Select
            label="Category"
            name="category"
            options={categoryOptions}
            placeholder="Select a category"
            required
          />

          <Input
            label="Contact Name"
            name="contactName"
            placeholder="Primary contact person"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="vendor@example.com"
            />

            <Input
              label="Phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <Input
            label="Website"
            name="website"
            type="url"
            placeholder="https://example.com"
          />

          <Textarea
            label="Address"
            name="address"
            placeholder="Street address, city, state, ZIP"
            rows={2}
          />

          <Select
            label="Rating"
            name="rating"
            options={ratingOptions}
            placeholder="Select a rating"
          />

          <Textarea
            label="Notes"
            name="notes"
            placeholder="Internal notes about this vendor..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-stone/10">
          <Button type="submit" variant="accent" loading={isPending}>
            Add Vendor
          </Button>
        </div>
      </form>
    </div>
  );
}
