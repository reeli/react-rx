import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { Subject } from "rxjs/internal/Subject";
import { useRequest } from "../useRequest";
import { createRequestActionCreator } from "../requestActionCreators";
import { StoreContext } from "packages/hooks/src";

const getWrapper = (store: any) => ({ children }: any) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

const testActionCreator = createRequestActionCreator<{ id?: string; }, ITestVo>("getTestDataUsingGet", ({ id }) => ({
  url: `/api/tests/${id}`,
  method: "get",
}));

describe("useRequest", () => {
  it("should return request function and requestStage$", () => {
    const mockDispatch = jest.fn();
    const store = {
      dispatch: mockDispatch,
      getState: jest.fn(),
      subscribe: jest.fn(),
      replaceReducer: jest.fn(),
    };
    const wrapper = getWrapper(store);
    const { result } = renderHook(() => useRequest(testActionCreator), { wrapper });
    const [getTestData] = result.current;

    getTestData({ id: "test" });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "getTestDataUsingGet",
        payload: {
          method: "get",
          url: "/api/tests/test",
        },
      }),
    );
  });

  it("should provide correct requestStage", () => {
    const mockDispatch = jest.fn().mockImplementation((action: any) => {
      if (!(action instanceof Subject)) {
        action.meta.success && action.meta.success();
        action.meta.failed && action.meta.failed();
      }
    });
    const store = {
      dispatch: mockDispatch,
      getState: jest.fn(),
      subscribe: jest.fn(),
      replaceReducer: jest.fn(),
    };
    const wrapper = getWrapper(store);
    const { result } = renderHook(
      () =>
        useRequest(testActionCreator, {
          onSuccess: () => {
            const [, requestStage$] = result.current;
            expect(requestStage$.getValue()).toEqual("SUCCESS");
          },
          onFail: () => {
            const [, requestStage$] = result.current;
            expect(requestStage$.getValue()).toEqual("FAIL");
          },
        }),
      { wrapper },
    );
    const [getTestData] = result.current;

    getTestData({ id: "test" });
  });
});

interface ITestVo {
  name: string;
  age: number;
}
