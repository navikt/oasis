import { decodeJwt } from "jose";

/**
 * Returns seconds until token expires.
 *
 * @param token Token with exp payload
 */
export const expiresIn = (token: string): number => {
  const { exp } = decodeJwt(token);
  if (exp === undefined) {
    throw Error("missing exp payload");
  } else {
    return Math.floor(exp - Date.now() / 1000);
  }
};
