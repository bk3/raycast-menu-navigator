import { useEffect, useMemo, useRef, useState } from "react";
import { Application, getFrontmostApplication, showHUD } from "@raycast/api";
import { MenusConfig } from "../types";
import { getMenuBarShortcuts, getMenuBarShortcutsApplescript } from "../utils";

export function useMenuItemsDataLoader() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MenusConfig>();
  const [app, setApp] = useState<Application>();

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const initialLoadRef = useRef(true); // Track if this is the first load
  const loadingRef = useRef(true); // Also initialize this as true

  function updateLoading(loading: boolean) {
    setLoading(loading);
    loadingRef.current = loading;
  }

  /*
   * Manage loading of menu item data
   */
  async function loadingHandler(refresh?: boolean) {
    if (loadingRef.current && !initialLoadRef.current) return;

    try {
      updateLoading(true)

      // get current focused application
      const frontmostApp = await getFrontmostApplication();
      if (!frontmostApp.name) throw new Error("Could not detect frontmost application");
      setApp(frontmostApp);

      // only reload if user is hard refreshing or the focused app has changed
      if (!refresh && frontmostApp?.name === app?.name && !initialLoadRef.current) {
        updateLoading(false)
        return;
      }

      // update menu data
      const getShortcuts = refresh ? getMenuBarShortcutsApplescript : getMenuBarShortcuts;
      const menuData = await getShortcuts(frontmostApp);
      setData(menuData);

      // update loading states
      updateLoading(false)
      if (!initialLoadRef.current) return;
      initialLoadRef.current = false;
    } catch (error) {
      await showHUD(String(error));
      updateLoading(false)
    }
  }

  /*
   * Load initial data
   */
  useEffect(() => {
    loadingHandler();

    return () => {
      if (!intervalRef.current) return;
      clearInterval(intervalRef.current);
    };
  }, []);

  /*
   * Listen for focused application changes and load new app data
   */
  useEffect(() => {
    if (!app?.name) return;

    const checkFocusedApplication = async () => {
      try {
        const updatedApp = await getFrontmostApplication();
        if (app?.name === updatedApp.name) return;
        await loadingHandler();
      } catch (error) {
        console.error('Error checking focused app:', error);
      }
    };

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(checkFocusedApplication, 1000);

    return () => {
      if (!intervalRef.current) return;
      clearInterval(intervalRef.current);
    };
  }, [app?.name]);

  return useMemo(() => ({
    loading,
    app,
    data,
    loaded: Boolean(data?.menus?.length && app?.name && !loading),
    refreshMenuItemsData: () => loadingHandler(true),
  }), [loading, app?.name, data]);
}
