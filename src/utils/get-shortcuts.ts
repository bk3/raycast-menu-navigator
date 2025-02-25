import { Application } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { parseAppleScriptResponse } from "./parser";
import { getFileNameForCache, readFileCache, writeFileCache } from "./files-cache";

/*
 * Get menu bar shortcuts for app from the local cache
 */
async function getMenuBarShortcutsCache(app: Application) {
  try {
    const data = await readFileCache(getFileNameForCache(app));
    return data;
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
    const response = await runAppleScript(getMenuBarItemsApplescript(), { timeout: 120000 });
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

const getMenuBarItemsApplescript = () => {
  return `
    -- Convert a list of records to a delimited string with section grouping
    on convertRecordsToString(recordsList)
        set resultString to ""
        set currentSection to ""
        
        repeat with recordItem in recordsList
            -- Extract values from the record
            set menuPath to menuPath of recordItem
            set shortcutName to shortcutName of recordItem
            set shortcutModifiers to shortcutModifiers of recordItem
            set shortcutKey to shortcutKey of recordItem
            set isSectionTitle to isSectionTitle of recordItem
            
            -- Handle section titles and their items
            if isSectionTitle is true then
                -- Start a new section
                set currentSection to shortcutName
                -- Add section marker
                set recordString to "|MN:MP:" & menuPath & ":SN:" & shortcutName & ":SM:" & shortcutModifiers & ":SK:" & shortcutKey & ":ST:" & isSectionTitle & ":SEC:" & currentSection
            else
                -- Regular item - include the current section it belongs to
                set recordString to "|MN:MP:" & menuPath & ":SN:" & shortcutName & ":SM:" & shortcutModifiers & ":SK:" & shortcutKey & ":ST:" & isSectionTitle & ":SEC:" & currentSection
            end if
            
            -- Append to result string
            if resultString is not "" then
                set resultString to resultString
            end if
            set resultString to resultString & recordString
        end repeat
        return resultString
    end convertRecordsToString

    -- Convert special glyphs to their symbol representations
    on convertGlyphToSymbol(shortcutKey, shortcutGlyph)
      if shortcutGlyph is not missing value then
        if shortcutGlyph is equal to 23 then
          return "⌫"
        else if shortcutGlyph is equal to 100 then
          return "←"
        else if shortcutGlyph is equal to 101 then
          return "→"
        else if shortcutGlyph is equal to 104 then
          return "↑"
        else if shortcutGlyph is equal to 106 then
          return "↓"
        else if shortcutKey is equal to tab then
          return "⇥"
        else if shortcutKey is equal to return then
          return "⏎"
        else if shortcutKey is equal to space then
          return "Space"
        end if
      end if
      return shortcutKey
    end convertGlyphToSymbol

    -- Check if a menu item name is valid
    on isValidMenuItemName(itemName)
      return (itemName is not "" and itemName is not missing value)
    end isValidMenuItemName

    on run
      set allShortcuts to {}
      
      tell application "System Events"
        set frontApp to first application process whose frontmost is true
        set appName to name of frontApp
        
        try
          set menuBar to menu bar 1 of frontApp
          
          repeat with menuBarItem in menu bar items of menuBar
            set menuName to name of menuBarItem
            
            try
              set menuItems to menu items of menu 1 of menuBarItem
              -- Process top-level menu items
              repeat with menuItem in menuItems
                try
                  set itemName to name of menuItem
                  if my isValidMenuItemName(itemName) then
                    set currentPath to menuName & ">" & itemName
                    
                    -- Check if item is a section title (integrated directly here)
                    set isTitle to false
                    try
                      set menuRole to value of attribute "AXRole" of menuItem
                      set menuSubrole to value of attribute "AXSubrole" of menuItem
                      set enabled to value of attribute "AXEnabled" of menuItem
                      
                      if menuRole is equal to "AXMenuItemTitle" or ¬
                        menuSubrole is equal to "AXHeaderItem" or ¬
                        itemName ends with ":" then
                        set isTitle to true
                      end if
                    end try
                    
                    -- Check if the menu item has a submenu
                    if exists menu 1 of menuItem then
                      -- Process submenu items
                      set subMenuItems to menu items of menu 1 of menuItem
                      repeat with subMenuItem in subMenuItems
                        try
                          set subItemName to name of subMenuItem
                          if my isValidMenuItemName(subItemName) then
                            set subPath to currentPath & ">" & subItemName
                            
                            -- Check if submenu item is a section title
                            set isSubTitle to false
                            try
                              set subMenuRole to value of attribute "AXRole" of subMenuItem
                              set subMenuSubrole to value of attribute "AXSubrole" of subMenuItem
                              set subEnabled to value of attribute "AXEnabled" of subMenuItem
                              
                              if subMenuRole is equal to "AXMenuItemTitle" or ¬
                                subMenuSubrole is equal to "AXHeaderItem" or ¬
                                subItemName ends with ":" then
                                set isSubTitle to true
                              end if
                            end try
                            
                            -- These AXMenuItem* commands must stay in the run handler
                            set shortcutKey to "NIL"
                            set shortcutModifiers to "NIL"
                            
                            try
                              set shortcutKey to value of attribute "AXMenuItemCmdChar" of subMenuItem
                              if shortcutKey is missing value then set shortcutKey to "NIL"
                              
                              set shortcutGlyph to value of attribute "AXMenuItemCmdGlyph" of subMenuItem
                              set shortcutKey to my convertGlyphToSymbol(shortcutKey, shortcutGlyph)
                              
                              if shortcutKey is not "NIL" then
                                set shortcutModifiers to value of attribute "AXMenuItemCmdModifiers" of subMenuItem
                                if shortcutModifiers is missing value then set shortcutModifiers to "NIL"
                              end if
                            end try
                            
                            set menuItemInfo to {menuPath:subPath, shortcutName:subItemName, shortcutModifiers:shortcutModifiers, shortcutKey:shortcutKey, isSectionTitle:isSubTitle}
                            set end of allShortcuts to menuItemInfo
                          end if
                        end try
                      end repeat
                    else
                      -- Process regular menu item (AXMenuItem* commands must stay here)
                      set shortcutKey to "NIL"
                      set shortcutModifiers to "NIL"
                      
                      try
                        set shortcutKey to value of attribute "AXMenuItemCmdChar" of menuItem
                        if shortcutKey is missing value then set shortcutKey to "NIL"
                        
                        set shortcutGlyph to value of attribute "AXMenuItemCmdGlyph" of menuItem
                        set shortcutKey to my convertGlyphToSymbol(shortcutKey, shortcutGlyph)
                        
                        if shortcutKey is not "NIL" then
                          set shortcutModifiers to value of attribute "AXMenuItemCmdModifiers" of menuItem
                          if shortcutModifiers is missing value then set shortcutModifiers to "NIL"
                        end if
                      end try
                      
                      set menuItemInfo to {menuPath:currentPath, shortcutName:itemName, shortcutModifiers:shortcutModifiers, shortcutKey:shortcutKey, isSectionTitle:isTitle}
                      set end of allShortcuts to menuItemInfo
                    end if
                  end if
                end try
              end repeat
            end try
          end repeat
        end try
      end tell
      
      return my convertRecordsToString(allShortcuts)
    end run
  `
}
