import { DependencyList, useEffect, useMemo, useRef } from "react";
import { AnyAction, Reducer } from "redux";
import { useRequest } from "./useRequest";
import { IRequestActionCreator, IRequestSuccessAction } from "./requestActionCreators";
import { updateTempDataActionCreator } from "./action";
import { useDispatch, useSelector } from "../../hooks/src";

const defaultReducer = <TResp>(_: void, action: IRequestSuccessAction<TResp>) => action.payload.data;

export const useTempData = <T extends IRequestActionCreator<T["TReq"] | undefined, T["TResp"]>>(
  actionCreator: T,
  args: T["TReq"] | undefined,
  deps: DependencyList = [],
  reducer?: Reducer<any>,
) => {
  const state = useSelector((state: any) => state.tempData[actionCreator.$name]);
  const stateRef = useRef(null);
  stateRef.current = state;

  const dispatch = useDispatch();

  const updateData = useMemo(() =>
    <TAction extends AnyAction>(action: TAction) => (reducer: Reducer<any, TAction>) => dispatch(updateTempDataActionCreator(actionCreator.$name, reducer(stateRef.current, action))), []);

  const [fetchData, requestStage$] = useRequest(actionCreator, {
    onSuccess: (action) => {
      const updateDataReducer = reducer || defaultReducer;
      updateData(action)(updateDataReducer);
    },
  });


  useEffect(() => {
    fetchData(args);
  }, deps);

  useEffect(() =>
    () => {
      dispatch(updateTempDataActionCreator(actionCreator.$name, undefined));
    }, []);

  return [state, requestStage$, fetchData, updateData] as [
    typeof actionCreator["TResp"],
    typeof requestStage$,
    typeof fetchData,
    typeof updateData
  ];
};
