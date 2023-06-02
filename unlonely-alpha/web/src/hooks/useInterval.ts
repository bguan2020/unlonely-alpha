import { useRef, useEffect } from "react";

export default function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      /* eslint-disable prefer-const */
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
