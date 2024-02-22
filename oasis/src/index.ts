export type Result<T = undefined> =
  | ({ ok: true } & T)
  | { ok: false; error: Error; errorType: "token expired" | "unknown" };

export const Result = {
  Error: <T>(
    error: Error | string,
    errorType: "token expired" | "unknown" | undefined = "unknown",
  ): Result<T> => ({
    ok: false,
    error: typeof error === "string" ? new Error(error) : error,
    errorType,
  }),
  Ok: <T>(value: T): Result<T> => ({
    ok: true,
    ...value,
  }),
};

export {
  requestOboToken,
  requestAzureOboToken,
  requestTokenxOboToken,
} from "./obo";
export {
  validateToken,
  validateAzureToken,
  validateIdportenToken,
  validateTokenxToken,
} from "./validate";
export { getToken } from "./get-token";
export { expiresIn } from "./expires-in";
