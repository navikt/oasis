export type Result<T = undefined> =
  | ({ ok: true } & T)
  | { ok: false; error: Error };

export const Result = {
  Error: <T>(error: Error | string): Result<T> => ({
    ok: false,
    error: typeof error === "string" ? new Error(error) : error,
  }),
  Ok: <T>(value: T): Result<T> => ({
    ok: true,
    ...value,
  }),
};

export { requestOboToken } from "./obo";
export { validateToken } from "./validate";
export { getToken } from "./get-token";
