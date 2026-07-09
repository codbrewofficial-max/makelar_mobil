import type { Request, Response } from "express";
import { loginUser, getUserById } from "./auth.service";
import { success } from "../../utils/response";
import { env } from "../../config/env";

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function login(req: Request, res: Response) {
  const { token, user } = await loginUser(req.body);

  res.cookie("token", token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE_MS,
  });

  res.status(200).json(success(user));
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
  });
  res.status(200).json(success(null));
}

export async function me(req: Request, res: Response) {
  const user = await getUserById(req.user!.id);
  res.status(200).json(success(user));
}
