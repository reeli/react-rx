import { DependencyList, useEffect, useMemo } from "react";
import { AnyAction, Reducer } from "redux";
import { useRequest } from "./useRequest";
import { IRequestActionCreator } from "./requestActionCreators";
import { useDispatch, useSelector } from "../../store/src/useStore";
import { defaultReducer } from "./reducer";
import { updateTempDataActionCreator } from "./action";

interface ITempDataOptions {
  scope?: string;
}

export const useTempData = <T extends IRequestActionCreator<T["TReq"], T["TResp"]>>(
  actionCreator: T,
  args: T["TReq"],
  deps: DependencyList = [],
  { scope }: ITempDataOptions,
) => {
  const groupName = scope ? `${scope}${actionCreator.$name}` : actionCreator.$name;

  const state = useSelector((state: any) => state.tempData[groupName]);
  const dispatch = useDispatch();

  const { fetchData, updateData, requestStage$ } = useMemo(() => {
    const [request, requestStage$] = useRequest(actionCreator, {
      onSuccess: (action) => {
        updateData(action)(defaultReducer);
      },
    });

    const updateData = <TAction extends AnyAction>(action: TAction) => (reducer: Reducer<any, TAction>) =>
      dispatch(updateTempDataActionCreator(groupName, reducer(state, action)));

    return {
      fetchData: (reqArgs: T["TReq"] = args) => request(reqArgs),
      updateData,
      requestStage$,
    };
  }, []);

  useEffect(() => {
    fetchData(args);
  }, deps);

  useEffect(() =>
    () => {
      dispatch(updateTempDataActionCreator(groupName, undefined));
    }, []);

  return [state, requestStage$, fetchData, updateData] as [
    typeof actionCreator["TResp"],
    typeof requestStage$,
    typeof fetchData,
    typeof updateData
    ];
};
