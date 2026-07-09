import { prisma } from "../../lib/prisma";

/**
 * Internal-only module (no public routes). Used by auth module and seed script.
 * Public registration is out of scope for MVP (00-development-rules.md section 29).
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
