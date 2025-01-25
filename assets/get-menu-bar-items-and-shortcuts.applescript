use scripting additions

	
-- Function to convert records to string
on convertRecordsToString(recordsList)
    set resultString to ""
    repeat with recordItem in recordsList
        -- Extract values from the record
        set menuName to menuName of recordItem
        set shortcutName to shortcutName of recordItem
        set shortcutModifiers to shortcutModifiers of recordItem
        set shortcutKey to shortcutKey of recordItem
        
        -- Concatenate values into a string
        set recordString to "MNS:MNMN:" & menuName & ":MNSN:" & shortcutName & ":MNSM:" & shortcutModifiers & ":MNSK:" & shortcutKey
        
        -- Append to result string with a separator
        set resultString to resultString & recordString
    end repeat
    return resultString
end convertRecordsToString

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
					
					repeat with menuItem in menuItems
						try
							set shortcutName to name of menuItem
							if shortcutName is not "" and shortcutName is not missing value then
								set shortcutKey to ""
								
								try
									set shortcutKey to value of attribute "AXMenuItemCmdChar" of menuItem
									set shortcutGlyph to value of attribute "AXMenuItemCmdGlyph" of menuItem
									
									if shortcutKey is equal to tab then
										set shortcutKey to "Tab"
									end if
									
									if shortcutKey is equal to return then
										set shortcutKey to "Return"
									end if
									
									if shortcutKey is equal to space then
										set shortcutKey to "Space"
									end if
									
									if shortcutKey is not missing value then
										set shortcutModifiers to value of attribute "AXMenuItemCmdModifiers" of menuItem
										set menuItemInfo to {menuName:menuName, shortcutName:shortcutName, shortcutModifiers:shortcutModifiers, shortcutKey:shortcutKey}
										set end of allShortcuts to menuItemInfo
									end if
								on error errorMessage
								end try
								
							end if
						on error menuItemError
						end try
					end repeat
					
				on error menuError
				end try
			end repeat
			
		on error err
		end try
	end tell

-- Call the function and store the result
set shortcutsString to convertRecordsToString(allShortcuts)

-- Output the result
return shortcutsString

	
end run

