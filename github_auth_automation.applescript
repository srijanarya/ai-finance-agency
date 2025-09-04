#!/usr/bin/osascript

# Open GitHub device login page and enter the code
tell application "Safari"
    activate
    
    # Open the GitHub device login page
    open location "https://github.com/login/device"
    
    delay 3
    
    # Wait for page to load
    tell window 1
        repeat until (do JavaScript "document.readyState" in current tab) is "complete"
            delay 0.5
        end repeat
    end tell
    
    # Enter the code
    tell window 1
        # Input the device code
        do JavaScript "
            // Find the input field for the code
            var codeInput = document.querySelector('input[type=\"text\"]') || document.querySelector('input[name=\"user_code\"]') || document.querySelector('input');
            if (codeInput) {
                codeInput.value = '92F7-48CC';
                codeInput.dispatchEvent(new Event('input', { bubbles: true }));
                codeInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Try to find and click the continue button
                setTimeout(function() {
                    var submitButton = document.querySelector('button[type=\"submit\"]') || document.querySelector('button');
                    if (submitButton) {
                        submitButton.click();
                    }
                }, 500);
            }
        " in current tab
    end tell
    
    delay 2
    
    # Display message for user
    display dialog "Please click 'Authorize GitHub CLI' when the page loads. Click OK here after you've authorized." buttons {"OK"} default button 1
end tell

# Return success
return "GitHub authorization page opened with code entered"