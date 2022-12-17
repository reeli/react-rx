import { isEmpty, isNumber } from "lodash";

export const dropEmpty = (list: any[]) => {
  if (!list) {
    return [];
  }
  return list.filter((v) => !isEmpty(v) || isNumber(v));
};
