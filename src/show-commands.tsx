import { List, Color, clearSearchBar } from "@raycast/api";
import { useEffect } from "react";
import { useLoadingMessageQueue, useMenuItemsDataLoader, useMenuItemFilters } from "./hooks";
import { ListItems, SectionDropdown, ErrorBoundary } from "./ui";

function MenuNavigator() {
  const { loading, app, data, totalMenuItems, refreshMenuItemsData } = useMenuItemsDataLoader();
  const { loadingMessage, loadingState } = useLoadingMessageQueue({ app, totalMenuItems });
  const { options, filter, setFilter, filteredData } = useMenuItemFilters(data);

  const dataLoaded = data?.menus && data.menus.length > 0;
  const filterDataLoaded = filteredData?.menus && filteredData.menus.length > 0;
  const loaded = (dataLoaded || filterDataLoaded) && app?.name && !loading;
  const name = app?.name ? `${app.name} ` : '';

  useEffect(() => {
    clearSearchBar();
    setFilter("all-commands");
  }, []);

  return (
    <List
      isLoading={loading}
      searchBarPlaceholder={`${loading ? 'Loading' : 'Search'} ${name}commands...`}
      searchBarAccessory={
        !loaded ? undefined : (
          <SectionDropdown
            sections={options}
            onSectionFilter={setFilter}
            defaultValue="all-commands"
          />
        )
      }
    >
      {loading && loadingMessage ? (
        <List.Item
          title={loadingMessage}
          accessories={
            !loadingState ? undefined : [{
              tag: {
                value: loadingState,
                color: Color.SecondaryText,
              },
            }]
          }
        />
      ) : loaded ? (
        <ListItems
          app={app}
          data={filter ? filteredData : data}
          refresh={refreshMenuItemsData}
        />
      ) : (
        <List.EmptyView
          icon="😔"
          title="Commands not found"
          description={`Unfortunately we couldn't retrieve any ${app?.name ? `${app.name} ` : ""}menu bar commands`}
        />
      )}
    </List>
  );
}

export default function Command() {
  return (
    <ErrorBoundary>
      <MenuNavigator />
    </ErrorBoundary>
  );
}
