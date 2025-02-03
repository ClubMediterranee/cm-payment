import { useEffect } from "react";
import { sendMessage } from "./useMessage";

export const useResize = () => {
  useEffect(() => {
    if (window.top !== window.self) {
      document.getElementsByTagName("html")[0].style.overflow = "hidden";
      sendMessage("loaded_end");
    }
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      sendMessage("resize", { height: document.body.scrollHeight + 1 });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);
};
