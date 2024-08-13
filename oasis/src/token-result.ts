export type TokenResult =
  | { ok: true; token: string }
  | { ok: false; error: Error };

export const TokenResult = {
  Error: (error: Error | string): TokenResult => ({
    ok: false,
    error: typeof error === "string" ? Error(error) : error,
  }),
  Ok: (token: string): TokenResult => {
    const res = {
      ok: true,
      token,
      toString: () => {
        throw Error(
          "TokenResult object can not be used as a string. If you tried to get the token, access the 'token' property.",
        );
      },
    } as const;
    return res;
  },
};
