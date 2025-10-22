import { errors, jwtVerify } from "jose";

import { failSpan, OtelTaxonomy, spanAsync } from "../lib/otel";
import { stripBearer } from "../lib/utils";

import { getJwkSet } from "./jwks";
import { ValidationResult } from "./types";

export const validateJwt = async ({
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
  return spanAsync("Validate JWT", async (span) => {
    span.setAttributes({
      [OtelTaxonomy.TokenVerifyIssuer]: issuer,
      [OtelTaxonomy.TokenVerifyAudience]: audience,
    });

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
      const errorType =
        e instanceof errors.JWTExpired ? "token expired" : "unknown";
      failSpan(span, `Token validation failed (${errorType})`, e as Error);

      return ValidationResult.Error(e as Error, errorType);
    }
  });
};
