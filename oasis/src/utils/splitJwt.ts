export interface SplitJwt {
  protectedHeader: string;
  payload: string;
  signature: string;
}

export function splitJwt(token: string): SplitJwt {
  const {
    0: protectedHeader,
    1: payload,
    2: signature,
    length,
  } = token.split(".");

  if (length !== 3) {
    throw new Error("Invalid JWT");
  }

  return {
    protectedHeader,
    payload,
    signature,
  };
}
