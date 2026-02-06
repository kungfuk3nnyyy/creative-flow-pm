import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { VendorList } from "@/components/vendors/vendor-list";

export default function VendorsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Vendors"
        description="Manage your vendor directory, contacts, and project assignments."
        actions={
          <Link href="/vendors/new">
            <Button variant="accent">Add Vendor</Button>
          </Link>
        }
      />

      <VendorList />
    </div>
  );
}
