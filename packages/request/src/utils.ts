import { endsWith, get } from "lodash";
import { IRequestFailAction, IRequestStartAction, IRequestSuccessAction } from "./requestActionCreators";

interface Action<T = any> {
  type: T;
}

interface AnyAction extends Action {
  [extraProps: string]: any;
}

enum RequestActionSuffix {
  START = "_Start",
  SUCCESS = "_Success",
  FAIL = "_Fail",
}

const checkActionTypeBySuffix = (suffix: string) => (action: AnyAction) =>
  get(action.meta, "prevAction.meta.request") && endsWith(action.type, suffix);

export const isRequestAction = (action: AnyAction) => action.meta && action.meta.request;

export const isRequestStartAction = (action: AnyAction): action is IRequestStartAction => checkActionTypeBySuffix(RequestActionSuffix.START)(action);

export const isRequestSuccessAction = (action: AnyAction): action is IRequestSuccessAction => checkActionTypeBySuffix(RequestActionSuffix.SUCCESS)(action);

export const isRequestFailAction = (action: AnyAction): action is IRequestFailAction => checkActionTypeBySuffix(RequestActionSuffix.FAIL)(action);

export const createRequestStartActionType = (type: string) => `${type}${RequestActionSuffix.START}`;
export const createRequestSuccessActionType = (type: string) => `${type}${RequestActionSuffix.SUCCESS}`;
export const createRequestFailActionType = (type: string) => `${type}${RequestActionSuffix.FAIL}`;
