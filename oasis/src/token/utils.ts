export const decodeJwt = (token: string): Record<string, unknown> => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    throw new Error("Invalid JWT");
  }
};

export const stripBearer = (token: string) => token.replace(/^Bearer /, "");
