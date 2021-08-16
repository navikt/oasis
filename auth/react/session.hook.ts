import useSWR from "swr";
import { IncomingMessage } from "http";
import { useEffect } from "react";
import Router from "next/router";

export interface Session extends Record<string, unknown> {
  user?: {
    fnr: string;
    locale: string;
  };
  expires_in?: number;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const fetcher = (url, options = {}) =>
  fetch(url, options).then((r) => r.json());

export const useSession = ({
  basePath: string= "",
  enforceLogin = true,
  redirectTo = "/api/auth/signin",
} = {}): { session: Session } => {
  const { data: session } = useSWR(`${basePath}/api/auth/session`, fetcher);
  useEffect(() => {
    // Waiting for data
    if (!enforceLogin || !session) return;

    // Got idata and should redirect if no session
    if (enforceLogin && redirectTo && !session?.expires_in) {
      Router.push(redirectTo);
    }
  }, [session, enforceLogin, redirectTo]);

  if (
    // No active session, and should redirect
    (enforceLogin && redirectTo && !session?.expires_in) ||
    // No active session, and should not redirect
    (!enforceLogin && !session?.expires_in)
  )
    return { session: undefined };
  return { session };
};

// Server side method (APIs and getServerSideProps)
export interface CtxOrReq {
  req?: IncomingMessage;
  ctx?: { req: IncomingMessage };
}

export type GetSessionOptions = CtxOrReq & {
  event?: "storage" | "timer" | "hidden" | string;
  triggerEvent?: boolean;
};

export async function getSession({
  ctx,
  req = ctx?.req,
}: GetSessionOptions): Promise<Session> {
  const baseUrl = _apiBaseUrl();
  const fetchOptions = req ? { headers: { cookie: req.headers.cookie } } : {};
  const session = await fetcher(
    `${baseUrl}/session`,
    fetchOptions
  ).then((data) => (Object.keys(data).length > 0 ? data : null));
  return session;
}

const _apiBaseUrl = () => `http://localhost:3000/api/auth`;
