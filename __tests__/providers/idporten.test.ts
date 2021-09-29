import { validerToken } from "../../lib/providers/idporten";
import { server } from "../../__mocks__/server";
import { rest } from "msw";
import { createRemoteJWKSet } from "jose/jwks/remote";
import { SignJWT } from "jose/jwt/sign";
import { generateKeyPair } from "jose/util/generate_key_pair";
import {
  JWSInvalid,
  JWSSignatureVerificationFailed,
  JWTClaimValidationFailed,
  JWTExpired,
} from "jose/util/errors";

const { IDPORTEN_WELL_KNOWN_URL } = process.env;

jest.mock("jose/jwks/remote");

const mockCreateRemoteJWKSet = createRemoteJWKSet as jest.MockedFunction<
  typeof createRemoteJWKSet
>;

describe("provider/idporten/validerToken()", () => {
  const alg = "RS256";
  const pid = "10108012345";

  let privateKey;

  const token = async ({
    expirationTime = "2h",
    issuer = "urn:example:issuer",
  }: {
    expirationTime?: string | number;
    issuer?: string;
  } = {}) =>
    new SignJWT({ pid, acr: "Level4" })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(issuer)
      .setExpirationTime(expirationTime)
      .sign(privateKey);

  beforeAll(async () => {
    privateKey = (await generateKeyPair(alg)).privateKey;

    server.use(
      rest.get(IDPORTEN_WELL_KNOWN_URL, (req, res, ctx) => {
        // Vi skal bare gjøre et oppslag mot IDporten
        return res.once(
          ctx.json({
            issuer: "urn:example:issuer",
            jwks_uri: "http://idporten.test/jwks",
          })
        );
      })
    );
  });
  beforeEach(async () => {
    mockCreateRemoteJWKSet.mockReturnValueOnce(
      () => new Promise((resolve) => resolve(privateKey))
    );
  });
  afterEach(() => mockCreateRemoteJWKSet.mockClear());

  test("returnerer payload og header ", async () => {
    const { payload, protectedHeader } = await validerToken(await token());

    expect(payload).toMatchObject({ pid });
    expect(protectedHeader).toMatchObject({ alg });
  });

  test("kaster JWSInvalid om token er helt ugyldig", async () => {
    await expect(validerToken("fooo")).rejects.toThrow(JWSInvalid);
  });

  test("kaster JWSSignatureVerificationFailed om token har ugyldig signatur", async () => {
    await expect(
      validerToken(
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.NHVaYe26MbtOYhSKkoKYdFVomg4i8ZJd8_-RU8VNbftc4TSMb4bXP3l3YlNWACwyXPGffz5aXHc6lty1Y2t4SWRqGteragsVdZufDn5BlnJl9pdR_kdVFUsra2rWKEofkZeIC4yWytE58sMIihvo9H1ScmmVwBcQP6XETqYd0aSHp1gOa9RdUPDvoXQ5oqygTqVtxaDr6wUFKrKItgBMzWIdNZ6y7O9E0DhEPTbE9rfBo6KTFsHAZnMg4k68CDp2woYIaXbmYTWcvbzIuHO7_37GT79XdIwkm95QJ7hYC9RiwrV7mesbY4PAahERJawntho0my942XheVLmGwLMBkQ"
      )
    ).rejects.toThrow(JWSSignatureVerificationFailed);
  });

  test("kaster JWTExpired om token er utløpt", async () => {
    const expiredToken = await token({ expirationTime: 0 });
    await expect(validerToken(expiredToken)).rejects.toThrow(JWTExpired);
  });

  test("kaster JWTClaimValidationFailed om token har feil issuer", async () => {
    const expiredToken = await token({ issuer: "noen-andre" });
    await expect(validerToken(expiredToken)).rejects.toThrow(
      JWTClaimValidationFailed
    );
  });
});
