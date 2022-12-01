import { renderHook } from "@testing-library/react";
import axios from "axios";
import nock from "nock";
import type { ReactNode } from "react";
import { createRequest, RequestProvider } from "../";
import { useRequest } from "../useRequest";

describe("useRequest", () => {
  const basePath = "http://localhost:8080";
  const wrapper = ({ children }: { children: ReactNode }) => (
    <RequestProvider value={{ axiosInstance: axios.create({ baseURL: "http://localhost:8080" }) }}>
      {children}
    </RequestProvider>
  );
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

  it("should notify response data and status when request succeed", (done) => {
    nock(basePath).get("/api/tests/001").reply(200, { name: "Tom", age: 6 }, { "Access-Control-Allow-Origin": "*" });

    const { result } = renderHook(() => useRequest(getTestDataUsingGet), { wrapper });
    const [getTestData, request$] = result.current;

    getTestData({ id: "001" });

    request$?.subscribe(({ status, data, error }) => {
      expect(data).toEqual({ name: "Tom", age: 6 });
      expect(status).toEqual("success");
      expect(error?.message).toEqual(undefined);
      done();
    });
  });

  it("should notify error and status when request fail", (done) => {
    nock(basePath)
      .get("/api/tests/001")
      .reply(500, { message: "Something went wrong" }, { "Access-Control-Allow-Origin": "*" });

    const { result } = renderHook(() => useRequest(getTestDataUsingGet), { wrapper });
    const [getTestData, data$] = result.current;

    getTestData({ id: "001" });

    data$?.subscribe(({ status, data, error }) => {
      expect(status).toEqual("failure");
      expect(error?.response?.data).toEqual({ message: "Something went wrong" });
      expect(data).toEqual(undefined);
      done();
    });
  });
});
