import { Application, environment } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { readFileSync } from "fs";
import { join } from "path";
import { parseAppleScriptResponse } from "./parser";
import { readFile, writeFile } from "./storage";

/*
 * Load applescript file for getting menu bar items and details
 */
const scriptPath = join(environment.assetsPath, "get-menu-bar-items-and-shortcuts.applescript");
const APPLESCRIPT = readFileSync(scriptPath, "utf8");

/*
 * Filename helper
 */
function getFileName(app: Application) {
  return `${app.name}__config`
}

/*
 * Retrieves locally stored shortcuts for given app
 */
export async function getMenuBarShortcutsCache(app: Application) {
  try {
    const cache = await readFile(getFileName(app))
    return cache;
  } catch (e) {
    console.log('Could not load local shortcuts')
    throw new Error('Could not load local shortcuts')
  }
}

/*
 * Runs an applescript to get all the menu bar items and details then returns a string to parse
 */
export async function getMenuBarShortcuts(app: Application) {
  try {
    const response = await runAppleScript(APPLESCRIPT, { timeout: 60000 });
    if (!response?.includes('MNS:')) {
      throw new Error('Invalid shortcuts response')
    }
    const parsed = parseAppleScriptResponse(app, response);
    await writeFile(getFileName(app), parsed)
    return parsed;
  } catch (e) {
    console.log('Could not load shortcuts error:', e)
    throw new Error('Could not load shortcuts')
  }
}

/*
 * Run specific shortcut from command
 */
export async function runShortcut(appName: Application['name'], menu: string, action: string) {
  try {
    const response = await runAppleScript(`
      set appName to "${appName}"
      set menuItemName to "${action}"

      -- Activate the application
      tell application appName
          activate
      end tell

      -- Use System Events to interact with the menu bar
      tell application "System Events"
          -- Access the process of the application
          tell process appName
              -- Navigate to the menu bar item
              try
                  click menu item menuItemName of menu of menu bar item "${menu}" of menu bar 1
              on error
              end try
          end tell
      end tell
    `)
    return response;
  } catch (e) {
    console.log('Could not run shortcut:', e)
    throw new Error('Could not run shortcut')
  }
}

/*
 * Handler for getting data from cache or running applescript to get it
 */
export async function loadInitialData(app: Application) {
  let data;
  try {
    data = await getMenuBarShortcutsCache(app)
    if (!data || !data?.menus?.length) {
      data = await getMenuBarShortcuts(app)
    }
  } catch (e) {
    data = await getMenuBarShortcuts(app)
  }

  // return data if it exists
  if (data && data?.menus?.length) {
    return data;
  } else {
    throw new Error('Shortcuts not found')
  }
}
