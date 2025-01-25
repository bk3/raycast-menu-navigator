import { useEffect, useState } from "react";
import { Application, getFrontmostApplication, showHUD } from "@raycast/api";
import { MenusConfig } from "../types";
import { loadInitialData } from "../data";


export function useMenuItemsData() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MenusConfig>()
  const [app, setApp] = useState<Application>()

  async function loadData() {
    try {
      setLoading(true)

      // get app
      const appResponse = await getFrontmostApplication();
      if (!appResponse.name) throw new Error('Focused application window not found')
      setApp(appResponse)

      // load data
      const initialData = await loadInitialData(appResponse)
      setData(initialData)
    } catch (error) {
      console.log(error)
      await showHUD(String(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return {
    loading,
    app,
    data,
    loaded: data && data?.menus?.length && app?.name && !loading,
  }
}
