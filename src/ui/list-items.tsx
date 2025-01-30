import { useMemo } from "react";
import { Application, List } from "@raycast/api";
import { MenusConfig } from "../types";
import { ListItemActions } from "./list-item-actions";

export interface ListItemsProps {
  app: Application;
  data?: MenusConfig;
  refresh: () => Promise<void>;
}

export function ListItems({ app, data, refresh }: ListItemsProps) {
  const renderedList = useMemo(() => {
    if (!data?.menus) return null;
    return data.menus.map((i) => (
      <List.Section title={i.menu} key={`${app.name}-${i.menu}`}>
        {i.items?.map((item) => (
          <List.Item
            title={item.shortcut}
            accessories={
              item.key !== "NIL" && item?.modifier?.length
                ? [{ text: `${item.modifier} ${item.key}` }]
                : item.submenu?.length
                  ? [{ tag: "Menu" }]
                  : undefined
            }
            key={`${app.name}-${item.menu}-${item.shortcut}`}
            actions={
              <ListItemActions app={app} item={item} refresh={refresh} />
            }
          />
        ))}
      </List.Section>
    ));
  }, [data, app.name, refresh]);

  return renderedList;
}
