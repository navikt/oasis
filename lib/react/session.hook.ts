import useSWR from "swr";
import { useEffect } from "react";
import Router from "next/router";

export interface Session extends Record<string, unknown> {
  user?: {
    fnr: string;
    locale: string;
  };
  expires_in?: number;
}

const fetcher = (url, options = {}) =>
  fetch(url, options).then((r) => r.json());

interface SessionHookOpts {
  enforceLogin?: boolean;
  redirectTo?: string;
  nextPublicBasePath?: string;
}

export const useSession = ({
  enforceLogin = true,
  redirectTo = "/api/auth/signin",
  nextPublicBasePath = "",
}: SessionHookOpts = {}): { session: Session } => {
  const { data: session } = useSWR(
    `${nextPublicBasePath}/api/auth/session`,
    fetcher
  );
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
