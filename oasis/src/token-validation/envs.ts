type RequiredEnvs = {
  jwksUri: string;
  issuer: string;
  audience: string;
};

export function getIdportenEnvs(): RequiredEnvs {
  if (
    !process.env.IDPORTEN_JWKS_URI ||
    !process.env.IDPORTEN_ISSUER ||
    !process.env.IDPORTEN_AUDIENCE
  ) {
    throw Error(
      "Trying to validate Idporten but no IDPORTEN_* envs! Are you in nais?",
    );
  }

  return {
    jwksUri: process.env.IDPORTEN_JWKS_URI,
    issuer: process.env.IDPORTEN_ISSUER,
    audience: process.env.IDPORTEN_AUDIENCE,
  };
}

export function getAzureEnvs(): RequiredEnvs {
  if (
    !process.env.AZURE_OPENID_CONFIG_JWKS_URI ||
    !process.env.AZURE_OPENID_CONFIG_ISSUER ||
    !process.env.AZURE_APP_CLIENT_ID
  ) {
    throw Error(
      "Trying to validate Azure but no AZURE_* envs! Are you in nais?",
    );
  }

  return {
    jwksUri: process.env.AZURE_OPENID_CONFIG_JWKS_URI,
    issuer: process.env.AZURE_OPENID_CONFIG_ISSUER,
    audience: process.env.AZURE_APP_CLIENT_ID,
  };
}

export function getTokenXEnvs(): RequiredEnvs {
  if (
    !process.env.TOKEN_X_JWKS_URI ||
    !process.env.TOKEN_X_ISSUER ||
    !process.env.TOKEN_X_CLIENT_ID
  ) {
    throw Error(
      "Trying to validate TokenX but no TOKEN_X_* envs! Are you in nais?",
    );
  }

  return {
    jwksUri: process.env.TOKEN_X_JWKS_URI,
    issuer: process.env.TOKEN_X_ISSUER,
    audience: process.env.TOKEN_X_CLIENT_ID,
  };
}
