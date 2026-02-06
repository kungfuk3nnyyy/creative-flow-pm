"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: Implement password reset with Resend email
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div>
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-success-soft flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-success" />
          </div>
          <h2 className="text-h1 text-ink">Check your email</h2>
          <p className="text-body text-slate mt-2">
            If an account exists with that email, we sent password reset
            instructions. Check your inbox.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-terracotta-500 hover:text-terracotta-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-h1 text-ink">Reset your password</h2>
        <p className="text-body text-slate mt-2">
          Enter your email address and we will send you a reset link.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@studio.com"
              required
              autoComplete="email"
              autoFocus
            />

            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-body-sm text-slate mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-terracotta-500 hover:text-terracotta-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
