import { AxiosInstance } from "axios";
import { AnyAction, Dispatch, MiddlewareAPI } from "redux";
import {
  createRequestFailAction,
  createRequestStartAction,
  createRequestSuccessAction,
  IRequestAction,
} from "./requestActionCreators";
import { isRequestAction } from "./utils";

export const createRequestMiddleware = (axiosIntance: AxiosInstance) => ({ dispatch }: MiddlewareAPI) => (next: Dispatch) => (
  action: AnyAction,
) => {
  if (isRequestAction(action)) {
    const requestAction = action as IRequestAction;
    dispatch(createRequestStartAction(requestAction));

    return axiosIntance
      .request(action.payload)
      .then((response) => dispatch(createRequestSuccessAction(requestAction, response)))
      .catch((error) => dispatch(createRequestFailAction(requestAction, error)));
  }
  return next(action);
};
