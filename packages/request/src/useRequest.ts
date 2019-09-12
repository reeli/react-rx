import { useEffect, useMemo, useRef } from "react";
import {
  IRequestActionCreator,
  IRequestFailAction,
  IRequestSuccessAction,
  isRequestFailAction,
  isRequestSuccessAction,
} from "./index";
import { useDispatch } from "../../hooks/src/useStore";
import { BehaviorSubject, merge, Subject } from "rxjs";
import { AnyAction } from "redux";
import { filter, tap } from "rxjs/operators";
import { isEqual } from "lodash";

export enum RequestStage {
  INITIAL = "INITIAL",
  START = "START",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

interface IRequestCallbacks<TResp> {
  onSuccess?: (action: IRequestSuccessAction<TResp>) => void;
  onFail?: (action: IRequestFailAction) => void;
}

export const useRequest = <T extends IRequestActionCreator<T["TReq"] | undefined, T["TResp"]>>(
  actionCreator: T,
  options: IRequestCallbacks<T["TResp"]> = {},
) => {
  const dispatch = useDispatch();
  const lastActionRef = useRef<AnyAction>();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const { request, requestStage$ } = useMemo(() => {
    const requestStage$ = new BehaviorSubject(RequestStage.INITIAL);
    const request = <TMeta = any>(args: T["TReq"] | undefined, requestMetaConfig?: TMeta) => {
      requestStage$.next(RequestStage.START);

      const action = actionCreator(args, requestMetaConfig);
      lastActionRef.current = action;

      dispatch(action);
    };

    return {
      request,
      requestStage$,
    };
  }, []);

  useEffect(() => {
    const subject$ = new Subject<AnyAction>();
    const rootSubscription = dispatch<any>(subject$);

    const isActionsEqual = (action: IRequestSuccessAction | IRequestFailAction) =>
      !!lastActionRef.current &&
      action.meta.prevAction.type === lastActionRef.current.type &&
      isEqual(action.meta.prevAction.payload, lastActionRef.current.payload);

    const subscription = merge(
      subject$.pipe(
        filter(isRequestSuccessAction),
        filter(isActionsEqual),
        tap((requestSuccessAction) => {
          requestStage$.next(RequestStage.SUCCESS);
          optionsRef.current.onSuccess && optionsRef.current.onSuccess(requestSuccessAction as IRequestSuccessAction);
        }),
      ),
      subject$.pipe(
        filter(isRequestFailAction),
        filter(isActionsEqual),
        tap((requestFailAction) => {
          requestStage$.next(RequestStage.FAIL);
          optionsRef.current.onFail && optionsRef.current.onFail(requestFailAction as IRequestFailAction);
        }),
      ),
    ).subscribe();

    return () => {
      subscription.unsubscribe();
      rootSubscription.unsubscribe();
    };
  }, []);

  return [request, requestStage$] as [typeof request, BehaviorSubject<RequestStage>];
};
