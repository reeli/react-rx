import { renderHook } from "@testing-library/react-hooks";
import { usePrevious } from "../usePrevious";

describe("usePrevious", () => {
  it("should return undefined when first render", () => {
    const previousState = {
      test: "test",
    };

    const { result } = renderHook(() => usePrevious(previousState));

    expect(result.current).toEqual(undefined);
  });

  it("should return previous state", () => {
    let previousState = {
      test: "test",
    };
    const { result, rerender } = renderHook(() => usePrevious(previousState));

    previousState = {
      test: "test1",
    };
    rerender();

    expect(result.current).toEqual({
      test: "test",
    });
  });
});
