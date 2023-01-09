import { AxiosError, AxiosResponse } from "axios";
import { useEffect, useMemo, useRef } from "react";
import { Subject } from "rxjs";
import { CreateRequestReturn } from "./createRequest";
import { useRequestContext } from "./useRequestContext";

interface RequestStatus {
  isLoading: boolean;
  isError: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isCompleted: boolean;
}

export interface UseRequestReturn<TReq, TResp> {
  data$: Subject<TResp>;
  error$: Subject<AxiosError>;
  status$: Subject<RequestStatus>;
  request: (params: TReq) => Promise<void | AxiosResponse<TResp>>;
}

export const useRequest = <TReq, TResp>(fn: CreateRequestReturn<TReq, TResp>) => {
  const dataRef = useRef<UseRequestReturn<TReq, TResp>>({} as UseRequestReturn<TReq, TResp>);
  const { request } = useRequestContext();

  const requestFn = useMemo(() => (params: TReq) => request(fn(params)), []);

  useEffect(() => {
    dataRef.current.request = requestFn;
  }, []);

  return dataRef.current;
};
