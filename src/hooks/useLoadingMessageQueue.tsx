import { Application } from "@raycast/api";
import { useState, useEffect } from "react";

export function useLoadingMessageQueue(loading: boolean, app?: Application) {
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingState, setLoadingState] = useState('');

  const messages = [
    `Processing`,
    `Please wait`,
    `Getting close`,
    `Almost there`,
  ]

  // Set initial loading message when app.name becomes available
  useEffect(() => {
    if (!app?.name) return;
    setLoadingMessage(`Loading ${app.name} menu items...`);

    return () => {
      setLoadingMessage('')
    }
  }, [app?.name]);

  // Handle loading message progression
  useEffect(() => {
    if (!app?.name || !loading) return;

    const timeoutId = setTimeout(() => {
      const currentIndex = messages.indexOf(loadingState);
      if (currentIndex < messages.length - 1) {
        const nextIndex = currentIndex + 1;
        setLoadingState(messages[nextIndex]);
      }
    }, 8000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadingMessage, loading, messages, app?.name]);

  return { loadingMessage, loadingState };
}

