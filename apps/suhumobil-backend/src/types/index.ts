import type { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Custom application error carrying an HTTP status and a stable error code
 * (see 04-api-contract.md section 6, Error Code Reference).
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(statusCode: number, code: string, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}
