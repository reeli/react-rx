import { Action } from "redux";
import { assign } from "lodash";

export interface IUpdateTempDataAction<TData> extends Action {
  payload?: {
    data: TData;
  };
  meta?: {
    groupKey: string;
  };
}

export function updateTempDataActionCreator<TData>(groupKey: string, data: TData): IUpdateTempDataAction<TData> {
  const type = "@@tempData/updateTempData";
  assign(updateTempDataActionCreator, { toString: () => type });
  return {
    type,
    payload: {
      data,
    },
    meta: {
      groupKey,
    },
  };
}
