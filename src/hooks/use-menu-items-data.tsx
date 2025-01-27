import { useEffect, useState } from "react";
import { Application, getFrontmostApplication, showHUD } from "@raycast/api";
import { MenusConfig } from "../types";
import { loadInitialData, refreshData } from "../data";

export function useMenuItemsData() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MenusConfig>()
  const [app, setApp] = useState<Application>()

  async function loadingHandler(fn: (App: Application) => Promise<MenusConfig | undefined>) {
    try {
      setLoading(true)

      // get app
      const appResponse = await getFrontmostApplication();
      if (!appResponse.name) throw new Error('Focused application window not found')
      setApp(appResponse)

      // load data
      const initialData = await fn(appResponse)
      setData(initialData)
    } catch (e) {
      await showHUD(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadingHandler(loadInitialData);
  }, []);

  return {
    loading,
    app,
    data,
    loaded: data && data?.menus?.length && app?.name && !loading,
    refreshMenuItemsData: () => loadingHandler(refreshData),
  }
}
