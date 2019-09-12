import { useContext, useEffect, useState } from "react";
import { usePrevious } from "./usePrevious";
import { StoreContext } from "./StoreContext";

export const useSelector = <TState>(selector: (state: any) => TState) => {
  const { getState, subscribe } = useContext(StoreContext);

  const value = selector(getState());
  const [data, setData] = useState(value);
  const prevData = usePrevious(data);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const latestData = selector(getState());
      if (latestData !== prevData) {
        setData(latestData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
};
