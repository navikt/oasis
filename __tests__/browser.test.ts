/**
 * @jest-environment jsdom
 */
import { useSession } from "../lib/client";

test("Test client-side API", () => {
  expect(useSession).toBeTruthy();
});
