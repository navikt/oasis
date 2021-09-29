import useSWR from "swr";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Session } from "./index";

export const useSession = ({
  enforceLogin = true,
  redirectTo = "/api/auth/signin",
  initialSession = undefined,
} = {}): { session: Session; isLoading: boolean; isError: boolean } => {
  const router = useRouter();
  const { data: session, error } = useSWR<Session>(`/api/auth/session`, {
    fallbackData: initialSession,
  });

  const isLoading = !session && !error;
  const shouldEnforceLogin = enforceLogin && redirectTo;
  const hasSession = session?.expires_in > 0;

  useEffect(() => {
    // Venter på data, eller skal uansett ikke redirecte
    if (isLoading || !shouldEnforceLogin) return;

    // Har ingen sesjon, og skal redirectes til signin
    if (!hasSession) {
      router.push(redirectTo);
    }
  }, [shouldEnforceLogin, hasSession, isLoading, redirectTo, router]);

  // Fram til vi har lastet data, eller en feil så har vi ingen sesjon
  if (isLoading) return { session: undefined, isLoading, isError: error };

  if (!hasSession && shouldEnforceLogin) {
    // Har ingen sesjon, og skal redirectes til signin
    return { session: undefined, isLoading: true, isError: error };
  }

  if (!hasSession) {
    // Har ingen sesjon, men skal heller ikke redirecte
    return {
      session: undefined,
      isLoading,
      isError: error,
    };
  }

  // Har gyldig sesjon, eller en feil
  return {
    session,
    isLoading,
    isError: error,
  };
};
