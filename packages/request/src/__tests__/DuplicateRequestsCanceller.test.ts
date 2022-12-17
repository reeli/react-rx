import axios from "axios";
import nock from "nock";
import { DuplicateRequestsCanceller } from "../DuplicateRequestsCanceller";

describe("DuplicateRequestsCanceller", () => {
  const basePath = "http://localhost:8080";
  const canceller = new DuplicateRequestsCanceller();
  axios.interceptors.request.use(canceller.handleDuplicateRequests);
  axios.interceptors.response.use(canceller.handleResponse, canceller.handleError);

  it("should cancel duplicate request", async () => {
    const url = "/api/tests/001";
    const headers = { "Access-Control-Allow-Origin": "*" };
    const response1 = { name: "Tom", age: 10 };
    const response2 = { name: "Jake", age: 20 };

    nock(basePath).get(url).reply(200, response1, headers);
    nock(basePath).get(url).reply(200, response2, headers);

    const finalUrl = basePath + url;

    const request1 = axios.get(finalUrl).then((resp) => resp.data);
    const request2 = axios.get(finalUrl);

    expect(await request1).toEqual(response1);
    expect(await request2).toEqual({
      message: "canceled",
      name: "CanceledError",
      code: "ERR_CANCELED",
    });
  });
});
