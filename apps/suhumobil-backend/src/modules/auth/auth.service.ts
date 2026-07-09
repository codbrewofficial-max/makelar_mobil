import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { signJwt } from "../../lib/jwt";
import { AppError } from "../../types";
import type { LoginInput } from "./auth.schema";

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || user.deletedAt) {
    throw new AppError(401, "UNAUTHORIZED", "Email atau password salah", {
      credentials: "Invalid email or password",
    });
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, "UNAUTHORIZED", "Email atau password salah", {
      credentials: "Invalid email or password",
    });
  }

  const token = signJwt({ userId: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    throw new AppError(401, "UNAUTHORIZED", "Unauthorized", { auth: "User tidak ditemukan" });
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
