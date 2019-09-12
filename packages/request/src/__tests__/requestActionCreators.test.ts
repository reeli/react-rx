import { createRequestActionCreator } from "../requestActionCreators";

const requestActionCreator = createRequestActionCreator<{ name: string, age: number }>(
  "REQUEST_ACTION",
  ({ name, age }) => ({
    method: "GET",
    url: "/mock-api",
    data: {
      name,
      age,
    },
  }),
);

const requestAction = requestActionCreator({ name: "TW", age: 20 });

describe("requestActionCreators", () => {
  it("#createRequestActionCreator", () => {
    const expectedResult = {
      type: "REQUEST_ACTION",
      payload: {
        method: "GET",
        url: "/mock-api",
        data: {
          name: "TW",
          age: 20,
        },
      },
      meta: {
        request: true,
      },
    };

    expect(requestAction).toEqual(expectedResult);
    expect(requestActionCreator.toString()).toEqual("REQUEST_ACTION");
    expect(requestActionCreator.start.toString()).toEqual("REQUEST_ACTION_START");
    expect(requestActionCreator.success.toString()).toEqual("REQUEST_ACTION_SUCCESS");
    expect(requestActionCreator.fail.toString()).toEqual("REQUEST_ACTION_FAIL");
  });
});
