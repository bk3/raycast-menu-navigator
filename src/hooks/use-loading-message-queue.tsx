import { Application } from "@raycast/api";
import { useState, useEffect, useRef } from "react";
import { getTotalMenuBarItemsApplescript } from "../utils";

const messages = [
  'Loading',
  'Processing',
  'Getting close',
  'Almost there',
  'Very close',
];

function convertToMinutes(seconds: number) {
  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

export function useLoadingMessageQueue(loading: boolean, app?: Application) {
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingState, setLoadingState] = useState('Please wait');
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const messageIndex = useRef(0);

  async function loadTotals(app: Application) {
    const totals = await getTotalMenuBarItemsApplescript(app)
    setTotalItems(totals)
  }

  // Set initial loading message once an app is defined
  useEffect(() => {
    if (!app?.name) return;
    if (totalItems === null) loadTotals(app);
    const loadingText = totalItems ? `This initial setup may take up to ${convertToMinutes(totalItems)}` : '';
    setLoadingMessage(loadingText);

    return () => {
      setLoadingMessage('');
      setLoadingState('Please wait');
      messageIndex.current = 0;
    };
  }, [app?.name, totalItems]);

  // Update loading message every 10 seconds
  useEffect(() => {
    if (!app?.name) return;

    if (loading) {
      const interval = totalItems ? (totalItems * 1000) / 5 : 10000
      const timeoutId = setTimeout(() => {
        messageIndex.current = (messageIndex.current + 1) % messages.length;
        setLoadingState(messages[messageIndex.current]);
      }, interval);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      setLoadingState("Please wait");
      messageIndex.current = 0;
    }
  }, [loading, app?.name, messageIndex.current, totalItems]);

  return { loadingMessage, loadingState };
}

