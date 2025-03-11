import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Application, getFrontmostApplication, showHUD } from "@raycast/api";
import { MenusConfig } from "../types";
import { getMenuBarShortcuts, getMenuBarShortcutsApplescript, getTotalMenuBarItemsApplescript } from "../utils";

export function useMenuItemsDataLoader() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MenusConfig>();
  const [app, setApp] = useState<Application>();
  const [totalMenuItems, setTotalMenuItems] = useState<number>(0);

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const initialLoadRef = useRef(true); // Track if this is the first load
  const abortControllerRef = useRef<AbortController | null>(null);

  /*
   * Manage loading of menu item data
   */
  const loadingHandler = useCallback(async (refresh?: boolean) => {
    if (loading && !initialLoadRef.current) return;

    // Cancel any pending operations
    if (abortControllerRef.current) abortControllerRef.current.abort();

    // Create new abort controller for this operation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);

      // get current focused application
      const frontmostApp = await getFrontmostApplication();
      if (!frontmostApp.name) throw new Error("Could not detect frontmost application");
      setApp(frontmostApp);

      // Reset total menu items when app changes
      if (frontmostApp?.name !== app?.name) {
        setTotalMenuItems(0);
      }

      // only reload if user is hard refreshing or the focused app has changed
      if (!refresh && frontmostApp?.name === app?.name && !initialLoadRef.current) {
        setLoading(false);
        return;
      }

      if (signal.aborted) return;

      // Get total menu items count first for loading estimate
      const totalItems = await getTotalMenuBarItemsApplescript(frontmostApp);
      setTotalMenuItems(totalItems);

      // update menu data
      const getShortcuts = refresh ? getMenuBarShortcutsApplescript : getMenuBarShortcuts;
      const menuData = await getShortcuts(frontmostApp, totalItems);
      setData(menuData);

      // update loading states
      setLoading(false);
      if (!initialLoadRef.current) return;
      initialLoadRef.current = false;
    } catch (error) {
      // Only show error if not aborted
      if (signal.aborted) return;
      await showHUD(String(error));
      setLoading(false);
      setTotalMenuItems(0);
    }
  }, [app, loading]);

  /*
   * Load initial data
   */
  useEffect(() => {
    loadingHandler();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
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
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [app?.name]);

  return useMemo(() => ({
    loading,
    app,
    data,
    totalMenuItems,
    loaded: Boolean(data?.menus?.length && app?.name && !loading),
    refreshMenuItemsData: () => loadingHandler(true),
  }), [loading, app?.name, data, totalMenuItems]);
}
