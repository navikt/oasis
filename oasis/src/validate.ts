import { createRemoteJWKSet, jwtVerify, errors } from "jose";
import { Result } from ".";

type ValidationResult = Result;

const validateJwt = async ({
  token,
  jwksUri,
  issuer,
  audience,
}: {
  token: string;
  jwksUri: string;
  issuer: string;
  audience: string;
}): Promise<ValidationResult> => {
  try {
    await jwtVerify(
      token,
      createRemoteJWKSet(new URL(jwksUri), {
        cacheMaxAge: 60 * 60 * 1000 /* 1 hour */,
      }),
      {
        issuer,
        audience,
        algorithms: ["RS256"],
      },
    );
    return Result.Ok(undefined);
  } catch (e) {
    return Result.Error(
      e as Error,
      e instanceof errors.JWTExpired ? "token expired" : "unknown",
    );
  }
};

export const validateIdportenToken = (token: string) =>
  validateJwt({
    token,
    jwksUri: process.env.IDPORTEN_JWKS_URI!,
    issuer: process.env.IDPORTEN_ISSUER!,
    audience: process.env.IDPORTEN_AUDIENCE!,
  });

export const validateAzureToken = (token: string) =>
  validateJwt({
    token,
    jwksUri: process.env.AZURE_OPENID_CONFIG_JWKS_URI!,
    issuer: process.env.AZURE_OPENID_CONFIG_ISSUER!,
    audience: process.env.AZURE_APP_CLIENT_ID!,
  });

export const validateTokenxToken = (token: string) =>
  validateJwt({
    token,
    jwksUri: process.env.TOKEN_X_JWKS_URI!,
    issuer: process.env.TOKEN_X_ISSUER!,
    audience: process.env.TOKEN_X_CLIENT_ID!,
  });

export const validateToken = async (
  token: string,
): Promise<ValidationResult> => {
  if (!token) {
    return Result.Error("empty token");
  }

  const idporten: boolean = !!process.env.IDPORTEN_ISSUER;
  const azure: boolean = !!process.env.AZURE_OPENID_CONFIG_ISSUER;

  if (idporten && azure) {
    return Result.Error("multiple identity providers");
  } else if (idporten) {
    return validateIdportenToken(token);
  } else if (azure) {
    return validateAzureToken(token);
  } else {
    return Result.Error("no identity provider");
  }
};
