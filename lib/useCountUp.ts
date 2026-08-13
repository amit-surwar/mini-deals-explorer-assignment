import { useEffect, useRef, useState } from "react";

const IS_TEST =
  typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined;

/**
 * Animates a number from its previous value to `target` over `duration` ms
 * with an ease-out curve. Returns the in-flight value to render. In Jest it
 * returns the target immediately so assertions stay deterministic.
 */
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(IS_TEST ? target : 0);
  const fromRef = useRef(IS_TEST ? target : 0);

  useEffect(() => {
    if (IS_TEST) {
      setValue(target);
      return;
    }
    const from = fromRef.current;
    if (from === target) return;

    let frame: number;
    const start = Date.now();
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (target - from) * eased;
      setValue(current);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
