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
    [key: string]: {
      config: AxiosRequestConfig,
      sources: Observable<AxiosResponse>[]
    }
  } = {};

  return (axiosRequestConfig: AxiosRequestConfig) => {
    const uuid = createRequestUUId(axiosRequestConfig);

    if (requestsCache[uuid]) {
      const source$ = new Subject();

      requestsCache[uuid] = {
        ...requestsCache[uuid],
        sources: [...requestsCache[uuid].sources, source$]
      }

      return source$;
    }

    const source$ = observableFrom(client.request(axiosRequestConfig)).pipe(
      tap((axiosResponse) => {
        requestsCache[uuid].sources.forEach((resp$) => {
          resp$.next(axiosResponse)
        })

        requestsCache[uuid] = {}
        return axiosResponse;
      }),
    );

    requestsCache[uuid] = {
      config: axiosRequestConfig,
      sources: [source$],
    }

    return source$;
  };
}

const createAxiosInstance = ()=>{
  return axios.create();
}

export const RequestContext = createContext<RequestContextValue>({
  request: () => {},
} as unknown as RequestContextValue);

export const RequestProvider: FC<PropsWithChildren> = ({ children }) => {
  const axiosInstance = createAxiosInstance();
  const {request} = createRequestFactory(axiosInstance);

  return <RequestContext.Provider value={{ request }}>{children}</RequestContext.Provider>;
};
