import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from "axios";
import { dropEmpty } from "./utils";

const createRequestUUId = (requestConfig: AxiosRequestConfig) =>
  JSON.stringify(dropEmpty([requestConfig.method, requestConfig.url, requestConfig.params]));

export class DuplicateRequestsCanceller {
  private queue: string[] = [];
  private source: CancelTokenSource;

  constructor() {
    const CancelToken = axios.CancelToken;
    this.source = CancelToken.source();
  }

  private removeFromQueue = (requestConfig: AxiosRequestConfig) => {
    const uuid = createRequestUUId(requestConfig);
    this.queue = this.queue.filter((item) => item !== uuid);
  };

  handleDuplicateRequests = (config: AxiosRequestConfig) => {
    const uuid = createRequestUUId(config);

    if (this.queue.includes(uuid)) {
      this.source.cancel();
      return {
        ...config,
        cancelToken: this.source.token,
      };
    }

    this.queue.push(uuid);

    return config;
  };

  handleResponse = (response: AxiosResponse) => {
    this.removeFromQueue(response.config);
    return response;
  };

  handleError = (error: AxiosError) => {
    if (!error.config) {
      return error;
    }

    this.removeFromQueue(error.config);
    return error;
  };
}
