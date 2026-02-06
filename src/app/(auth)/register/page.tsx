"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-h1 text-ink">Create your account</h2>
        <p className="text-body text-slate mt-2">
          Set up your studio workspace in under a minute.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-error-soft border border-error/20">
                <AlertTriangle className="w-4 h-4 text-error shrink-0" />
                <p className="text-sm text-error">{state.error}</p>
              </div>
            )}

            <Input
              label="Studio / Company Name"
              name="organizationName"
              type="text"
              placeholder="Acme Design Studio"
              required
              autoFocus
            />

            <Input
              label="Your Name"
              name="name"
              type="text"
              placeholder="Jane Smith"
              required
              autoComplete="name"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="jane@acmedesign.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" loading={isPending}>
              Create account
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-body-sm text-slate mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-terracotta-500 hover:text-terracotta-600 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
