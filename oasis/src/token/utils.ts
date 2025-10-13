export const decodeJwt = (token: string): Record<string, unknown> =>
  JSON.parse(atob(token.split(".")[1]));

export const stripBearer = (token: string) => token.replace(/^Bearer /, "");
