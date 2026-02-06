"use client";

import { useSession } from "next-auth/react";
import { logoutAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  FINANCE: "Finance",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl",
        "hover:bg-linen transition-colors group",
        collapsed && "justify-center px-0",
      )}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-terracotta-100 text-terracotta-700 flex items-center justify-center text-xs font-medium shrink-0">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User"}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{session.user.name}</p>
            <p className="text-xs text-stone truncate">
              {ROLE_LABELS[(session.user as { role?: string }).role ?? ""] ?? session.user.email}
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="p-1.5 rounded-lg text-stone opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error-soft transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
