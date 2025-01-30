import { useEffect, useRef, useState } from "react";
import { Application, getFrontmostApplication, showHUD } from "@raycast/api";
import { MenusConfig } from "../types";
import { getMenuBarShortcuts, getMenuBarShortcutsApplescript } from "../utils";

/**
 * Hook to manage menu items data for the frontmost application
 * @returns Object containing loading state, application info, menu data and refresh function
 */
export function useMenuItemsData() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MenusConfig>();
  const [app, setApp] = useState<Application>();
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined); // Ref to hold interval ID

  /**
   * Handles loading menu items data from the provided data loader function
   * @param getShortcuts Function to load menu items data for an application
   */
  async function loadingHandler(refresh?: boolean) {
    try {
      setLoading(true);

      const frontmostApp = await getFrontmostApplication();
      if (!frontmostApp.name) throw new Error("Could not detect frontmost application");

      if (!refresh && frontmostApp?.name === app?.name) return;
      setApp(frontmostApp);

      const getShortcuts = refresh ? getMenuBarShortcutsApplescript : getMenuBarShortcuts;
      const menuData = await getShortcuts(frontmostApp);
      setData(menuData);
    } catch (error) {
      await showHUD(String(error));
    } finally {
      setLoading(false);
    }
  }

  // Load initial data when component mounts
  useEffect(() => {
    loadingHandler();
  }, []);

  // Listen for focused application changes once open
  useEffect(() => {
    const checkFocusedApplication = async () => {
      const updatedApp = await getFrontmostApplication();
      if (app?.name === updatedApp.name) return;
      await loadingHandler();
    };

    intervalRef.current = setInterval(checkFocusedApplication, 1000);
    checkFocusedApplication();

    return () => {
      if (!intervalRef.current) return;
      clearInterval(intervalRef.current);
    };
  }, [app?.name]);

  return {
    loading,
    app,
    data,
    loaded: Boolean(data?.menus?.length && app?.name && !loading),
    refreshMenuItemsData: () => loadingHandler(true),
  };
}
