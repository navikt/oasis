import { decodeJwt } from "jose";

type Level = "High" | "Substantial"

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
