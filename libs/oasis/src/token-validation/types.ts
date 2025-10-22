import type { JWTPayload } from "jose";

type ValidationErrorTypes = "token expired" | "unknown";

export type ValidationResult<Payload = unknown> =
  | {
      ok: true;
      payload: Payload & JWTPayload;
    }
  | {
      ok: false;
      error: Error;
      errorType: ValidationErrorTypes;
    };

export const ValidationResult = {
  Error: (
    error: Error | string,
    errorType: ValidationErrorTypes | undefined = "unknown",
  ): ValidationResult => ({
    ok: false,
    error: typeof error === "string" ? Error(error) : error,
    errorType,
  }),
  Ok: (payload: JWTPayload): ValidationResult => ({
    ok: true,
    payload,
  }),
};
