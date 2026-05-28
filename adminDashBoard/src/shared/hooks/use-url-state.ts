import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

export function useUrlState<T extends Record<string, { type: "string" | "number"; default: unknown }>>(
  schema: T
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const res = {} as Record<keyof T, any>;
    for (const key in schema) {
      const field = schema[key];
      const val = searchParams.get(key);
      if (val === null) {
        res[key] = field.default;
      } else {
        if (field.type === "number") {
          const num = Number(val);
          res[key] = isNaN(num) ? field.default : num;
        } else {
          res[key] = val;
        }
      }
    }
    return res as { [K in keyof T]: T[K]["type"] extends "number" ? number : string };
  }, [searchParams, schema]);

  const setState = useCallback(
    (newState: Partial<{ [K in keyof T]: T[K]["type"] extends "number" ? number : string }>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const key in newState) {
            const val = newState[key];
            if (val === undefined || val === null || val === schema[key].default) {
              next.delete(key);
            } else {
              next.set(key, String(val));
            }
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, schema]
  );

  return [state, setState] as const;
}
