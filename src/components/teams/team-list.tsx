"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Trash2, UserPlus, UserMinus } from "lucide-react";
import { useTeams, type TeamItem, type TeamMemberInfo } from "@/hooks/use-teams";
import {
  createTeamAction,
  addTeamMemberAction,
  removeTeamMemberAction,
  deleteTeamAction,
} from "@/actions/team.actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/shared/spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export function TeamList() {
  const router = useRouter();
  const { data, isLoading, error } = useTeams();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [addingMemberTo, setAddingMemberTo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreateTeam(formData: FormData) {
    const input = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
    };
    startTransition(async () => {
      const result = await createTeamAction(input);
      if (result.success) {
        setShowCreateForm(false);
        router.refresh();
      }
    });
  }

  function handleAddMember(teamId: string, userId: string) {
    startTransition(async () => {
      await addTeamMemberAction({ teamId, userId });
      setAddingMemberTo(null);
      router.refresh();
    });
  }

  function handleRemoveMember(teamId: string, userId: string) {
    startTransition(async () => {
      await removeTeamMemberAction({ teamId, userId });
      router.refresh();
    });
  }

  function handleDeleteTeam(teamId: string, teamName: string) {
    if (!window.confirm(`Delete team "${teamName}"?`)) return;
    startTransition(async () => {
      await deleteTeamAction(teamId);
      router.refresh();
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-soft border border-error/20 rounded-xl p-4 text-sm text-error">
        {error.message}
      </div>
    );
  }

  const teams = data?.teams ?? [];
  const orgMembers = data?.orgMembers ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus className="w-4 h-4" />
          New Team
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardContent className="pt-6">
            <form action={handleCreateTeam} className="space-y-4">
              <Input
                label="Team Name"
                name="name"
                placeholder="e.g., Design Team"
                required
                autoFocus
              />
              <Input
                label="Description"
                name="description"
                placeholder="Optional description..."
              />
              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="accent" size="sm" loading={isPending}>
                  Create Team
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {teams.length === 0 && !showCreateForm && (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Create teams to organize your members and assign them to projects."
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            orgMembers={orgMembers}
            addingMemberTo={addingMemberTo}
            isPending={isPending}
            onToggleAddMember={(id) =>
              setAddingMemberTo(addingMemberTo === id ? null : id)
            }
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onDelete={handleDeleteTeam}
          />
        ))}
      </div>
    </div>
  );
}

function TeamCard({
  team,
  orgMembers,
  addingMemberTo,
  isPending,
  onToggleAddMember,
  onAddMember,
  onRemoveMember,
  onDelete,
}: {
  team: TeamItem;
  orgMembers: TeamMemberInfo[];
  addingMemberTo: string | null;
  isPending: boolean;
  onToggleAddMember: (id: string) => void;
  onAddMember: (teamId: string, userId: string) => void;
  onRemoveMember: (teamId: string, userId: string) => void;
  onDelete: (teamId: string, name: string) => void;
}) {
  const memberIds = new Set(team.members.map((m) => m.user.id));
  const availableMembers = orgMembers.filter((m) => !memberIds.has(m.id));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{team.name}</CardTitle>
          {team.description && (
            <p className="text-xs text-slate mt-1">{team.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleAddMember(team.id)}
            className="p-1.5 rounded-lg text-stone hover:text-ink hover:bg-linen transition-colors"
            aria-label="Add member"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(team.id, team.name)}
            className="p-1.5 rounded-lg text-stone hover:text-error hover:bg-error-soft transition-colors"
            aria-label="Delete team"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {addingMemberTo === team.id && availableMembers.length > 0 && (
          <div className="mb-4 p-3 bg-linen/50 rounded-lg space-y-1">
            <p className="text-xs text-slate font-medium mb-2">Add member:</p>
            {availableMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => onAddMember(team.id, member.id)}
                disabled={isPending}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-ink hover:bg-paper transition-colors text-left"
              >
                <MemberAvatar name={member.name} />
                <span>{member.name}</span>
                <span className="text-xs text-stone ml-auto">{member.role}</span>
              </button>
            ))}
          </div>
        )}

        {team.members.length === 0 ? (
          <p className="text-sm text-stone text-center py-4">No members yet</p>
        ) : (
          <div className="space-y-2">
            {team.members.map(({ user }) => (
              <div
                key={user.id}
                className="flex items-center gap-3 group"
              >
                <MemberAvatar name={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-medium truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-stone">{user.email}</p>
                </div>
                <span className="text-xs text-slate bg-parchment px-2 py-0.5 rounded">
                  {user.role}
                </span>
                <button
                  onClick={() => onRemoveMember(team.id, user.id)}
                  disabled={isPending}
                  className="p-1 rounded text-stone opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                  aria-label={`Remove ${user.name}`}
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone/5 text-xs text-stone">
          <span>{team._count.members} member{team._count.members !== 1 ? "s" : ""}</span>
          <span>{team._count.projects} project{team._count.projects !== 1 ? "s" : ""}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
      "bg-terracotta-50 text-terracotta-600",
    )}>
      {initials}
    </div>
  );
}
