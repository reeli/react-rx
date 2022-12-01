import { renderHook } from "@testing-library/react-hooks";
import axios from "axios";
import type { ComponentType } from "react";
import { createRequest, RequestProvider } from "../";
import { useRequest } from "../useRequest";

const wrapper = ({ children }: { children: ComponentType }) => (
  <RequestProvider value={{ axiosInstance: axios.create() }}>{children}</RequestProvider>
);

describe("useRequest", () => {
  it("should return request function and requestStage$", () => {
    const getTestDataUsingGet = createRequest<
      { id?: string },
      {
        name: string;
        age: number;
      }
    >("getTestDataUsingGet", ({ id }) => ({
      url: `/api/tests/${id}`,
      method: "get",
    }));
    const { result } = renderHook(() => useRequest(getTestDataUsingGet), { wrapper });
    const [getTestData] = result.current;

    getTestData({ id: "001" });

    expect(getTestData).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "getTestDataUsingGet",
        payload: {
          method: "get",
          url: "/api/tests/001",
        },
      }),
    );
  });
});
