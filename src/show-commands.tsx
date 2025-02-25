import { List, Color, clearSearchBar } from "@raycast/api";
import { useEffect } from "react";
import { useLoadingMessageQueue, useMenuItemsDataLoader, useMenuItemFilters } from "./hooks";
import { ListItems, SectionDropdown } from "./ui";

export default function Command() {
  const { loading, app, data, refreshMenuItemsData } = useMenuItemsDataLoader();
  const { loadingMessage, loadingState } = useLoadingMessageQueue(loading, app);
  const { options, filter, setFilter, filteredData } = useMenuItemFilters(data);

  const dataLoaded = data?.menus && data.menus.length > 0;
  const filterDataLoaded = filteredData?.menus && filteredData.menus.length > 0;
  const loaded = (dataLoaded || filterDataLoaded) && app?.name && !loading;

  useEffect(() => {
    clearSearchBar();
    setFilter("all-commands");
  }, []);

  return (
    <List
      isLoading={loading}
      searchBarPlaceholder={`${loading ? 'Loading' : 'Search'} ${app?.name} commands...`}
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
      {loading ? (
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
