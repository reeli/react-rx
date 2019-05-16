import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { assign } from "lodash";

interface Action<T = any> {
  type: T;
}

interface AnyAction extends Action {
  [extraProps: string]: any;
}

export interface IRequestAction extends Action {
  meta: {
    request: true;
  };
  payload: AxiosRequestConfig;
}

interface IRequestActionCreator<TReq, TResp> {
  (args?: TReq): IRequestAction;

  TReq: TReq;
  TResp: TResp;
  name: string;
  toString: () => string;
  success: {
    toString: () => string;
  };
  failed: {
    toString: () => string;
  };
}

export const createRequestActionCreator = <TReq, TResp>(
  type: string,
  reqConfigCreator: (args?: TReq) => AxiosRequestConfig,
): IRequestActionCreator<TReq, TResp> => {
  const actionCreator = (args?: TReq): IRequestAction => ({
    type,
    meta: {
      request: true,
    },
    payload: reqConfigCreator(args),
  });

  return assign(actionCreator, {
    toString: () => type,
    success: {
      toString: () => createRequestSuccessActionType(type),
    },
    failed: {
      toString: () => createRequestFailedActionType(type),
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

interface IRequestSuccessAction<TResp> extends Action {
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

interface IRequestFailedAction extends Action {
  meta: {
    prevAction: IRequestAction;
  };
  payload: AxiosError;
  error: true;
}

export const createRequestFailedAction = (action: IRequestAction, error: AxiosError): IRequestFailedAction => {
  const type = createRequestFailedActionType(action.type);

  return {
    type,
    meta: {
      prevAction: action,
    },
    payload: error,
    error: true,
  };
};

const createRequestStartActionType = (type: string) => `${type}_START`;
const createRequestSuccessActionType = (type: string) => `${type}_SUCCESS`;
const createRequestFailedActionType = (type: string) => `${type}_FAILED`;

export const isRequestAction = (action: AnyAction) => action.meta && action.meta.request;
