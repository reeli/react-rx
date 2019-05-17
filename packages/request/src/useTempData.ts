import { DependencyList, useEffect, useMemo } from "react";
import { AnyAction } from "redux";
import { BehaviorSubject } from "rxjs";
import { useSelector } from "src-modules/store";
import { IRequestAction, IRequestSuccessAction } from "./index";
import { IRequestCallbacks } from "../rx-connect/rxConnect";
import { useRxDispatch } from "../rx-connect/useRxDispatch";
import { updateTempData } from "./actions";
import { defaultReducer } from "./defaultReducer";
import { RequestStage, TReducer } from "./types";

interface IRequestActionCreator<TReq = any, TRes = any> {
  (args: TReq | undefined, meta: IRequestCallbacks): IRequestAction;

  groupName: string;
  TResp: TRes;
  TArgs: TReq;
}

interface ITempDataProps<T extends IRequestActionCreator> {
  destroyOnUnmount?: boolean; // TODO: To be removed, replace by useEntity. should add reducer in this case 或者 useRequest + useStoreState, 自由组合
  scope?: string;
  reducer?: TReducer<IRequestSuccessAction<T["TResp"]>>; // TODO: To be removed, or create another useTempDataXXX to handle this case
  autoFetch?: boolean; // TODO: To be removed
}

// 充分利用泛型进行推导
export const useTempData = <T extends IRequestActionCreator>(
  actionCreator: T,
  args: T["TArgs"],
  deps: DependencyList = [],
  { destroyOnUnmount = true, reducer = defaultReducer, scope }: ITempDataProps<T>,
) => {
  // TODO: wrapper BehaviorSubject by useMemo, and move requestStage$ to useRequest
  const requestStage$ = new BehaviorSubject<RequestStage>(RequestStage.INITIAL);
  const groupName = scope ? `${scope}${actionCreator.groupName}` : actionCreator.groupName;

  const data = useSelector((state: any) => state.tempData[groupName]);
  const dispatch = useRxDispatch();

  const { fetchData, updateData } = useMemo(() => {
    const fetchData = (requestArgs = args) => {
      requestStage$.next(RequestStage.START);

      const requestAction = actionCreator(requestArgs, {
        success: (requestSuccessAction) => {
          updateData<IRequestSuccessAction>(requestSuccessAction)(reducer);
          requestStage$.next(RequestStage.SUCCESS);
        },
        failed: () => {
          requestStage$.next(RequestStage.FAIL);
        },
      });
      return dispatch(requestAction);
    };

    const updateData = <TAction extends AnyAction>(action: TAction) => (reducer: TReducer<TAction>) =>
      dispatch(updateTempData(groupName, reducer(data, action)));

    return {
      fetchData,
      updateData,
    };
  }, []);

  useEffect(() => {
    // TODO: Remove data here.
    if (!data) {
      // should call api request when data exist?
      fetchData(args);
    }
  }, deps);

  useEffect(() => {
    return () => {
      if (destroyOnUnmount) {
        updateTempData(groupName, undefined);
      }
    };
  }, []);

  // TODO: Which case will use updateData?
  return [data, requestStage$, fetchData, updateData] as [
    typeof actionCreator["TResp"],
    typeof requestStage$,
    typeof fetchData,
    typeof updateData
  ];
};
