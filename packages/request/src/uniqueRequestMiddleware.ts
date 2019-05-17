import { isEqual, throttle, uniqWith } from "lodash";
import { IRequestAction } from "./requestActionCreators";
import { isRequestAction } from "./utils";
import { Dispatch } from "redux";

export const uniqueRequestMiddleware = (delay = 100) => {
  let cachedActions: IRequestAction[] = [];

  const func = throttle(
    (callback) => {
      cachedActions = [];
      callback();
    },
    delay,
    { leading: false },
  );

  return () => (next: Dispatch) => (action: any) => {
    if (!isRequestAction(action)) {
      return next(action);
    }

    cachedActions = cachedActions.concat(action);

    func(
      ((actions) => () => {
        const filteredActions = uniqWith(actions, (a, b) => isEqual(a.payload, b.payload));
        filteredActions.forEach((uniqueAction) => {
          next(uniqueAction);
        });
      })(cachedActions),
    );
  };
};
