import { useEffect, useState } from "react";
import { MenusConfig, SectionTypes } from "../types";

/*
 * Menu item filtering
 */
export function useMenuItemFilters(data?: MenusConfig) {
  const [options, setOptions] = useState<SectionTypes[]>([])
  const [filter, setFilter] = useState<string>('all-commands') // Set initial state
  const [filteredData, setFilteredData] = useState<MenusConfig>()

  // Handle available options
  useEffect(() => {
    if (!data?.menus?.length) {
      if (options?.length) setOptions([])
      return;
    }

    const sections = data?.menus?.map(m => ({ id: m.menu, value: m.menu }))
    setOptions(sections)
  }, [data?.menus])

  // Filter data
  useEffect(() => {
    if (!data?.menus?.length) return;

    let menus;

    switch (filter) {
      case 'all-commands':
        menus = data.menus;
        break;
      case 'shortcut-commands':
        menus = data.menus.map(menuGroup => ({
          ...menuGroup,
          items: menuGroup.items.filter(item => item.shortcut?.length && item.key !== 'NIL')
        })).filter(menuGroup => menuGroup.items.length > 0);
        break;
      case 'no-shortcut-commands':
        menus = data.menus.map(menuGroup => ({
          ...menuGroup,
          items: menuGroup.items.filter(item => !item.shortcut?.length || item.key === 'NIL')
        })).filter(menuGroup => menuGroup.items.length > 0);
        break;
      default:
        const menuIndex = data?.menus?.findIndex(m => m.menu === filter)
        if (menuIndex === -1) {
          menus = data.menus;
          return
        };
        menus = [data?.menus[menuIndex]]
        break;
    }

    setFilteredData({ ...data, menus })
  }, [filter, data])

  return { options, filter, setFilter, filteredData }
}
