import { Application } from "@raycast/api";

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

export interface MenusConfig {
  app: Application;
  menus: MenuGroup[];
  timestamp: string;
}

export interface SectionTypes {
  id: string,
  value: string;
}
