"use client";

import { useActionState, useEffect } from "react";
import { updateProfileAction } from "@/actions/settings.actions";
import { Input } from "@/components/ui/input";
import { toast } from "@/stores/toast-store";

interface ProfileFormProps {
  userName: string;
  userEmail: string;
}

export function ProfileForm({ userName, userEmail }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Profile updated.");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6 max-w-lg">
      <Input label="Full Name" name="name" defaultValue={userName} required disabled={isPending} />

      <div className="space-y-1.5">
        <label className="text-label text-slate">Email</label>
        <p className="text-sm text-ink">{userEmail}</p>
        <p className="text-xs text-stone">Email cannot be changed from settings.</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 rounded-xl bg-terracotta-500 text-white text-sm font-medium hover:bg-terracotta-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
