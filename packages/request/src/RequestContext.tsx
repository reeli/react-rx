import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {
  createContext,
  FC,
  PropsWithChildren,
} from "react";
import {
  from as observableFrom,
  Observable,
  Subject,
  tap,
} from "rxjs";
import { createRequestUUId } from "./utils";

interface RequestContextValue {
  request: (config: AxiosRequestConfig) => Observable<AxiosResponse>;
}

const createRequestFactory = (client: AxiosInstance) => {
  const requestsCache: {
    [key: string]: Observable<AxiosResponse>
  } = {};

  return (axiosRequestConfig: AxiosRequestConfig) => {
    const uuid = createRequestUUId(axiosRequestConfig);

    let request$ = requestsCache[uuid]

    if (!request$) {
      requestsCache[uuid] = observableFrom(client.request(axiosRequestConfig))
      request$ = requestsCache[uuid]

      const sub = request$.subscribe(() => {
        delete requestsCache[uuid]
        sub.unsubscribe()
      })
    }

    const source$ = new Subject();

    request$.subscribe(source$)

    return source$;
  };
}

const createAxiosInstance = () => {
  return axios.create();
}

export const RequestContext = createContext<RequestContextValue>({
  request: () => {
  },
} as unknown as RequestContextValue);

export const RequestProvider: FC<PropsWithChildren> = ({ children }) => {
  const axiosInstance = createAxiosInstance();
  const { request } = createRequestFactory(axiosInstance);

  return <RequestContext.Provider value={{ request }}>{children}</RequestContext.Provider>;
};
