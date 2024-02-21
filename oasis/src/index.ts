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

export { requestOboToken } from "./obo";
export { validateToken } from "./validate";
export { getToken } from "./get-token";
