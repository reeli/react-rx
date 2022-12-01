import { AxiosRequestConfig } from "axios";

export interface CreateRequestReturn<TReq extends any, TResp extends any> {
  <TReq>(params: TReq): AxiosRequestConfig;
  TReq: TReq;
  TResp: TResp;
  requestId: string;
}

export const createRequest = <TReq = unknown, TResp = unknown>(
  operationId: string,
  requestFn: (param: TReq) => AxiosRequestConfig,
) => {
  const fn = (params: TReq) => requestFn(params);

  fn.TReq = {} as TReq;
  fn.TResp = {} as TResp;
  fn.requestId = operationId;

  return fn as CreateRequestReturn<TReq, TResp>;
};
