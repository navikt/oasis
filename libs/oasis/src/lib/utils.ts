export const decodeJwt = (token: string): Record<string, unknown> => {
  try {
    return JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    );
  } catch {
    throw new Error("Invalid JWT");
  }
};

export const stripBearer = (token: string) => token.replace(/^Bearer /, "");
