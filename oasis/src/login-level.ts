import { decodeJwt } from "jose";

export const isLoginLevelHigh = (token: string): boolean => {
  const { acr } = decodeJwt(token);

  if (typeof acr === "string") {
    return acr === "idporten-loa-high";
  }
  throw Error("acr is either missing or invalid");
};
