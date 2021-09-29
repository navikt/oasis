import * as routes from "../api/routes";

export default async function DpAuthHandler(req, res) {
  const { auth } = req.query;
  if (!auth) {
    const error = "Fila må kalles [...auth].js";
    console.error(error);
    return res.status(500).end(`Error: ${error}`);
  }

  const endpoint = auth[0];
  if (req.method === "GET") {
    switch (endpoint) {
      case "signin":
        return routes.signin(req, res);
      case "session":
        return routes.session(req, res);
    }
  }

  return res
    .status(400)
    .end(`Error: HTTP ${req.method} er ikke støttet for ${req.url}`);
}
