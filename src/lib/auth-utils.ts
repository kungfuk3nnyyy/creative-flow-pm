import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * Role hierarchy for permission checks.
 * Higher index = more permissions.
 */
const ROLE_HIERARCHY: UserRole[] = [
  UserRole.VIEWER,
  UserRole.MEMBER,
  UserRole.FINANCE,
  UserRole.MANAGER,
  UserRole.ADMIN,
];

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Get the current authenticated session or throw.
 * Use in server actions and API routes.
 */
export async function getAuthOrThrow() {
  const session = await auth();

  if (!session?.user?.id || !session.user.organizationId) {
    throw new AuthError("You must be signed in to perform this action.");
  }

  return session;
}

/**
 * Require authentication. Returns the session user info.
 * Throws AuthError if not authenticated.
 */
export async function requireAuth() {
  const session = await getAuthOrThrow();

  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    role: session.user.role,
    email: session.user.email!,
    name: session.user.name!,
  };
}

/**
 * Require a minimum role level.
 * Uses role hierarchy: VIEWER < MEMBER < FINANCE < MANAGER < ADMIN
 *
 * @param minimumRole - The minimum role required
 * @throws AuthError if user doesn't have sufficient permissions
 */
export async function requireRole(minimumRole: UserRole) {
  const user = await requireAuth();

  const userRoleIndex = ROLE_HIERARCHY.indexOf(user.role);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(minimumRole);

  if (userRoleIndex < requiredRoleIndex) {
    throw new AuthError(
      "You do not have permission to perform this action.",
      403,
    );
  }

  return user;
}

/**
 * Check if a user has a specific role (exact match, not hierarchy).
 */
export async function requireExactRole(...roles: UserRole[]) {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    throw new AuthError(
      "You do not have permission to perform this action.",
      403,
    );
  }

  return user;
}

/**
 * Check if the current user can approve expenses.
 * Admins, Managers, and Finance roles can approve.
 * A user cannot approve their own expense (checked separately).
 */
export async function requireExpenseApprover() {
  return requireRole(UserRole.FINANCE);
}

/**
 * Check if the current user can manage invoices.
 * Only Admin and Finance roles.
 */
export async function requireInvoiceAccess() {
  return requireExactRole(UserRole.ADMIN, UserRole.FINANCE);
}
