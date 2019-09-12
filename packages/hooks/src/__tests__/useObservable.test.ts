import { renderHook } from "@testing-library/react-hooks";
import { Observable } from "rxjs/internal/Observable";
import { useObservable } from "../useObservable";

describe("useObservable", () => {
  it("should set and return value from observable", () => {
    const observable = new Observable((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    const { result } = renderHook(() => useObservable(observable));

    expect(result.current).toEqual(3);
  });

  it("should set and return default value when observable's value is undefined", () => {
    const observable = new Observable((subscriber) => {
      subscriber.complete();
    });
    const defaultValue = "test";

    const { result } = renderHook(() => useObservable(observable, defaultValue));

    expect(result.current).toEqual(defaultValue);
  });
});
