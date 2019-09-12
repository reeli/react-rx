import { Dispatch } from "redux";
import { Subject } from "rxjs";

export const createRxMiddleware = () => {
  const rootSubject$ = new Subject();
  return () => {
    return (next: Dispatch) => {
      return (action: any) => {
        if (action instanceof Subject) {
          return rootSubject$.subscribe(action);
        }
        const result = next(action);
        rootSubject$.next(action);
        return result;
      };
    };
  };
};
