import { useMemo } from "react";
import { Application, List, Icon } from "@raycast/api";
import { MenusConfig, MenuItem } from "../types";
import { ListItemActions } from "./list-item-actions";

export interface ListItemsProps {
  app: Application;
  data?: MenusConfig;
  refresh: () => Promise<void>;
}

// Map special menu items to their SF Symbol icons
const SPECIAL_ICONS: Record<string, Icon> = {
  "Start Dictation…": Icon.Microphone,
  "Emoji & Symbols": Icon.Globe,
};

// Helper function to determine accessories
function getAccessories(item: MenuItem) {
  if (item.key !== "NIL" && item.modifier?.length) {
    return [{ text: `${item.modifier} ${item.key}` }];
  }

  if (SPECIAL_ICONS[item.shortcut]) {
    return [{ icon: SPECIAL_ICONS[item.shortcut] }];
  }

  if (item.submenu?.length) {
    return [{ tag: "Menu" }];
  }

  return undefined;
};

export function ListItems({ app, data, refresh }: ListItemsProps) {
  const renderedList = useMemo(() => {
    if (!data?.menus?.length) return null;

    return (
      data.menus.map((menu) => (
        <List.Section
          key={`${app.name}-${menu.menu}`}
          title={menu.menu}
        >
          {menu.items?.map((item) => (
            <List.Item
              key={`${app.name}-${item.menu}-${item.shortcut}`}
              title={item.shortcut}
              accessories={getAccessories(item)}
              actions={<ListItemActions app={app} item={item} refresh={refresh} />}
            />
          ))}
        </List.Section>
      ))
    );
  }, [data, app.name, refresh]);

  return renderedList;
}

