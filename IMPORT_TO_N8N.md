# 🚀 Quick Import Instructions for n8n

## Method 1: Direct Copy-Paste (EASIEST)

1. **Open n8n**: http://localhost:5678

2. **Create New Workflow**: 
   - Click "Add Workflow" or "+"

3. **Import via JSON**:
   - Press `Ctrl+A` (or `Cmd+A` on Mac) to select all
   - Press `Delete` to clear
   - Press `Ctrl+V` (or `Cmd+V`) to paste this:

4. **Copy the ENTIRE content from this file**:
   `/Users/srijan/ai-finance-agency/n8n_workflows/ai_finance_content_agency.json`

5. **Paste it directly into the workflow canvas**

## Method 2: File Import

1. In n8n, click the **3-dot menu** (⋮) 
2. Select **"Import from File"**
3. Browse to: `/Users/srijan/ai-finance-agency/n8n_workflows/`
4. Select: `ai_finance_content_agency.json`

## Method 3: Simplified Webhook Trigger

If the full workflow is too complex, start with this simple version:

1. Create a new workflow
2. Add **Cron** node (trigger every 30 min)
3. Add **HTTP Request** node
4. Configure HTTP node:
   - URL: `http://localhost:5000/webhook/n8n/trigger`
   - Method: POST
   - Body:
   ```json
   {
     "content_type": "blog",
     "topic": "Market Analysis",
     "platforms": ["telegram"]
   }
   ```

## 🔧 After Import

1. **Start the webhook server** (new terminal):
   ```bash
   python n8n_webhook_endpoint.py
   ```

2. **Test the integration**:
   ```bash
   python test_n8n_integration.py
   ```

3. **Start the orchestrator** (another terminal):
   ```bash
   python multi_agent_orchestrator.py
   ```

## 📝 Quick Test

Once everything is running:

1. In n8n, click **"Execute Workflow"**
2. Check the webhook server terminal for activity
3. Content will be generated and posted to Telegram

## ⚠️ Troubleshooting

If credentials error appears:
- You can skip API credentials for now
- The webhook integration with Python orchestrator will still work
- Your Telegram bot is already configured in Python

## 🎯 Success Indicators

✅ Workflow imported and visible in n8n
✅ Webhook server running (port 5000)
✅ Orchestrator ready
✅ Test produces content in ~2 seconds

---

**File to import**: `/Users/srijan/ai-finance-agency/n8n_workflows/ai_finance_content_agency.json`
**Webhook server**: `python n8n_webhook_endpoint.py`
**Test script**: `python test_n8n_integration.py`