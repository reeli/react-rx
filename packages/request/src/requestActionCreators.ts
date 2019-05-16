import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { assign } from "lodash";
import { createRequestFailActionType, createRequestStartActionType, createRequestSuccessActionType } from "./utils";

interface Action<T = any> {
  type: T;
}

export interface IRequestAction extends Action {
  meta: {
    request: true;
  };
  payload: AxiosRequestConfig;
}

export interface IRequestActionCreator<TReq, TResp, TMeta> {
  (args: TReq, moreMeta?: TMeta): IRequestAction;

  TReq: TReq;
  TResp: TResp;
  name: string;
  toString: () => string;
  start: {
    toString: () => string;
  };
  success: {
    toString: () => string;
  };
  fail: {
    toString: () => string;
  };
}

export const createRequestActionCreator = <TReq = undefined, TResp = any, TMeta = any>(
  type: string,
  reqConfigCreator: (args: TReq) => AxiosRequestConfig,
  extraMeta: TMeta = {} as TMeta,
): IRequestActionCreator<TReq, TResp, TMeta> => {
  const actionCreator = (args: TReq, moreMeta: TMeta = {} as TMeta): IRequestAction => ({
    type,
    meta: {
      request: true,
      ...extraMeta,
      ...moreMeta,
    },
    payload: reqConfigCreator(args),
  });

  return assign(actionCreator, {
    toString: () => type,
    start: {
      toString: () => createRequestStartActionType(type),
    },
    success: {
      toString: () => createRequestSuccessActionType(type),
    },
    fail: {
      toString: () => createRequestFailActionType(type),
    },
    name: type,
    TReq: {} as TReq,
    TResp: {} as TResp,
  });
};

interface IRequestStartAction extends Action {
  meta: {
    prevAction: IRequestAction;
  };
}

export const createRequestStartAction = (action: IRequestAction): IRequestStartAction => {
  const type = createRequestStartActionType(action.type);
  return {
    type,
    meta: {
      prevAction: action,
    },
  };
};

export interface IRequestSuccessAction<TResp> extends Action {
  meta: {
    prevAction: IRequestAction;
  };
  payload: AxiosResponse<TResp>;
}

export const createRequestSuccessAction = <TResp>(
  action: IRequestAction,
  res: AxiosResponse<TResp>,
): IRequestSuccessAction<TResp> => {
  const type = createRequestSuccessActionType(action.type);

  return {
    type,
    meta: {
      prevAction: action,
    },
    payload: res,
  };
};

export interface IRequestFailAction extends Action {
  meta: {
    prevAction: IRequestAction;
  };
  payload: AxiosError;
  error: true;
}

export const createRequestFailAction = (action: IRequestAction, error: AxiosError): IRequestFailAction => {
  const type = createRequestFailActionType(action.type);

  return {
    type,
    meta: {
      prevAction: action,
    },
    payload: error,
    error: true,
  };
};
