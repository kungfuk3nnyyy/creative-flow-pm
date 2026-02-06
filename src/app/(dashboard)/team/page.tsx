import { PageHeader } from "@/components/shared/page-header";
import { TeamList } from "@/components/teams/team-list";

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Manage your teams and assign members to projects."
      />

      <TeamList />
    </div>
  );
}
