export type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: Error };

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

export { validateToken } from "./validate";
export { requestOboToken } from "./obo";
