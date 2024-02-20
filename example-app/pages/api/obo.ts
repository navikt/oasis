import type { NextApiRequest, NextApiResponse } from "next";
import { requestOboToken, validateToken } from "@navikt/oasis";

export default async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const token = req.headers.authorization!.replace("Bearer ", "");

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
      res.status(401);
    }
  } else {
    return res.status(401);
  }
}
