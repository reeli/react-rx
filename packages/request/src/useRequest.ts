import { AxiosError } from "axios";
import { useContext, useMemo, useRef } from "react";
import { Subject } from "rxjs";
import { CreateRequestReturn } from "./createRequest";
import { RequestContext } from "./RequestContext";

enum RequestStatus {
  pending = "pending",
  success = "success",
  failure = "failure",
}

interface RequestResult<TResp> {
  status: RequestStatus;
  data?: TResp;
  error?: AxiosError;
}

export const useRequest = <TReq, TResp>(fn: CreateRequestReturn<TReq, TResp>) => {
  const dataRef = useRef<Subject<RequestResult<TResp>>>();
  const { axiosInstance } = useContext(RequestContext);

  const requestFn = useMemo(() => {
    const request$ = new Subject<RequestResult<TResp>>();
    dataRef.current = request$;

    return (params: TReq) => {
      request$.next({ status: RequestStatus.pending });

      return axiosInstance
        .request(fn(params))

        .then((resp) => {
          request$.next({
            status: RequestStatus.success,
            data: resp.data,
          });
          return resp;
        })
        .catch((error) => {
          request$.next({
            status: RequestStatus.failure,
            error,
          });
        });
    };
  }, []);

  return [requestFn, dataRef.current] as const;
};
