import { Application } from "@raycast/api";
import { MenuGroup, MenuItem } from "../types";

interface ParsedMenuItem extends MenuItem {
  isSectionTitle: boolean;
  section: string;
}

/*
 * Groups menu bar items into a hierarchical structure by menu group (e.g. Edit, View, etc)
 */
function groupMenuBarItems(items: ParsedMenuItem[]): MenuGroup[] {
  const itemsByPath = new Map<string, MenuItem>();

  // Create menu item hierarchy
  for (const item of items) {
    const newItem = { ...item, submenu: [] };
    itemsByPath.set(item.path, newItem);

    const pathParts = item.path.split(">");
    if (pathParts.length <= 2) continue;

    // Create parent menu items if they don't exist
    const parentPath = pathParts.slice(0, -1).join(">");
    if (!itemsByPath.has(parentPath)) {
      const parentMenu = pathParts[pathParts.length - 2];
      const parentItem: MenuItem = {
        path: parentPath,
        menu: parentMenu,
        shortcut: parentMenu,
        modifier: null,
        key: null,
        glyph: null,
        submenu: [],
      };
      itemsByPath.set(parentPath, parentItem);
    }
  }

  const groups: MenuGroup[] = [];

  // Process items in order of path length to handle parents before children
  const sortedItems = Array.from(itemsByPath.values()).sort(
    (a, b) => a.path.split(">").length - b.path.split(">").length,
  );

  for (const item of sortedItems) {
    const pathParts = item.path.split(">");
    const topLevelMenu = pathParts[0];

    // Find or create top-level menu group
    let group = groups.find((g) => g.menu === topLevelMenu);
    if (!group) {
      group = { menu: topLevelMenu, items: [] };
      groups.push(group);
    }

    const isDuplicate = (items: MenuItem[], item: MenuItem) =>
      items.some(
        (existing) =>
          existing.shortcut === item.shortcut &&
          existing.modifier === item.modifier &&
          existing.key === item.key,
      );

    if (pathParts.length === 2) {
      // Direct child of top-level menu
      if (!isDuplicate(group.items, item)) {
        group.items.push(item);
      }
    } else if (pathParts.length > 2) {
      const parentPath = pathParts.slice(0, -1).join(">");
      const parentItem = itemsByPath.get(parentPath);

      if (parentItem) {
        // Add item to parent's submenu if not duplicate
        if (!isDuplicate(parentItem.submenu || [], item)) {
          parentItem.submenu = parentItem.submenu || [];
          parentItem.submenu.push(item);
        }

        // Add parent to top-level group if direct child and not duplicate
        if (
          parentPath.split(">").length === 2 &&
          !isDuplicate(group.items, parentItem)
        ) {
          group.items.push(parentItem);
        }
      }
    }
  }

  return groups;
}

/*
 * Extracts a value from a string between start and optional end delimiters
 */
function extract(text: string, start: string, end?: string): string {
  const [, value] = text.split(start);
  return end ? value.split(end)[0].trim() : value.trim();
}

/*
 * Handle "null" values from applescript
 */
function handleNull(val: string): string | null {
  if (val === 'null') return null;
  return val;
}

function convertToNumber(val: string | null): number | null {
  if (!val) return null;
  const num = Number(val)
  if (isNaN(num)) return null;
  return num;
}

/*
 * Parses the AppleScript response and returns formatted menu data
 */
export function parseAppleScriptResponse(app: Application, response: string) {
  const menuBarItems = response.split("|MN:").slice(1);

  const items = menuBarItems.map((item) => {
    const path = extract(item, "MP:", ":SN");
    const menus = path.split(">");
    const menu = menus[menus.length - 2];

    return {
      path,
      menu,
      shortcut: extract(item, "SN:", ":SM"),
      key: handleNull(extract(item, "SK:", ":SG")),
      modifier: convertToNumber(handleNull(extract(item, "SM:", ":SK"))),
      glyph: convertToNumber(handleNull(extract(item, "SG:", ":ST"))),
      isSectionTitle: extract(item, "ST:", ":SEC") === "true",
      section: extract(item, ":SEC:"),
    };
  });

  // Reorder menu groups
  const grouped = groupMenuBarItems(items);
  const menus = [
    ...grouped.slice(2), // Main groups
    ...grouped.slice(1, 2), // Middle group
    ...grouped.slice(0, 1), // First group
  ];

  return {
    app,
    menus,
    timestamp: new Date().toISOString(),
  };
}
