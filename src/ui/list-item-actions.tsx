import {
  Action,
  ActionPanel,
  Application,
  closeMainWindow,
  useNavigation,
} from "@raycast/api";
import { MenuItem } from "../types";
import { runShortcut } from "../utils";
import { SubMenuListItems } from "./submenu-list-items";

export interface ListItemActionsProps {
  app: Application;
  item: MenuItem;
  refresh: () => Promise<void>;
}

export function ListItemActions({ app, item, refresh }: ListItemActionsProps) {
  const { push } = useNavigation();

  return (
    <ActionPanel>
      {item.submenu?.length ? (
        <Action
          title="Open Menu"
          onAction={() => {
            push(<SubMenuListItems app={app} item={item} refresh={refresh} />);
          }}
        />
      ) : (
        <Action
          title="Run Command"
          onAction={async () => {
            await closeMainWindow();
            await runShortcut(app.name, item)
          }}
        />
      )}
      <Action
        title="Refresh Commands"
        shortcut={{ modifiers: ["ctrl", "cmd"], key: "enter" }}
        onAction={refresh}
      />
    </ActionPanel>
  );
}

