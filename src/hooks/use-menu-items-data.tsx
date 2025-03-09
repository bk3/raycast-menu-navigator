import { useEffect, useMemo, useRef, useState } from "react";
import { Application, getFrontmostApplication, showHUD } from "@raycast/api";
import { MenusConfig } from "../types";
import { getMenuBarShortcuts, getMenuBarShortcutsApplescript } from "../utils";

export function useMenuItemsDataLoader() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MenusConfig>();
  const [app, setApp] = useState<Application>();

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const loadingRef = useRef(true); // Also initialize this as true
  const initialLoadRef = useRef(true); // Track if this is the first load

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

      // only reload if user is hard refreshing or the focused app has changed
      if (!refresh && frontmostApp?.name === app?.name && !initialLoadRef.current) {
        updateLoading(false)
        return;
      }

      // update app and menu data
      setApp(frontmostApp);
      const getShortcuts = refresh ? getMenuBarShortcutsApplescript : getMenuBarShortcuts;
      const menuData = await getShortcuts(frontmostApp);
      setData(menuData);

      // update initial loading
      if (!initialLoadRef.current) return;
      updateLoading(false)
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
