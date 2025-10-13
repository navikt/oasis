import { decodeJwt } from "./token/utils";

type Level = "High" | "Substantial";

/**
 * Returns true if the token has the login level specified.
 *
 * @param level IdPorten login level to check for.
 * @param token IdPorten token level with acr payload.
 */
export const isIdportenLoginLevel = (level: Level, token: string): boolean => {
  const { acr } = decodeJwt(token);

  if (typeof acr === "string") {
    if (level === "High") {
      return acr === "idporten-loa-high";
    } else if (level === "Substantial") {
      return acr === "idporten-loa-substantial";
    }
  }
  throw Error("acr is either missing or invalid");
};
