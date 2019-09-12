import React, { useContext } from "react";
import { Store } from "redux";

export const StoreContext = React.createContext({} as Store<any>);
export const useStore = () => useContext(StoreContext);

export const useSelector = <TState>(fn: (state: any) => TState) => {
  const { getState } = useStore();
  if (!getState) {
    return;
  }
  return fn(getState());
};

export const useDispatch = () => {
  const { dispatch } = useStore();
  if (!dispatch) {
    return () => {};
  }
  return dispatch;
};
