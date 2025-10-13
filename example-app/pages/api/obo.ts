import { requestOboToken, validateToken } from "@navikt/oasis";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).send("No token");

  const validationResult = await validateToken(token);

  if (validationResult.ok) {
    const oboRes = process.env.IDPORTEN_ISSUER
      ? await requestOboToken(token, "dev-gcp:oasis-maintainers:oasis-idporten")
      : await requestOboToken(
          token,
          "api://dev-gcp.oasis-maintainers.oasis-azure/.default",
        );

    if (oboRes.ok) {
      res
        .status(200)
        .send(`Made obo-token request: got ${oboRes.token.length}`);
    } else {
      res.status(401).send("Failed to get obo-token");
    }
  } else {
    return res.status(401).send("Invalid token");
  }
}
