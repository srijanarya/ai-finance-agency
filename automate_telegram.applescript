#!/usr/bin/osascript

-- Automated Telegram Bot Addition Script
on run
    tell application "Telegram"
        activate
    end tell
    
    delay 2
    
    tell application "System Events"
        tell process "Telegram"
            set frontmost to true
            
            -- Open search with Cmd+K
            keystroke "k" using command down
            delay 1
            
            -- Search for the bot first
            keystroke "@AIFinanceAgencyBot"
            delay 2
            
            -- Press Enter to open bot chat
            key code 36 -- Enter key
            delay 2
            
            -- Send /start to activate the bot
            keystroke "/start"
            delay 0.5
            key code 36 -- Enter key
            delay 2
            
            -- Now search for the channel
            keystroke "k" using command down
            delay 1
            
            -- Type channel name
            keystroke "@AIFinanceNews2024"
            delay 2
            
            -- Press Enter to open channel
            key code 36 -- Enter key
            delay 2
            
            -- Open channel info with Cmd+I
            keystroke "i" using command down
            delay 2
            
            -- Navigate to Administrators section
            -- Use Tab to navigate through options
            repeat 5 times
                key code 48 -- Tab key
                delay 0.5
            end repeat
            
            -- Look for Add Administrator button and click
            try
                click button "Add Administrator" of window 1
                delay 2
                
                -- Type bot username
                keystroke "AIFinanceAgencyBot"
                delay 2
                
                -- Select the bot if it appears
                key code 36 -- Enter
                delay 1
                
                -- Enable permissions (space bar to check)
                key code 49 -- Space bar for checkbox
                delay 0.5
                
                -- Confirm
                key code 36 -- Enter
                
                return "Bot addition attempted"
            on error
                return "Could not find Add Administrator button"
            end try
        end tell
    end tell
end run