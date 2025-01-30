# Menu Navigator

- Allows you to run menu item commands from the Raycast menu.
- Includes the added bonus of displaying the keyboard shortcuts as well.

## Notes

- Initial processing of app menu items generally takes 10-20 seconds per app.
  - We cache these items to speed up interactions after initial load.
- To refresh data, please run `Refresh Menu Items` from the Actions Menu.
- Tested against many apps and most work as expected. Some (like Cursor) do not play well with the Applescript function to run the shortcut
- _Shortcut Note:_ If Raycast is focused, it can conflict with the keyboard shortcuts.
  - _Example:_ Settings `⌘ ,` shortcut will open Raycast's settings, not Apple Notes.
