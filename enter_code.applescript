#!/usr/bin/osascript

# Wait for page to load and enter the code
delay 3

tell application "System Events"
    # Type the code
    keystroke "92F7-48CC"
    
    delay 1
    
    # Press Enter to submit
    keystroke return
end tell

return "Code entered"