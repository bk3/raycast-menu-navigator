import { Application, environment } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import fs from "node:fs";
import { join } from "path";
import { parseAppleScriptResponse } from "./parser";
import { getFileNameForCache, readFileCache, writeFileCache } from "./files";

/*
 * Load applescript file for getting menu bar items
 */
const getMenuBarItemsApplescript = fs.readFileSync(
  join(
    environment.assetsPath,
    "get-menu-bar-data.applescript",
  ),
  "utf8"
);

/*
 * Get menu bar shortcuts for app from the local cache
 */
async function getMenuBarShortcutsCache(app: Application) {
  try {
    return await readFileCache(getFileNameForCache(app));
  } catch {
    throw new Error("Could not load local shortcuts");
  }
};

/*
 * Get menu bar shortcuts for app using AppleScript
 * Retrieves shortcuts from AppleScript, parses them and saves to local cache
 */
export async function getMenuBarShortcutsApplescript(app: Application) {
  try {
    const response = await runAppleScript(getMenuBarItemsApplescript, { timeout: 120000 });
    if (!response?.includes("|MN:")) {
      throw new Error("Invalid shortcuts response");
    }
    const parsed = parseAppleScriptResponse(app, response);
    await writeFileCache(getFileNameForCache(app), parsed);
    return parsed;
  } catch {
    throw new Error("Could not load shortcuts");
  }
};

/*
 * Load application menu bar shortcuts
 * Attempts to load from cache and falls back to using AppleScript if it doesn't exist
 */
export async function getMenuBarShortcuts(app: Application) {
  try {
    const cached = await getMenuBarShortcutsCache(app);
    if (!!cached?.menus?.length) return cached;
  } catch {
    // Fall through to fetch fresh data
  }

  const data = await getMenuBarShortcutsApplescript(app);
  if (!data?.menus?.length) throw new Error("Shortcuts not found");
  return data;
};
