import { List, showHUD, getFrontmostApplication, ActionPanel, Action, closeMainWindow } from "@raycast/api";
import { useEffect, useState } from "react";
import { getLocalShortcuts, getShortcuts, runShortcut } from "./data";
import { MenuGroup } from "./parser";

/*
 * TODO: Update to add updating / refreshing of commands
 */
export default function Command() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MenuGroup[]>([])
  const [appName, setAppName] = useState<string>()

  async function loadData() {
    try {
      setLoading(true)

      // get app
      const app = await getFrontmostApplication();
      if (!app.name) {
        throw new Error('Focused application window not found')
      }
      setAppName(app.name)

      // load data
      let data //= await getLocalShortcuts(app)
      if (!data || !data?.length) {
        data = await getShortcuts(app)
      }

      // set data if it exists
      if (data && data?.length) {
        setData(data)
      } else {
        throw new Error('Shortcuts not found')
      }
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

  return (
    <List isLoading={loading} navigationTitle={loading ? 'Loading...' : appName || 'Keycuts'}>
      {data?.map(i => (
        <List.Section title={i.menu} key={i.menu}>
          {i.items?.map(item => (
            <List.Item
              title={item.shortcut}
              accessories={[{ tag: `${item.modifier} ${item.key}` }]}
              key={`${item.menu}-${item.shortcut}`}
              actions={
                <ActionPanel>
                  <Action
                    title="Execute command"
                    onAction={async () => {
                      if (!appName) return;
                      await runShortcut(appName, item.menu, item.shortcut)
                      await closeMainWindow()
                    }}
                  />
                  <Action
                    title="Execute and keep Raycast focused"
                    shortcut={{ modifiers: ["shift"], key: "enter" }}
                    onAction={async () => {
                      if (!appName) return;
                      await runShortcut(appName, item.menu, item.shortcut)
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
