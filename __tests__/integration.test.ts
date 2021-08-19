import next from "next";
import { createServer, IncomingMessage } from "http";
import { parse } from "url";

describe("integrasjonstest", () => {
  let server;

  beforeEach(async () => {
    const app = next({ dev: true });
    const handle = app.getRequestHandler();

    await app.prepare();

    // @ts-ignore
    server = createServer((req: IncomingMessage, res: Response) => {
      const parsedUrl = parse(req.url, true);
      // @ts-ignore
      handle(req, res, parsedUrl);
    });

    server.listen(3000, console.error);
  });

  afterEach(() => {
    server.close();
  });

  it("skal logge inn", async () => {
    const res = await fetch("http://localhost:3000/api/auth/signin");
    const html = await res.text();
    console.log(html);
    expect(html).toContain("Tada");
  });
});
