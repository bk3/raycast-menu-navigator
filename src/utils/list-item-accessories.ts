import { Icon } from "@raycast/api";
import { MenuItem } from "../types";

// Map of modifier key codes to their symbols
const MODIFIER_KEYCODES: Record<number, string> = {
  0: "⌘",
  1: "⇧ ⌘",
  2: "⌥ ⌘",
  3: "⌥ ⇧ ⌘",
  4: "⌃ ⌘",
  5: "⌃ ⇧ ⌘",
  6: "⌃ ⌥ ⌘",
  7: "⌃ ⌥ ⇧ ⌘",
  8: "⌥",
  9: "⇧ ⌥",
  12: "⌃",
  13: "⌃ ⇧",
  14: "⌃ ⌥",
  15: "⌃ ⌥ ⇧",
  24: "Fn",
  28: "Fn ⌃",
  32: "⇧"
};

const SHORTCUT_KEYCODES: Record<number | string, string> = {
  11: "⏎",   // Enter
  23: "⌫",   // Delete/Backspace
  27: "⎋",   // Escape
  71: "⌧",   // Clear
  100: "←",  // Left Arrow
  101: "→",  // Right Arrow
  104: "↑",  // Up Arrow
  106: "↓",  // Down Arrow
  114: "⌗",  // Number/Hash
  115: "↖",  // Home
  116: "⇞",  // Page Up
  117: "⌦",  // Forward Delete
  119: "↘",  // End
  121: "⇟",  // Page Down
  // 149: "globe",
  // 150: "microphone",
};

// Map special menu items to their SF Symbol icons
const SPECIAL_ICONS: Record<string, Icon> = {
  "Start Dictation…": Icon.Microphone,
  "Emoji & Symbols": Icon.Globe,
};

// Helper function to determine accessories
export function getListItemAccessories(item: MenuItem) {
  /*
  if (SPECIAL_ICONS[item.shortcut]) {
    return [{ icon: SPECIAL_ICONS[item.shortcut] }];
  }

  if (item.key !== "NIL" && item.modifier?.length) {
    return [{ text: `${item.modifier} ${item.key}` }];
  }
  */
  if (item.submenu?.length) {
    return [{ tag: "Menu" }];
  }

  return [{ text: `M:${item.modifier} | K:${item.key} | G:${item.glyph}` }]

  return undefined;
};


