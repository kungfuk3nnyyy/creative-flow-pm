import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { VendorForm } from "@/components/vendors/vendor-form";

export default function NewVendorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Vendor"
        description="Add a new vendor to your directory."
        actions={
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 text-sm text-slate hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vendors
          </Link>
        }
      />

      <VendorForm />
    </div>
  );
}
