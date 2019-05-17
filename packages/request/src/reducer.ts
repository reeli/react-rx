import { IUpdateTempDataAction, updateTempDataActionCreator } from "./action";
import { IRequestSuccessAction } from "./requestActionCreators";

export const tempDataReducer = <TData>(state: any = {}, action: IUpdateTempDataAction<TData>) => {
  if (action.type === `${updateTempDataActionCreator}` && action.meta && action.payload) {
    return {
      ...state,
      [action.meta.groupKey]: action.payload.data,
    };
  }
  return state;
};

export const defaultReducer = <TResp>(_: void, action: IRequestSuccessAction<TResp>) => action.payload.data;
