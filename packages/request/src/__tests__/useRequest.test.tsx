import { renderHook } from "@testing-library/react";
import axios, { AxiosError } from "axios";
import nock from "nock";
import type { ReactNode } from "react";
import { firstValueFrom } from "rxjs";
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

  describe("request success", () => {
    let getTestData: any;

    beforeEach(() => {
      nock(basePath).get("/api/tests/001").reply(200, { name: "Tom", age: 6 }, { "Access-Control-Allow-Origin": "*" });
      const { result } = renderHook(() => useRequest(getTestDataUsingGet), { wrapper });
      getTestData = result.current;
      getTestData.request({ id: "001" });
    });

    it("should notify response data and status when request succeed", async () => {
      expect(await firstValueFrom(getTestData.data$)).toEqual({ name: "Tom", age: 6 });
    });

    it("should notify response status when request succeed", async () => {
      await expect(await firstValueFrom(getTestData.status$)).toEqual({
        isLoading: false,
        isError: false,
        isPending: false,
        isSuccess: true,
        isCompleted: true,
      });
    });
  });

  describe("request fail", () => {
    let getTestData: any;

    beforeEach(() => {
      nock(basePath)
        .get("/api/tests/001")
        .reply(500, { message: "Something went wrong" }, { "Access-Control-Allow-Origin": "*" });
      const { result } = renderHook(() => useRequest(getTestDataUsingGet), { wrapper });
      getTestData = result.current;
      getTestData.request({ id: "001" });
    });

    it("should notify error request fail", async () => {
      const error = await firstValueFrom<AxiosError>(getTestData.error$);
      expect(error.response?.data).toEqual({ message: "Something went wrong" });
    });

    it("should notify response status when request succeed", async () => {
      await expect(await firstValueFrom(getTestData.status$)).toEqual({
        isLoading: false,
        isError: true,
        isPending: false,
        isSuccess: false,
        isCompleted: true,
      });
    });
  });
});
