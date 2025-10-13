import { texas } from "./texas/texas";
import type { IdentityProvider } from "./texas/types.gen";
import { stripBearer } from "./token/utils";

type ErrorTypes = "token expired" | "unknown";

type JWTPayload = {
  active: boolean;
  aud: string;
  azp: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  nbf: number;
  sub: string;
  tid: string;
};

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

const validateJwt = async (
  token: string,
  provider: IdentityProvider,
): Promise<ValidationResult> => {
  try {
    const payload = await texas.introspect(stripBearer(token), provider);

    if (!payload.active) {
      return ValidationResult.Error("token expired");
    }

    return ValidationResult.Ok(payload as JWTPayload);
  } catch (e) {
    return ValidationResult.Error(e as Error, "unknown");
  }
};

export type IdportenPayload = {
  pid: string;
};

/**
 * Validates token issued by Idporten. Requires Idporten to be enabled in nais
 * application manifest.
 *
 * @param token Token issued by Idporten.
 */
export const validateIdportenToken = (
  token: string,
): Promise<ValidationResult<Partial<IdportenPayload>>> => {
  return validateJwt(token, "idporten");
};

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
  validateJwt(token, "azuread");

/**
 * Validates token issued by Tokenx. Requires Tokenx to be enabled in nais
 * application manifest.
 *
 * @param token Token issued by Tokenx.
 */
export const validateTokenxToken = (token: string): Promise<ValidationResult> =>
  validateJwt(token, "tokenx");

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
