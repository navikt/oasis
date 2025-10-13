import { expect } from "vitest";

type AnyOkUnion = {
  ok: boolean;
  [key: string]: unknown;
};

export function expectOK<T extends AnyOkUnion>(
  result: T,
): asserts result is Extract<T, { ok: true }> {
  expect(
    result.ok,
    `Result was not OK, instead: ${JSON.stringify(result)}`,
  ).toBe(true);
}

export function expectNotOK<T extends AnyOkUnion>(
  result: T,
): asserts result is Extract<T, { ok: false }> {
  expect(result.ok, "Expected error, but was OK").toBe(false);
}
