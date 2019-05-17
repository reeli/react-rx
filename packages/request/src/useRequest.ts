import { useMemo } from "react";
import { createRequestActionCreator, IRequestActionCreator, IRequestFailAction, IRequestSuccessAction } from "./index";
import { useDispatch } from "../../store/src/useStore";
import { BehaviorSubject } from "rxjs";

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

export const useRequest = <TReq = undefined, TResp = any>(
  actionCreator: IRequestActionCreator<TReq, TResp, IRequestCallbacks<TResp>>,
  options: IRequestCallbacks<TResp> = {},
) => {
  const dispatch = useDispatch();

  const [request, requestStage$] = useMemo(() => {
    // Create BehaviorSubject inside useMemo to avoid be recreated when every render
    const sub$ = new BehaviorSubject(RequestStage.INITIAL);

    const request = (args: TReq) => {
      requestStage$.next(RequestStage.START);

      const requestAction = actionCreator(args, {
        onSuccess: (action) => {
          options.onSuccess && options.onSuccess(action);
          sub$.next(RequestStage.SUCCESS);
        },
        onFail: (action) => {
          options.onFail && options.onFail(action);
          sub$.next(RequestStage.FAIL);
        },
      });

      dispatch(requestAction);
    };
    return [request, sub$];
  }, []);

  // We have to use as here, otherwise the type will be Array<typeof  requestFn | typeof requestStage$>
  return [request, requestStage$] as [typeof request, typeof requestStage$];
};

const requestActionCreator = createRequestActionCreator(
  "REQUEST_ACTION",
  ({ name, age }: { name: string; age: number }) => ({
    method: "GET",
    url: "/mock-api",
    data: {
      name,
      age,
    },
  }),
);

const [req, test] = useRequest(requestActionCreator, {
  onSuccess: () => {

  },
  onFail: () => {

  },
});

req({ age: "hell", name: "rui" });
console.log(test);
