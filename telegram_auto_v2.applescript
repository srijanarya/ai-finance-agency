#!/usr/bin/osascript

-- Telegram Automation v2 - Add Bot to Channel
tell application "Telegram"
    activate
end tell

delay 2

tell application "System Events"
    tell process "Telegram"
        set frontmost to true
        
        -- First, let's start the bot
        keystroke "k" using command down
        delay 1
        keystroke "AIFinanceAgencyBot"
        delay 2
        key code 36 -- Enter
        delay 2
        
        -- Send /start to bot
        keystroke "/start"
        key code 36 -- Enter
        delay 2
        
        -- Now let's try adding via bot menu
        -- Right-click or control-click for context menu
        keystroke "AIFinanceAgencyBot" using control down
        delay 1
        
        -- Try to find "Add to Channel" in menu
        try
            click menu item "Add to Group or Channel" of menu 1
            delay 1
            
            -- Select the channel
            keystroke "AI Finance News 2024"
            delay 1
            key code 36 -- Enter
            
        on error
            -- Alternative: Use bot's menu button
            -- Click the three dots menu in bot chat
            click button 1 of group 1 of window 1
            delay 1
            
            -- Look for add to channel option
            click menu item 1 of menu 1
        end try
    end tell
end tell

display notification "Bot addition process completed. Please check your channel." with title "Telegram Automation"