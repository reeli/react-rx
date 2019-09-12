import { useContext } from "react";
import { StoreContext } from "./StoreContext";

export const useDispatch = () => {
  const { dispatch } = useContext(StoreContext);
  if (!dispatch) {
    return () => {};
  }
  return dispatch;
};
