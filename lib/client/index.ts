export interface Session extends Record<string, unknown> {
  expires_in?: number;
}

export { useSession } from "./use-session";
