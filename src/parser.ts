import { Application } from "@raycast/api";
import { MenuGroup, MenuItem } from "./types";

/*
 * Modifier keycode mappings
 */
const MODIFIER_KEYCODES: { [key: number]: string } = {
  0: '⌘',
  1: '⇧ ⌘',
  2: '⌥ ⌘',
  3: '⌥ ⇧ ⌘',
  4: '⌃ ⌘',
  5: '⌃ ⇧ ⌘',
  6: '⌃ ⌥ ⌘',
  7: '⌃ ⌥ ⇧ ⌘',
  12: '⌃',
  13: '⌃ ⇧',
  14: '⌃ ⌥',
  24: 'fn',
  28: '⌃ fn',
}

/*
 * Group menu bar items by menu group (e.g. Edit, View, etc)
 */
function groupMenuBarItems(items: MenuItem[]): MenuGroup[] {
  return items.reduce((groups: MenuGroup[], item: MenuItem) => {
    const existingGroup = groups.find(group => group.menu === item.menu);

    if (existingGroup) {
      // Check if an identical item already exists in the group
      const isDuplicate = existingGroup.items.some(existingItem =>
        existingItem.shortcut === item.shortcut &&
        existingItem.modifier === item.modifier &&
        existingItem.key === item.key
      );

      // Only add the item if it's not a duplicate
      if (!isDuplicate) {
        existingGroup.items.push(item);
      }
    } else {
      groups.push({
        menu: item.menu,
        items: [item]
      });
    }

    return groups;
  }, []);
}

/*
 * Split keys from string to retrieve value
 */
function splitKeysForValue(item: string, start: string, end?: string) {
  let menu = item.split(start)[1]
  if (!end) return menu;
  menu = menu.split(end)[0]
  return menu;
}

/*
 * Extract menu bar item data and format into JSON
 */
export function parseAppleScriptResponse(app: Application, response: string) {
  const menuBarItems = response.split('MNS:');

  // remove empty first string after split
  menuBarItems.shift();

  // extract values from string
  const items = menuBarItems.map(i => {
    const menu = splitKeysForValue(i, 'MNMN:', ':MNSN')
    const shortcut = splitKeysForValue(i, 'MNSN:', ':MNSM')
    const modifierKeyCode = Number(splitKeysForValue(i, 'MNSM:', ':MNSK'))
    const modifier = MODIFIER_KEYCODES[modifierKeyCode] || '';
    const key = splitKeysForValue(i, 'MNSK:')
    return { menu, shortcut, modifier, key }
  })

  // organize into groups
  const grouped = groupMenuBarItems(items)
  const menus = [...grouped.slice(2), ...grouped.slice(1, 2), ...grouped.slice(0, 1)]
  const timestamp = new Date().toISOString()

  return {
    app,
    menus,
    timestamp
  }
}

