import { NextApiHandler, NextApiRequest } from "next";
import { CookieSerializeOptions, serialize } from "cookie";
import { getSession } from "../../server";
import { validerToken } from "../../providers/loginservice";

const { NEXT_PUBLIC_BASE_PATH, LOGINSERVICE_URL, SELF_URL } = process.env;
const MY_URL = `${SELF_URL}/api/auth/signin`;

export const IDPORTEN_LOGIN = `${NEXT_PUBLIC_BASE_PATH}/oauth2/login?redirect=${MY_URL}`;
export const LOGINSERVICE_LOGIN = `${LOGINSERVICE_URL}?redirect=${MY_URL}`;

const cookieOptions: CookieSerializeOptions = {
  domain: "nav.no",
  path: NEXT_PUBLIC_BASE_PATH,
  httpOnly: true,
};

const setCookie = (res, name, payload, options: CookieSerializeOptions = {}) =>
  res.setHeader(
    "Set-Cookie",
    serialize(name, payload, { ...cookieOptions, ...options })
  );

const allowedDestinations = ["/", "/routing"];

/**
 * Logger inn bruker
 *
 * 1. Først tar den vare på eventuell destination for deep-linking
 * 2. Lager den vår sesjon med IDporten
 * 3. Sørger for at vi logger inn i dekoratøren om det mangler
 * 4. Sender bruker til enten start eller til destinasjonen satt i cookie (om tillatt
 */
const signinHandler: NextApiHandler = async (req: NextApiRequest, res) => {
  const { token } = await getSession({ req });
  const { destination } = req.query;

  if (typeof destination === "string") {
    // Ta vare på destination til vi er ferdige å logge inn
    setCookie(res, "destination", destination);
  }

  if (!token) {
    res.redirect(IDPORTEN_LOGIN);
    return;
  }

  const selvbetjeningIdtoken = req.cookies["selvbetjening-idtoken"];
  if (token) {
    try {
      await validerToken(selvbetjeningIdtoken);
    } catch {
      res.redirect(LOGINSERVICE_LOGIN);
      return;
    }
  }

  const destinationFromCookie =
    req.cookies["destination"] &&
    decodeURIComponent(req.cookies["destination"]);

  // Slett cookien så den ikke brukes på nytt
  setCookie(res, "destination", "", {
    expires: new Date(0),
  });

  res.redirect(SELF_URL + whitelistDestination(destinationFromCookie));
};

function whitelistDestination(destination: string): string {
  if (!destination) return "";
  if (!destination.startsWith("/")) return "";
  const url = new URL("http://not.valid" + destination);

  if (allowedDestinations.includes(url.pathname))
    return url.pathname + url.search;

  return "";
}

export default signinHandler;
