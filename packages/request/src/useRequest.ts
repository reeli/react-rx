import { useContext, useMemo, useRef } from "react";
import { Subject } from "rxjs";
import { CreateRequestReturn } from "./createRequest";
import { RequestContext } from "./RequestContext";

export const useRequest = <TReq, TResp>(fn: CreateRequestReturn<TReq, TResp>) => {
  const dataRef = useRef<Subject<TResp>>();
  const { axiosInstance } = useContext(RequestContext);

  const requestFn = useMemo(() => {
    const requestObserver$ = new Subject<TResp>();
    dataRef.current = requestObserver$;

    return (params: TReq) => {
      return axiosInstance.request(fn(params)).then((resp) => {
        requestObserver$.next(resp.data);
        return resp;
      });
    };
  }, []);

  return [requestFn, dataRef.current] as const;
};
