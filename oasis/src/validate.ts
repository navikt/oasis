import { JWTPayload, createRemoteJWKSet, errors, jwtVerify } from "jose";
import { stripBearer } from "./strip-bearer";

type ErrorTypes = "token expired" | "unknown";

export type ValidationResult<Payload = unknown> =
  | {
      ok: true;
      payload: Payload & JWTPayload;
    }
  | {
      ok: false;
      error: Error;
      errorType: ErrorTypes;
    };

const ValidationResult = {
  Error: (
    error: Error | string,
    errorType: ErrorTypes | undefined = "unknown",
  ): ValidationResult => ({
    ok: false,
    error: typeof error === "string" ? Error(error) : error,
    errorType,
  }),
  Ok: (payload: JWTPayload): ValidationResult => ({
    ok: true,
    payload,
  }),
};

let remoteJWKSet: ReturnType<typeof createRemoteJWKSet>;

const getJwkSet = (jwksUri: string): ReturnType<typeof createRemoteJWKSet> => {
  if (!remoteJWKSet) {
    remoteJWKSet = createRemoteJWKSet(new URL(jwksUri));
  }

  return remoteJWKSet;
};

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
    const { payload } = await jwtVerify(
      stripBearer(token),
      getJwkSet(jwksUri),
      {
        issuer,
        audience,
        algorithms: ["RS256"],
      },
    );
    return ValidationResult.Ok(payload);
  } catch (e) {
    return ValidationResult.Error(
      e as Error,
      e instanceof errors.JWTExpired ? "token expired" : "unknown",
    );
  }
};

export type IdportenPayload = {
  pid: string;
  acr: string;
};

/**
 * Validates token issued by Idporten. Requires Idporten to be enabled in nais
 * application manifest.
 *
 * @param token Token issued by Idporten.
 */
export const validateIdportenToken = (
  token: string,
): Promise<ValidationResult<Partial<IdportenPayload>>> =>
  validateJwt({
    token,
    jwksUri: process.env.IDPORTEN_JWKS_URI!,
    issuer: process.env.IDPORTEN_ISSUER!,
    audience: process.env.IDPORTEN_AUDIENCE!,
  });

export type AzurePayload = {
  NAVident: string;
  name: string;
  preferred_username: string;
  /**
   * Property `groups` is only available for tokens with a user context.
   */
  groups?: string[];
};

/**
 * Validates token issued by Azure. Requires Azure to be enabled in nais
 * application manifest.
 *
 * @param token Token issued by Azure.
 */
export const validateAzureToken = (
  token: string,
): Promise<ValidationResult<Partial<AzurePayload>>> =>
  validateJwt({
    token,
    jwksUri: process.env.AZURE_OPENID_CONFIG_JWKS_URI!,
    issuer: process.env.AZURE_OPENID_CONFIG_ISSUER!,
    audience: process.env.AZURE_APP_CLIENT_ID!,
  });

/**
 * Validates token issued by Tokenx. Requires Tokenx to be enabled in nais
 * application manifest.
 *
 * @param token Token issued by Tokenx.
 */
export const validateTokenxToken = (token: string): Promise<ValidationResult> =>
  validateJwt({
    token,
    jwksUri: process.env.TOKEN_X_JWKS_URI!,
    issuer: process.env.TOKEN_X_ISSUER!,
    audience: process.env.TOKEN_X_CLIENT_ID!,
  });

/**
 * Validates token issued by Idporten or Azure. Requires either Idporten or
 * Azure to be enabled in nais application manifest.
 *
 * @param token Token issued by Idporten or Azure.
 */
export const validateToken = async (
  token: string,
): Promise<ValidationResult> => {
  if (!token) {
    return ValidationResult.Error("empty token");
  }

  const idporten: boolean = !!process.env.IDPORTEN_ISSUER;
  const azure: boolean = !!process.env.AZURE_OPENID_CONFIG_ISSUER;

  if (idporten && azure) {
    return ValidationResult.Error("multiple identity providers");
  } else if (idporten) {
    return validateIdportenToken(token);
  } else if (azure) {
    return validateAzureToken(token);
  } else {
    return ValidationResult.Error("no identity provider");
  }
};
