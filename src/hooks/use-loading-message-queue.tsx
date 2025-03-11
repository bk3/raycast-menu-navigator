import { Application } from "@raycast/api";
import { useState, useEffect, useRef } from "react";

type LoadingMessageQueueProps = {
  app?: Application;
  totalMenuItems: number;
};

export function useLoadingMessageQueue({ app, totalMenuItems }: LoadingMessageQueueProps) {
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<string | null>(null);
  const messageIndex = useRef(0);

  // Set initial loading message once an app is defined
  useEffect(() => {
    if (!app?.name) return;

    if (totalMenuItems > 0) {
      const estimatedMinutes = Math.ceil(totalMenuItems / 60);
      setLoadingMessage(`Processing ${totalMenuItems} menu items...`);
      setLoadingState(`Estimate: ${estimatedMinutes} ${estimatedMinutes === 1 ? 'minute' : 'minutes'}`)
    }

    return () => {
      setLoadingMessage(null);
      setLoadingState(null);
      messageIndex.current = 0;
    };
  }, [app?.name, totalMenuItems]);

  return { loadingMessage, loadingState };
}

