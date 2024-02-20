import { Result } from "./result";

describe("Result", () => {
  test("is{Ok|Error}", () => {
    expect(Result.Ok(1).isOk()).toBeTruthy();
    expect(Result.Ok(1).isError()).toBeFalsy();

    expect(Result.Error(1).isOk()).toBeFalsy();
    expect(Result.Error(1).isError()).toBeTruthy();
  });

  test("get", () => {
    const result = Result.Ok(1);
    expect(result.isOk() && result.get()).toEqual(1);
  });

  test("getError", () => {
    const result = Result.Error(1);
    expect(result.isError() && result.getError()).toEqual(1);
  });

  test("match", () => {
    Result.Error(1).match({
      Error: (value) => expect(value).toBe(1),
      Ok: () => expect(true).toBe(false),
    });
    Result.Ok(1).match({
      Error: () => expect(true).toBe(false),
      Ok: (value) => expect(value).toBe(1),
    });
  });
});
