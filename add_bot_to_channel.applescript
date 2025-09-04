#!/usr/bin/osascript

-- Add Telegram Bot to Channel Script
tell application "Telegram"
    activate
end tell

delay 1

tell application "System Events"
    tell process "Telegram"
        -- Search for the channel
        keystroke "k" using command down
        delay 0.5
        
        -- Type channel name
        keystroke "AI Finance News 2024"
        delay 1
        
        -- Press Enter to go to channel
        key code 36
        delay 1
        
        -- Open channel info (Command+I or click on channel name)
        keystroke "i" using command down
        delay 1
    end tell
end tell

-- Display instructions
display dialog "Now in Telegram:
1. You should see the channel info
2. Click on 'Administrators' or the person icon
3. Click 'Add Administrator'
4. In the search, try typing: AIFinanceAgencyBot
5. If still no results, we'll try another method" buttons {"OK"} default button 1