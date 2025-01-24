import { Application, LocalStorage, environment } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { readFileSync } from "fs";
import { join } from "path";
import { parseAppleScriptResponse } from "./parser";

const scriptPath = join(environment.assetsPath, "get-shortcuts.applescript");
const APPLESCRIPT = readFileSync(scriptPath, "utf8");

export async function getLocalShortcuts(app: Application) {
  try {
    const cache = await LocalStorage.getItem(app.name)
    if (typeof cache !== 'string' || !cache?.length) {
      return false;
    }
    return parseAppleScriptResponse(cache);
  } catch (e) {
    throw new Error('Could not load local shortcuts')
  }
}

export async function getShortcuts(app: Application) {
  try {
    const response = await runAppleScript(APPLESCRIPT, { timeout: 60000 });
    if (!response?.includes('KCSCS:')) {
      throw new Error('Invalid shortcuts response')
    }
    LocalStorage.setItem(app.name, response)
    return parseAppleScriptResponse(response);
  } catch (e) {
    console.log('Could not load shortcuts error:', e)
    throw new Error('Could not load shortcuts')
  }
}

export async function runShortcut(appName: Application['name'], menu: string, action: string) {
  try {
    const response = await runAppleScript(`
      -- Define the application and the menu item you want to click
      set appName to "${appName}" -- Replace with the name of the application
      set menuItemName to "${action}" -- Replace with the name of the menu item you want to trigger

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
    console.log({ response })
    return response;
  } catch (e) {
    console.log('Could not run shortcut:', e)
    throw new Error('Could not run shortcut')
  }
}
