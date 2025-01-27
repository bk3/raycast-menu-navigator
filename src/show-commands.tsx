import {
  List,
  ActionPanel,
  Action,
  closeMainWindow,
  Application,
  Color,
  clearSearchBar,
} from "@raycast/api";
import { useEffect } from "react";
import { runShortcut } from "./actions";
import { MenuItem, MenusConfig, SectionTypes } from "./types";
import { useLoadingMessageQueue, useMenuItemsData } from "./hooks";
import { useMenuItemFilters } from "./hooks/use-menu-item-filters";

export default function Command() {
  const { loading, app, data, refreshMenuItemsData } = useMenuItemsData();
  const { loadingMessage, loadingState } = useLoadingMessageQueue(loading, app);
  const { options, filter, setFilter, filteredData } = useMenuItemFilters(data);
  const dataLoaded = data && data?.menus?.length;
  const filterDataLoaded = filteredData && filteredData?.menus?.length;
  const loaded = (dataLoaded || filterDataLoaded) && app?.name && !loading;

  useEffect(() => {
    clearSearchBar();
    setFilter("all-commands");
  }, []);

  return (
    <List
      isLoading={loading}
      navigationTitle={
        !app?.name ? "Menu Navigator" : `Menu Navigator: ${app?.name}`
      }
      searchBarAccessory={
        loaded ? (
          <SectionDropdown
            sections={options}
            onSectionFilter={(f) => setFilter(f)}
            defaultValue="all-commands" // Add default value
          />
        ) : undefined
      }
    >
      {loading && (
        <List.Item
          title={loadingMessage}
          accessories={
            loadingState
              ? [
                {
                  tag: {
                    value: `${loadingState}`,
                    color: Color.SecondaryText,
                  },
                },
              ]
              : undefined
          }
        />
      )}

      {loaded && (
        <ListItems
          app={app}
          data={filter ? filteredData : data}
          refresh={refreshMenuItemsData}
        />
      )}

      {Boolean(!loading && !loaded) && (
        <List.EmptyView
          key="not-found"
          icon={"😔"}
          title="Commands not found"
          description={`Unfortunately we couldn't retrieve any ${app?.name ? app.name + " " : ""}menu bar commands`}
        />
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
  refresh: () => Promise<void>;
}

function ListItems({ app, data, refresh }: ListItemsProps) {
  if (!data || !data?.menus) return;
  return data?.menus?.map((i) => (
    <List.Section title={i.menu} key={`${app.name}-${i.menu}`}>
      {i.items?.map((item) => (
        <List.Item
          title={item.shortcut}
          accessories={
            item.key !== "NIL"
              ? [{ tag: `${item.modifier} ${item.key}` }]
              : undefined
          }
          key={`${app.name}-${item.menu}-${item.shortcut}`}
          actions={<ListItemActions app={app} item={item} refresh={refresh} />}
        />
      ))}
    </List.Section>
  ));
}

/*
 * Actions
 */
interface ListItemActionsProps {
  app: Application;
  item: MenuItem;
  refresh: () => Promise<void>;
}

function ListItemActions({ app, item, refresh }: ListItemActionsProps) {
  return (
    <ActionPanel>
      <Action
        title="Run Command"
        onAction={async () => {
          if (!app?.name) return;
          await runShortcut(app.name, item.menu, item.shortcut);
          await closeMainWindow();
        }}
      />
      <Action
        title="Run Command (background)"
        shortcut={{ modifiers: ["shift"], key: "enter" }}
        onAction={async () => {
          if (!app.name) return;
          await runShortcut(app.name, item.menu, item.shortcut);
        }}
      />
      <Action
        title="Refresh Commands"
        shortcut={{ modifiers: ["ctrl"], key: "enter" }}
        onAction={async () => {
          if (!app.name) return;
          await refresh();
        }}
      />
    </ActionPanel>
  );
}

/*
 * Dropdown filters
 */
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
        <List.Dropdown.Item title="All Commands" value="all-commands" />
        <List.Dropdown.Item
          title="Shortcut Commands"
          value="shortcut-commands"
        />
        <List.Dropdown.Item
          title="No Shortcut Commands"
          value="no-shortcut-commands"
        />
      </List.Dropdown.Section>

      <List.Dropdown.Section title="Menu Filters">
        {sections.map((s) => (
          <List.Dropdown.Item key={s.id} title={s.value} value={s.id} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
