import { createCookieSessionStorage } from "@remix-run/node";
import { KindeStrategy } from "../src";

describe(KindeStrategy, () => {
  let verify = jest.fn();
  // You will probably need a sessionStorage to test the strategy.
  let sessionStorage = createCookieSessionStorage({
    cookie: { secrets: ["s3cr3t"] },
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should have the name of the strategy", () => {
    let strategy = new KindeStrategy(
      { domain: "", callbackURL: "", clientID: "", clientSecret: "" },
      verify
    );
    expect(strategy.name).toBe("kinde");
  });

  test.todo("Write more tests to check everything works as expected");
});
