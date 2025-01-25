import { List, ActionPanel, Action, closeMainWindow, Application, Color } from "@raycast/api";
import { runShortcut } from "./actions";
import { MenuItem, MenusConfig } from "./types";
import { useLoadingMessageQueue } from "./hooks/useLoadingMessageQueue";
import { useMenuItemsData } from "./hooks/useMenuItemsData";

/*
 * TODO: Update to add reloading of commands
 */
export default function Command() {
  const { loading, app, data } = useMenuItemsData()
  const { loadingMessage, loadingState } = useLoadingMessageQueue(loading, app)
  const loaded = data && data?.menus?.length && app?.name && !loading;

  return (
    <List
      isLoading={loading}
      navigationTitle={'Menu Navigator'}
    >
      {loading && (
        <List.Item
          title={loadingMessage}
          accessories={loadingState ? [{ tag: { value: `${loadingState}`, color: Color.SecondaryText } }] : undefined}
        />
      )}

      {loaded && (
        <ListItems app={app} data={data} />
      )}
    </List>
  );
}

interface ListItemsProps {
  app: Application;
  data: MenusConfig;
}

function ListItems({ app, data }: ListItemsProps) {
  return data?.menus?.map(i => (
    <List.Section title={i.menu} key={i.menu}>
      {i.items?.map(item => (
        <List.Item
          title={item.shortcut}
          accessories={[{ tag: `${item.modifier} ${item.key}` }]}
          key={`${item.menu}-${item.shortcut}`}
          actions={
            <ListItemActions app={app} item={item} />
          }
        />
      ))}
    </List.Section>
  ))
}

/*
 * Actions
 */
interface ListItemActionsProps {
  app: Application;
  item: MenuItem;
}

function ListItemActions({ app, item }: ListItemActionsProps) {
  return (
    <ActionPanel>
      <Action
        title="Execute command"
        onAction={async () => {
          if (!app?.name) return;
          await runShortcut(app.name, item.menu, item.shortcut)
          await closeMainWindow()
        }}
      />
      <Action
        title="Execute and keep Raycast focused"
        shortcut={{ modifiers: ["shift"], key: "enter" }}
        onAction={async () => {
          if (!app.name) return;
          await runShortcut(app.name, item.menu, item.shortcut)
        }}
      />
    </ActionPanel>
  )
}

