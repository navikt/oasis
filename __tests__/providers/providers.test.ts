import { errors } from "jose";
import { azureAd, idporten } from "../../lib/providers";
import { token } from "../__utils__/test-provider";

const {
  JWSInvalid,
  JWSSignatureVerificationFailed,
  JWTClaimValidationFailed,
  JWTExpired
} = errors;

const pid = "10108012345";

describe.each([
  ["Azure AD", azureAd],
  ["ID-porten", idporten]
  // ["Loginservice", loginservice]
])("verifyToken() for %s", (_, { verifyToken }) => {
  test("returns payload", async () => {
    const { payload } = await verifyToken(await token(pid));

    expect(payload).toMatchObject({ pid });
  });

  test("throws JWSInvalid if token is invalid", async () => {
    await expect(verifyToken("fooo")).rejects.toThrow(JWSInvalid);
  });

  test("throws JWSSignatureVerificationFailed if token is signed by invalid key", async () => {
    await expect(
      verifyToken(
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.NHVaYe26MbtOYhSKkoKYdFVomg4i8ZJd8_-RU8VNbftc4TSMb4bXP3l3YlNWACwyXPGffz5aXHc6lty1Y2t4SWRqGteragsVdZufDn5BlnJl9pdR_kdVFUsra2rWKEofkZeIC4yWytE58sMIihvo9H1ScmmVwBcQP6XETqYd0aSHp1gOa9RdUPDvoXQ5oqygTqVtxaDr6wUFKrKItgBMzWIdNZ6y7O9E0DhEPTbE9rfBo6KTFsHAZnMg4k68CDp2woYIaXbmYTWcvbzIuHO7_37GT79XdIwkm95QJ7hYC9RiwrV7mesbY4PAahERJawntho0my942XheVLmGwLMBkQ"
      )
    ).rejects.toThrow(JWSSignatureVerificationFailed);
  });

  test("throws JWTExpired if token has expired", async () => {
    const expiredToken = await token(pid, { expirationTime: 0 });
    await expect(verifyToken(expiredToken)).rejects.toThrow(JWTExpired);
  });

  test("throws JWTClaimValidationFailed if token has wrong issuer claim", async () => {
    const expiredToken = await token(pid, { issuer: "noen-andre" });
    await expect(verifyToken(expiredToken)).rejects.toThrow(
      JWTClaimValidationFailed
    );
  });
});
