import { useEffect, useState } from "react";
import { sendMessage } from "./useMessage";

export const useResize = () => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setHeight(document.documentElement.scrollHeight);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }, []);

  useEffect(() => {
    sendMessage("resize", { height: height + 1 });
  }, [height]);
};
