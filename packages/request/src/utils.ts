import { AxiosRequestConfig } from "axios";
import { isEmpty, isNumber } from "lodash";

export const dropEmpty = (list: any[]) => {
  if (!list) {
    return [];
  }
  return list.filter((v) => !isEmpty(v) || isNumber(v));
};

export const createRequestUUId = (requestConfig: AxiosRequestConfig) =>
  JSON.stringify(dropEmpty([requestConfig.method, requestConfig.url, requestConfig.params]));
