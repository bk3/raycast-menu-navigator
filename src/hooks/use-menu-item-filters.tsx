import { useEffect, useState } from "react";
import { MenusConfig, SectionTypes } from "../types";

/**
 * Hook to handle filtering menu items based on different criteria
 * @param data The menu configuration data to filter
 * @returns Filter options, current filter, filter setter, and filtered data
 */
export function useMenuItemFilters(data?: MenusConfig) {
  const [options, setOptions] = useState<SectionTypes[]>([]);
  const [filter, setFilter] = useState<string>("all-commands");
  const [filteredData, setFilteredData] = useState<MenusConfig>();

  // Generate filter options from available menus
  useEffect(() => {
    if (!data?.menus?.length) {
      if (options.length) setOptions([]);
      return;
    }

    const sections = data.menus.map((menu) => ({
      id: menu.menu,
      value: menu.menu,
    }));
    setOptions(sections);
  }, [data?.menus]);

  // Apply selected filter to data
  useEffect(() => {
    if (!data?.menus?.length) return;

    const menuIndex = data.menus.findIndex((menu) => menu.menu === filter);
    let menus;

    switch (filter) {
      case "all-commands":
        menus = data.menus;
        break;
      case "shortcut-commands":
        menus = data.menus
          .map((menuGroup) => ({
            ...menuGroup,
            items: menuGroup.items.filter(
              (item) => item.shortcut?.length && item.key !== "NIL",
            ),
          }))
          .filter((menuGroup) => menuGroup.items.length > 0);
        break;
      case "no-shortcut-commands":
        menus = data.menus
          .map((menuGroup) => ({
            ...menuGroup,
            items: menuGroup.items.filter(
              (item) => !item.shortcut?.length || item.key === "NIL",
            ),
          }))
          .filter((menuGroup) => menuGroup.items.length > 0);
        break;
      case "menu-commands":
        menus = data.menus
          .map((menuGroup) => ({
            ...menuGroup,
            items: menuGroup.items.filter((item) => item.submenu?.length),
          }))
          .filter((menuGroup) => menuGroup.items.length > 0);
        break;
      default:
        if (menuIndex === -1) {
          menus = data.menus;
          return;
        }
        menus = [data.menus[menuIndex]];
        break;
    }

    setFilteredData({ ...data, menus });
  }, [filter, data]);

  return { options, filter, setFilter, filteredData };
}
