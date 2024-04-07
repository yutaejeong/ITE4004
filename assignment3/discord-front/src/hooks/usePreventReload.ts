import { useEffect } from "react";

export function usePreventReload() {
  useEffect(() => {
    const handleBeforeUnload: OnBeforeUnloadEventHandlerNonNull = (event) => {
      event.preventDefault();
      return (event.returnValue = "" as any);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
}
