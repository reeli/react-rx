import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import { createContext, FC, PropsWithChildren } from "react";
import { Subject } from "rxjs";
import { createRequestUUId } from "./utils";

interface RequestContextValue {
  request: (config: AxiosRequestConfig) => Promise<any>;
}

export const RequestContext = createContext<RequestContextValue>({
  request: () => {},
} as unknown as RequestContextValue);

export const RequestProvider: FC<PropsWithChildren> = ({ children }) => {
  const axiosInstance = axios.create();
  const queue: { [key: string]: Subject<AxiosResponse["data"]>[] } = {};

  const request = (requestConfig: AxiosRequestConfig) => {
    const uuid = createRequestUUId(requestConfig);
    const data$ = new Subject();

    if (queue[uuid]) {
      queue[uuid] = [...queue[uuid], data$];
      return new Promise({} as AxiosResponse["data"]);
    }

    queue[uuid] = [data$];

    return axiosInstance
      .request(requestConfig)
      .then((data) => {
        queue[uuid].forEach((data$) => {
          data$.next(data);
        });
        return data;
      })
      .catch((error) => {
        throw new Error(error);
      }) as AxiosPromise;
  };

  return <RequestContext.Provider value={{ request }}>{children}</RequestContext.Provider>;
};
