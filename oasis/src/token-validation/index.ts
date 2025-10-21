import { getAzureEnvs, getIdportenEnvs, getTokenXEnvs } from "./envs";
import { ValidationResult } from "./types";
import { validateJwt } from "./validate";

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
): Promise<ValidationResult<Partial<IdportenPayload>>> =>
  validateJwt({
    token,
    ...getIdportenEnvs(),
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
    ...getAzureEnvs(),
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
    ...getTokenXEnvs(),
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
