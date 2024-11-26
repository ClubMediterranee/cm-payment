import { useCallback, useEffect } from "react";

const useMessage = <TData extends { type: string }>(
  type: string,
  callback: (data: TData) => void,
) => {
  const handleListener = useCallback(
    (event: { data: TData; origin: string; type: string }) => {
      if (event.origin === "http://localhost:3000") {
        if (event.data.type === type) {
          callback(event.data);
        }
      }
    },
    [callback, type],
  );

  useEffect(() => {
    window.addEventListener("message", handleListener);
    return () => window.removeEventListener("message", handleListener);
  }, [handleListener, type]);
};

const sendMessage = (type: string, data = {}) => {
  window.parent.postMessage({ type, data }, "http://localhost:3000");
};

export { useMessage, sendMessage };
