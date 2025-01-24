/*
const KEYS = {
  KCSCS: 'Keycuts Shortcuts Start',
  KCMN: 'Keycuts Menu Name',
  KCSN: 'Keycuts Shortcut Name',
  KCSM: 'Keycuts Shortcut Modifier',
  KCSK: 'Keycuts Shortcut Key',
}
*/

export interface MenuItem {
  menu: string;
  shortcut: string;
  modifier: string;
  key: string;
}

export interface MenuGroup {
  menu: string;
  items: MenuItem[];
}

function groupByMenu(items: MenuItem[]): MenuGroup[] {
  return items.reduce((groups: MenuGroup[], item: MenuItem) => {
    const existingGroup = groups.find(group => group.menu === item.menu);

    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      groups.push({
        menu: item.menu,
        items: [item]
      });
    }

    return groups;
  }, []);
}


const KEYCODES: { [key: number]: string } = {
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

export function parseAppleScriptResponse(response: string) {
  const root = response.split('KCSCS:');

  // remove empty first string
  root.shift();

  // extract values from string
  const items = root.map(i => {
    const menu = i.split('KCMN:')[1].split(':KCSN')[0]
    const shortcut = i.split('KCSN:')[1].split(':KCSM')[0]
    const modifierKeyCode = Number(i.split('KCSM:')[1].split(':KCSK')[0])
    const modifier = KEYCODES[modifierKeyCode] || '';
    const key = i.split('KCSK:')[1]
    return { menu, shortcut, modifier, key }
  })

  // organize into groups
  return groupByMenu(items)
}
