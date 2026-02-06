"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-h1 text-ink">Welcome back</h2>
        <p className="text-body text-slate mt-2">
          Sign in to your CreativeFlow account.
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
              label="Email"
              name="email"
              type="email"
              placeholder="you@studio.com"
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-terracotta-500 hover:text-terracotta-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={isPending}>
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-body-sm text-slate mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-terracotta-500 hover:text-terracotta-600 font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
