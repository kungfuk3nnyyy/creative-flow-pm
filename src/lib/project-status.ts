import type { ProjectStatus } from "@prisma/client";

/**
 * Valid project status transitions.
 *
 * DRAFT -> ACTIVE (start project)
 * ACTIVE -> ON_HOLD (pause)
 * ACTIVE -> COMPLETED (finish)
 * ON_HOLD -> ACTIVE (resume)
 * COMPLETED -> ARCHIVED (archive)
 * DRAFT -> ARCHIVED (cancel before starting)
 */
const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["ON_HOLD", "COMPLETED"],
  ON_HOLD: ["ACTIVE"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
};

/**
 * Check if a status transition is valid.
 */
export function isValidTransition(
  from: ProjectStatus,
  to: ProjectStatus,
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

/**
 * Get the list of valid next statuses for a given status.
 */
export function getValidNextStatuses(
  currentStatus: ProjectStatus,
): ProjectStatus[] {
  return VALID_TRANSITIONS[currentStatus];
}

/**
 * Transition labels for display in the UI.
 */
export const TRANSITION_LABELS: Record<string, string> = {
  "DRAFT->ACTIVE": "Start Project",
  "DRAFT->ARCHIVED": "Cancel Project",
  "ACTIVE->ON_HOLD": "Pause Project",
  "ACTIVE->COMPLETED": "Complete Project",
  "ON_HOLD->ACTIVE": "Resume Project",
  "COMPLETED->ARCHIVED": "Archive Project",
};

/**
 * Get the label for a specific transition.
 */
export function getTransitionLabel(
  from: ProjectStatus,
  to: ProjectStatus,
): string {
  return TRANSITION_LABELS[`${from}->${to}`] ?? `Move to ${to}`;
}
