import { Application } from "@raycast/api";
import { useState, useEffect, useRef } from "react";

type LoadingMessageQueueProps = {
  loading: boolean;
  app?: Application;
  totalMenuItems: number;
};

const messages = [
  'Loading',
  'Processing',
  'Getting close',
  'Almost there',
  'Very close',
];

export function useLoadingMessageQueue({ loading, app, totalMenuItems }: LoadingMessageQueueProps) {
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [loadingState, setLoadingState] = useState('Please wait');
  const messageIndex = useRef(0);

  // Set initial loading message once an app is defined
  useEffect(() => {
    if (!app?.name) return;
    
    if (totalMenuItems > 0) {
      const estimatedMinutes = Math.ceil(totalMenuItems / 60);
      setLoadingMessage(`Loading ${totalMenuItems} menu items (estimated time: ${estimatedMinutes} ${estimatedMinutes === 1 ? 'minute' : 'minutes'})...`);
    } else {
      setLoadingMessage(`Initial setup may take a few minutes to complete...`);
    }

    return () => {
      setLoadingMessage('Loading...');
      setLoadingState('Please wait');
      messageIndex.current = 0;
    };
  }, [app?.name, totalMenuItems]);

  // Update loading message every 10 seconds
  useEffect(() => {
    if (!app?.name) return;

    if (loading) {
      const timeoutId = setTimeout(() => {
        messageIndex.current = (messageIndex.current + 1) % messages.length;
        setLoadingState(messages[messageIndex.current]);
      }, 10000);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      setLoadingState("Please wait");
      messageIndex.current = 0;
    }
  }, [loading, app?.name, messageIndex.current]);

  return { loadingMessage, loadingState };
}

