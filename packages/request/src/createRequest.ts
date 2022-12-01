import { AxiosRequestConfig } from "axios";

export const createRequest = <TReq = unknown, TResp = unknown>(
  operationId: string,
  requestFn: (param: TReq) => AxiosRequestConfig,
) => {
  const fn = (params: TReq) => requestFn(params);

  fn.TReq = {} as TReq;
  fn.TResp = {} as TResp;
  fn.requestId = operationId;

  return fn;
};
