import {
  AxiosError,
  AxiosResponse,
} from "axios";
import {
  useEffect,
  useMemo,
} from "react";
import {
  Subject,
  Observable,
} from "rxjs";
import {
  CreateRequestReturn,
} from "./createRequest";
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
  request: (params: TReq) => Observable<AxiosResponse>;
}

export const useRequest = <TReq, TResp>(fn: CreateRequestReturn<TReq, TResp>) => {
  const { request } = useRequestContext();
  const data$ = new Subject();

  const req= useMemo(() => {
    return (params: TReq) => {
      return request(fn(params)).subscribe(data=>{
        data$.next(data);
      });
    };
  }, []);

  return [req, data$]
};
//
// const [request, data$]=useRequest(findId);
// const [request1, data1$]=useRequest(findId);
// request(1);
// request1(1);
