import { Application } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";

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
    throw new Error('Could not run shortcut')
  }
}
