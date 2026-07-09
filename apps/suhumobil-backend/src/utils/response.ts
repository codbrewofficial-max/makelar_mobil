/**
 * Standard API response helpers per 00-development-rules.md section 11.
 * MUST be used by every controller - never build response objects manually.
 */
export function success<T>(data: T, message = "Success", meta?: object) {
  return {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function failure(message: string, errors?: object) {
  return {
    success: false,
    message,
    errors: errors ?? {},
  };
}
