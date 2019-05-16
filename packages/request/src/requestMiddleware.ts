import { AxiosInstance } from "axios";
import { AnyAction, Dispatch, MiddlewareAPI } from "redux";
import {
  createRequestFailedAction,
  createRequestStartAction,
  createRequestSuccessAction,
  IRequestAction,
} from "./requestActionCreators";
import { isRequestAction } from "./utils";

export const requestMiddleware = (axiosIntance: AxiosInstance) => ({ dispatch }: MiddlewareAPI) => (next: Dispatch) => (
  action: AnyAction,
) => {
  if (isRequestAction(action)) {
    const requestAction = action as IRequestAction;
    dispatch(createRequestStartAction(requestAction));

    return axiosIntance
      .request(action.payload)
      .then((response) => dispatch(createRequestSuccessAction(requestAction, response)))
      .catch((error) => dispatch(createRequestFailedAction(requestAction, error)));
  }
  return next(action);
};
