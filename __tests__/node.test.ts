/**
 * @jest-environment node
 */

import { getSession } from "../lib/server";
import DpAuthHandler from "../lib/api";

test("Test serverside API", () => {
  expect(getSession).toBeTruthy();
  expect(DpAuthHandler).toBeTruthy();
});
