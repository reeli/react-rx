import { useEffect, useRef } from "react";
import {
  Subject,
  tap,
} from "rxjs";
import { fromArrayLike } from "rxjs/internal/observable/innerFrom";

type OnSuccess<TResp> = (resp: TResp) => void;

export const useRequestSuccess = <TReq, TResp>(dataList$: Subject<TResp>[], onSuccess: OnSuccess<TResp>) => {
  const ref = useRef();
  useEffect(() => {
    fromArrayLike(dataList$).pipe()
  }, []);

  return request;
};


const dataA$ = useRequet(A)
const dataB$ = useRequet(B)
const dataC$ = useRequet(C)


// dataA$.pipe(
//   tap((resp) => dataB$.request(resp)),
//   tap((resp) => dataB$.request(resp)),
// )


// useRequestSuccess(dataA$, (A)=>{
//   dataB$.request(xxx)
// })
//
// useRequestSuccess(dataB$, ([A, B])=>{
//   dataC$.request(xxx)
// })

useEffect(() => {
  dataA$.request(xxx)
}, []);



