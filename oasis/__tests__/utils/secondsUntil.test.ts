import { secondsUntil } from "../../src/utils/secondsUntil";

test("calculates seconds until timestamp given microseconds", () => {
  const now = Date.now();
  expect(secondsUntil(0)).toBe(0);
  expect(secondsUntil(now - 20)).toBe(0);
  expect(secondsUntil(now + 20)).toBeGreaterThan(10);
});

test("calculates seconds until timestamp given milliseconds", () => {
  const now = Date.now() / 1000;
  expect(secondsUntil(0)).toBe(0);
  expect(secondsUntil(now - 20)).toBe(0);
  expect(secondsUntil(now + 20)).toBeGreaterThan(10);
});
