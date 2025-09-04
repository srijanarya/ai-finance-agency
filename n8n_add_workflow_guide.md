# How to Add Workflow in n8n - Visual Guide

## Method 1: Direct Canvas Paste (EASIEST)

1. **Click anywhere on the empty canvas** (the dotted grid area)
2. **Press Cmd+V** to paste
   - The workflow should appear immediately

## Method 2: Using the Add Button

Look for one of these:
- **"+ New Workflow"** button (usually top-left or top-right)
- **"Create new workflow"** text
- **Empty workflow tab** with a "+"

## Method 3: Keyboard Shortcut

Try these shortcuts:
- **Cmd+Alt+N** - New workflow
- **Cmd+Shift+N** - New workflow
- **Cmd+K** then type "new workflow"

## Method 4: From Workflows List

1. Look for **"Workflows"** in the left sidebar
2. Click on it
3. Click **"Add Workflow"** or **"+"** button
4. The new empty workflow opens
5. Press **Cmd+V** to paste

## If Nothing Appears After Pasting:

1. **Zoom out** - Press **Cmd+-** (minus) several times
2. **Center view** - Press **Cmd+0** (zero)
3. **Fit to screen** - Look for fit/zoom buttons

## Alternative: Import from Menu

1. Look for **three dots menu** (⋮) or hamburger menu (☰)
2. Click **"Import from Clipboard"** or **"Import"**
3. Paste and confirm

## Still Not Working?

The workflow might be too complex. Try the simplified version:
1. Create new empty workflow first
2. Add just 2 nodes manually:
   - **Cron** node (trigger)
   - **HTTP Request** node
3. Connect them
4. Configure HTTP node:
   - URL: `http://localhost:5001/webhook/n8n/trigger`
   - Method: POST