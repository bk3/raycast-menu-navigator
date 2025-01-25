import { List, ActionPanel, Action, closeMainWindow, Application, Color, clearSearchBar } from "@raycast/api";
import { useEffect, useState } from "react";
import { runShortcut } from "./actions";
import { MenuItem, MenusConfig } from "./types";
import { useLoadingMessageQueue, useMenuItemsData } from "./hooks";

/*
 * TODO: Update to add reloading of commands
 */
export default function Command() {
  const { loading, app, data } = useMenuItemsData()
  const { loadingMessage, loadingState } = useLoadingMessageQueue(loading, app)
  const { options, filter, setFilter, filteredData } = useMenuItemFilters(data)
  const dataLoaded = data && data?.menus?.length;
  const filterDataLoaded = filteredData && filteredData?.menus?.length
  const loaded = (dataLoaded || filterDataLoaded) && app?.name && !loading;

  // Reset search bar and filter when component mounts
  useEffect(() => {
    clearSearchBar();
    setFilter('all-commands'); // Reset to default filter
  }, []); // Empty dependency array means this runs once on mount

  return (
    <List
      isLoading={loading}
      navigationTitle={'Menu Navigator'}
      searchBarAccessory={(
        <SectionDropdown
          sections={options}
          onSectionFilter={(f) => setFilter(f)}
          defaultValue="all-commands" // Add default value
        />
      )}
    >
      {loading && (
        <List.Item
          title={loadingMessage}
          accessories={loadingState ? [{ tag: { value: `${loadingState}`, color: Color.SecondaryText } }] : undefined}
        />
      )}

      {loaded && (
        <ListItems app={app} data={filter ? filteredData : data} />
      )}
    </List>
  );
}

/*
 * List items config
 */
interface ListItemsProps {
  app: Application;
  data?: MenusConfig;
}

function ListItems({ app, data }: ListItemsProps) {
  if (!data || !data?.menus) return;
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

/*
 * Dropdown filters
 */
type SectionTypes = { id: string, value: string; };
function SectionDropdown(props: {
  sections: SectionTypes[];
  onSectionFilter: (val: string) => void;
  defaultValue: string;
}) {
  const { sections, onSectionFilter, defaultValue } = props;
  return (
    <List.Dropdown
      tooltip="Filters"
      storeValue={false}
      onChange={(newValue) => onSectionFilter(newValue)}
      defaultValue={defaultValue} // Add default value
    >
      <List.Dropdown.Section title="Command Filters">
        <List.Dropdown.Item title='All Commands' value='all-commands' />
        <List.Dropdown.Item title='Shortcut Commands' value='shortcut-commands' />
        <List.Dropdown.Item title='No Shortcut Commands' value='no-shortcut-commands' />
      </List.Dropdown.Section>

      <List.Dropdown.Section title="Menu Filters">
        {sections.map((s) => (
          <List.Dropdown.Item key={s.id} title={s.value} value={s.id} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

/*
 * Menu item filtering
 */
function useMenuItemFilters(data?: MenusConfig) {
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
          items: menuGroup.items.filter(item => item.shortcut?.length)
        })).filter(menuGroup => menuGroup.items.length > 0);
        break;
      case 'no-shortcut-commands':
        menus = data.menus.map(menuGroup => ({
          ...menuGroup,
          items: menuGroup.items.filter(item => !item.shortcut?.length)
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
