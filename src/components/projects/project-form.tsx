"use client";

import { useActionState, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { createProjectAction } from "@/actions/project.actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROJECT_TYPE_LABELS } from "@/lib/validations/project";

const STEPS = [
  { label: "Project Details", description: "Name, type, and description" },
  { label: "Client Info", description: "Client contact details" },
  { label: "Schedule", description: "Start and end dates" },
];

const typeOptions = Object.entries(PROJECT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function ProjectForm() {
  const [step, setStep] = useState(0);
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    null,
  );

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <nav className="mb-8" aria-label="Progress">
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex-1">
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "w-full flex flex-col items-start p-3 rounded-xl border transition-colors text-left",
                  i === step
                    ? "border-terracotta-300 bg-terracotta-50"
                    : i < step
                      ? "border-sage-300 bg-sage-50"
                      : "border-stone/10 bg-paper",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    i === step
                      ? "text-terracotta-600"
                      : i < step
                        ? "text-sage-600"
                        : "text-stone",
                  )}
                >
                  Step {i + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium mt-0.5",
                    i <= step ? "text-ink" : "text-slate",
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {state?.error && (
        <div className="mb-6 flex items-center gap-2 bg-error-soft border border-error/20 rounded-xl p-4 text-sm text-error">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={formAction}>
        {/* Step 1: Project Details */}
        <div className={cn(step === 0 ? "block" : "hidden", "space-y-5")}>
          <Input
            label="Project Name"
            name="name"
            placeholder="e.g., Annual Gala 2026"
            required
          />

          <Select
            label="Project Type"
            name="type"
            options={typeOptions}
            placeholder="Select a type"
            required
          />

          <Textarea
            label="Description"
            name="description"
            placeholder="Brief description of the project scope and objectives..."
            rows={4}
          />
        </div>

        {/* Step 2: Client Info */}
        <div className={cn(step === 1 ? "block" : "hidden", "space-y-5")}>
          <Input
            label="Client Name"
            name="clientName"
            placeholder="e.g., Acme Corporation"
          />

          <Input
            label="Client Email"
            name="clientEmail"
            type="email"
            placeholder="client@example.com"
          />

          <Input
            label="Client Phone"
            name="clientPhone"
            type="tel"
            placeholder="+1 (555) 000-0000"
          />

          <Textarea
            label="Client Address"
            name="clientAddress"
            placeholder="Street address, city, state, ZIP"
            rows={3}
          />
        </div>

        {/* Step 3: Schedule */}
        <div className={cn(step === 2 ? "block" : "hidden", "space-y-5")}>
          <Input
            label="Start Date"
            name="startDate"
            type="date"
          />

          <Input
            label="End Date"
            name="endDate"
            type="date"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone/10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            Back
          </Button>

          <div className="flex items-center gap-3">
            {!isLastStep && (
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            )}
            {isLastStep && (
              <Button type="submit" variant="accent" loading={isPending}>
                Create Project
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
