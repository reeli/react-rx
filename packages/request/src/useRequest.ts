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
  const { axiosInstance } = useRequestContext();

  const requestFn = useMemo(() => {
    const data$ = new Subject<TResp>();
    const error$ = new Subject<AxiosError>();
    const status$ = new Subject<RequestStatus>();

    dataRef.current.data$ = data$;
    dataRef.current.error$ = error$;
    dataRef.current.status$ = status$;

    const defaultStatus = {
      isLoading: false,
      isError: false,
      isPending: false,
      isSuccess: false,
      isCompleted: false,
    };

    return (params: TReq) => {
      status$.next({ ...defaultStatus, isLoading: true, isPending: true });

      return axiosInstance
        .request(fn(params))
        .then((resp) => {
          data$.next(resp.data);
          status$.next({ ...defaultStatus, isSuccess: true, isCompleted: true });
          return resp;
        })
        .catch((error) => {
          error$.next(error);
          status$.next({ ...defaultStatus, isError: true, isCompleted: true });
        });
    };
  }, []);

  useEffect(() => {
    dataRef.current.request = requestFn;
  }, []);

  return dataRef.current;
};
