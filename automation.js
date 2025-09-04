// Paste this in browser console (F12)
const message = `🔥 Just discovered this amazing finance channel!

@AIFinanceNews2024

🛡️ They have CREDIBILITY PROTECTION:
✅ Every data verified within 30 minutes
✅ Multi-source validation (NSE, BSE, Yahoo)  
✅ Never posts stale/old market data
✅ 8.8/10 quality score average

🚀 8 AI agents working 24/7 for accuracy!

No fake tips, only verified data + education 📚`;

const comments = ["Found this really helpful!", "Finally, verified data! 🎯", "Love the credibility system!"];
let idx = 0;

function send(text) {
    const input = document.querySelector('div[contenteditable="true"], .input-message-input');
    if (input) {
        input.focus();
        input.textContent = text;
        setTimeout(() => {
            input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', keyCode: 13, bubbles: true}));
        }, 500);
        return true;
    }
    return false;
}

if (send(message)) {
    console.log("✅ Message sent");
    setTimeout(() => {
        if (send(comments[idx % 3])) {
            console.log("✅ Comment sent");
            idx++;
        }
    }, 3000);
}