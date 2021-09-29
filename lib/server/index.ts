import { JWTPayload } from "jose/types";

export type Session = {
  token?: string;
  payload?: JWTPayload;
  apiToken?: (audience: string) => Promise<string>;
};
export { getSession } from "./get-session";
