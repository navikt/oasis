import { splitJwt } from "../../lib/utils/splitJwt";

it("splits a token into its components", () => {
  expect(splitJwt("a.b.c")).toMatchObject({
    protectedHeader: "a",
    payload: "b",
    signature: "c",
  });
});
it("throws error if a token is not correctly formatted", () => {
  expect(() => splitJwt("a.b")).toThrowError("Invalid JWT");
});
