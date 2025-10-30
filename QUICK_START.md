# ⚡ Quick Start Guide

Get your WhatsApp AI Assistant up and running in 5 minutes!

## Step 1: Install Dependencies (30 seconds)

```bash
cd "/Users/daviddandanell/Whtaapp - website"
npm install
```

## Step 2: Start the Server (10 seconds)

```bash
npm start
```

You should see:
```
🚀 WhatsApp AI Assistant Server Started
📍 Server running on: http://localhost:3000
📱 Webhook URL: http://localhost:3000/webhook/whatsapp
🔧 Admin Interface: http://localhost:3000
✅ Ready to receive messages!
```

## Step 3: Access Admin Panel (1 minute)

1. Open browser: `http://localhost:3000`
2. Login with:
   - Username: `admin`
   - Password: `change_this_secure_password`

## Step 4: Add Knowledge (2 minutes)

1. Click **"Knowledge Base"** in sidebar
2. Click **"➕ Add Knowledge"**
3. Add your first entry:
   ```
   Title: About Me
   Content: I am an AI assistant helping with [your purpose]
   Category: General
   Tags: intro, about
   ```
4. Click **"💾 Save"**

## Step 5: Configure Settings (1 minute)

1. Click **"Settings"** in sidebar
2. Enable **"Auto-Reply"** toggle
3. Set **Response Delay**: `3` seconds
4. Customize **System Prompt**:
   ```
   You are my personal AI assistant. Be helpful, concise, and professional.
   Use the knowledge base to answer questions accurately.
   ```
5. Click **"💾 Save Settings"**

## Step 6: Test Locally with ngrok (Optional - 2 minutes)

For local testing with real WhatsApp messages:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

## Step 7: Configure Webhook (1 minute)

1. Go to: https://wasenderapi.com/whatsapp/manage/27183
2. Find **Webhook Settings**
3. Set webhook URL to:
   - Local testing: `https://your-ngrok-url.ngrok.io/webhook/whatsapp`
   - Production: `https://your-domain.com/webhook/whatsapp`
4. Save

## Step 8: Test! (30 seconds)

Send a WhatsApp message to your connected number. The AI should respond!

Check the **Dashboard** or **Message History** to see the conversation.

---

## Common First-Time Issues

### "Cannot find module..."
```bash
npm install
```

### "Authentication required"
Check `.env` file exists with correct credentials.

### "Port 3000 already in use"
Change PORT in `.env` or stop other apps using port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### Messages not received
1. Ensure server is running
2. Check webhook URL is correct and publicly accessible
3. Verify in WasenderAPI dashboard

---

## Next Steps

✅ Add more knowledge entries for better responses  
✅ Customize AI behavior in Settings  
✅ Review message history to refine responses  
✅ Deploy to production (see DEPLOYMENT.md)  

**Ready to deploy?** See `DEPLOYMENT.md` for detailed instructions.

**Need help?** Check `README.md` for comprehensive documentation.

---

## Key Commands

```bash
# Start server
npm start

# Start with auto-restart (development)
npm run dev

# Check if server is running
curl http://localhost:3000/webhook/health

# View logs (if using PM2 in production)
pm2 logs whatsapp-assistant
```

## Quick Settings Reference

| Setting | Recommended Value | Purpose |
|---------|------------------|---------|
| Auto-Reply | On | Enable automatic responses |
| Response Delay | 2-5 seconds | Natural conversation feel |
| Active Hours | Business hours | When to respond |
| AI Temperature | 0.7 | Balance of creativity/consistency |

## Admin Panel Sections

- **📊 Dashboard**: Overview, stats, recent messages
- **📚 Knowledge Base**: Manage information for AI
- **⚙️ Settings**: Configure bot behavior
- **💬 Message History**: View all conversations

---

**That's it! Your WhatsApp AI Assistant is ready to use!** 🎉

For production deployment, security tips, and advanced configuration, see the full documentation in `README.md`.

