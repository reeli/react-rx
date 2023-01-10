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
  switchMap,
  catchError,
  of,
  tap,
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

  const [req, req$]= useMemo(() => {
    const f= (params: TReq) => {
      // 发送 signal
      req$.next(fn(params))
    };

    const req$ = new Subject();

    f.data$ = new Subject();
    f.error$ = new Subject();

    return f
  }, []);

  useEffect(() => {
    // 处理业务逻辑
     const subscription= req$.pipe(switchMap((input)=> request(fn(input))),
       tap((response)=>{
         req.data$.next(response);
       }),
       catchError((err:AxiosError)=>{
         req.error$.next(err)
       return of(err)
     })).subscribe()

    return ()=>{
      subscription.unsubscribe();
    }
  }, []);


  return req
};
