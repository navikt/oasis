import next from "next";
import { createServer, IncomingMessage } from "http";
import fetchCookie from "fetch-cookie/node-fetch";
import { parse } from "url";

const fetchWithCookies = fetchCookie(fetch);

describe.skip("integrasjonstest", () => {
  let server;
  const app = next({ dev: true, quiet: true });
  const handle = app.getRequestHandler();

  beforeEach(async () => {
    await app.prepare();

    // @ts-ignore
    server = createServer((req: IncomingMessage, res) => {
      const parsedUrl = parse(req.url, true);

      // TODO: Finn ut hvorfor next finner api-routes, men ikke vanlige pages
      if (parsedUrl.pathname == "/api/fake-loginservice") {
        const { redirect } = parsedUrl.query;
        res.statusCode = 302;
        res.setHeader("Location", redirect);
        res.setHeader("Content-Length", "0");
        res.end();
        return;
      }
      if (parsedUrl.pathname == "/") {
        res.write("Tada");
        res.end();
        return;
      }
      // @ts-ignore
      handle(req, res, parsedUrl);
    });

    server.listen(3000, console.error);
  }, 20000);

  afterEach(async () => {
    await app.close();
    await server.close();
  });

  it("skal logge inn", async () => {
    const res = await fetchWithCookies(
      "http://localhost:3000/api/auth/signin",
      {
        credentials: "same-origin",
      }
    );
    const html = await res.text();
    expect(html).toContain("Tada");
  }, 20000);
});
