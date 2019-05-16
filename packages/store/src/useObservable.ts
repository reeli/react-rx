import { useEffect, useState } from "react";
import { BehaviorSubject, Observable } from "rxjs";

export const useObservable = <T>(ob$: Observable<T> | BehaviorSubject<T>, defaultValue?: T) => {
  const [state, setState] = useState(() =>
    (ob$ as BehaviorSubject<T>).getValue ? (ob$ as BehaviorSubject<T>).getValue() : defaultValue,
  );

  useEffect(() => {
    const subscription = ob$.subscribe((value) => {
      setState(value);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
};
