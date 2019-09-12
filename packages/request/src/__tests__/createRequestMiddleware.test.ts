import axios, { AxiosRequestConfig } from "axios";
import MockAdapter from "axios-mock-adapter";
import { createRequestActionCreator } from "../requestActionCreators";
import { MiddlewareTestHelper } from "./utils/MiddlewareTestHelper";
import { createRequestMiddleware } from "../createRequestMiddleware";

const mockAxios = axios.create({
  baseURL: "",
  timeout: 0,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

const requestMapper = ({ name, age }: { name: string; age: number }) => {
  return {
    method: "GET",
    url: "/mock-api",
    data: {
      name,
      age,
    },
  } as AxiosRequestConfig;
};
const requestActionCreator = createRequestActionCreator("REQUEST_ACTION", requestMapper);
const requestAction = requestActionCreator({ name: "TW", age: 20 });

describe("#requestMiddleware", () => {
  it("async start action should be called with correct data", () => {
    const mock = new MockAdapter(mockAxios) as any;
    mock
      .onGet("/mock-api")
      .reply(200)
      .onAny()
      .reply(500);

    const mockClient = mock.axiosInstance;
    const { store, invoke$ } = MiddlewareTestHelper.of(createRequestMiddleware(mockClient)).create();
    const expectedResult = {
      type: "REQUEST_ACTION_START",
      meta: {
        prevAction: {
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
        },
      },
    };

    invoke$(requestAction);
    expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
  });

  it("async success action should be called with correct data when fetch succeed", (done) => {
    const mock = new MockAdapter(mockAxios) as any;

    mock
      .onGet("/mock-api")
      .reply(200, {
        email: "test@test.com",
        address: "Chengdu",
      })
      .onAny()
      .reply(500);

    const mockClient = mock.axiosInstance;
    const { store, invoke$ } = MiddlewareTestHelper.of(createRequestMiddleware(mockClient)).create();

    invoke$(requestAction).then(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "REQUEST_ACTION_SUCCESS",
        }),
      );
      expect(store.dispatch).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it("async failed action should be called with correct data when fetch failed", (done) => {
    const mock = new MockAdapter(mockAxios) as any;

    mock
      .onGet("/mock-api")
      .reply(400, {
        errorMessage: "This is an error",
      })
      .onAny()
      .reply(500);

    const mockClient = mock.axiosInstance;
    const { store, invoke$ } = MiddlewareTestHelper.of(createRequestMiddleware(mockClient)).create();

    invoke$(requestAction).then(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "REQUEST_ACTION_FAIL",
        }),
      );
      expect(store.dispatch).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it("should call next(action) when action is not a request action", () => {
    const mockClient = new MockAdapter(mockAxios) as any;
    const { invoke$, next } = MiddlewareTestHelper.of(createRequestMiddleware(mockClient)).create();

    const commonAction = {
      type: "COMMON_ACTION",
      payload: {},
    };
    invoke$(commonAction);
    expect(next).toBeCalled();
  });
});
