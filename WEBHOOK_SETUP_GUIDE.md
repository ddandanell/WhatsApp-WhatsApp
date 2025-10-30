# 🪝 Webhook Setup Guide - WasenderAPI

**Quick guide to configure webhooks for receiving WhatsApp messages**

---

## 🎯 Why Webhooks Are Important

Webhooks allow your server to receive **real-time notifications** when:
- ✅ Someone sends you a WhatsApp message
- ✅ Message delivery status changes
- ✅ Session connection status changes

**Without webhooks configured, your AI assistant cannot receive incoming messages!**

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Webhook URL

#### Option A: Production (Deployed Server)
```
https://your-domain.com/webhook/whatsapp
```
Replace `your-domain.com` with your actual domain.

#### Option B: Local Development (Using ngrok)
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok (your server should already be running on port 3000)
ngrok http 3000

# You'll see output like:
# Forwarding  https://abc123def456.ngrok.io -> http://localhost:3000
```

Your webhook URL will be:
```
https://abc123def456.ngrok.io/webhook/whatsapp
```

### Step 2: Configure in WasenderAPI Dashboard

1. **Go to your session**: https://wasenderapi.com/whatsapp/manage/27183

2. **Click on "Webhooks" or "Settings"**

3. **Enter your Webhook URL**: 
   ```
   https://your-url-here/webhook/whatsapp
   ```

4. **Select these events**:
   - ✅ `messages.received` - For incoming messages only
   - ✅ `messages.upsert` - For all messages (recommended)
   - ✅ `message.status` - For delivery status updates
   - ✅ `session.status` - For connection status

5. **Click "Save" or "Update"**

### Step 3: Test Your Webhook

#### Method 1: Send a Real WhatsApp Message
1. From your phone, send a WhatsApp message to your connected number
2. Check your server logs for: `📨 Webhook received:`
3. Your AI should auto-reply (if number is whitelisted)

#### Method 2: Manual Test with curl
```bash
curl -X POST http://localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.received",
    "data": {
      "messages": [{
        "from": "628112656869@s.whatsapp.net",
        "message": {
          "conversation": "Hello, this is a test!"
        },
        "key": {
          "fromMe": false
        }
      }]
    }
  }'
```

---

## 🔍 How to Verify Webhooks Are Working

### 1. Check Server Logs

When a message arrives, you should see:
```
📨 Webhook received: {
  "event": "messages.received",
  "data": { ... }
}
📥 Processing incoming message from 628112656869
```

### 2. Check Dashboard

Your admin dashboard at http://localhost:3000 should show:
- New message in "Message History"
- New conversation in "Inbox"
- AI response sent (if auto-reply enabled)

### 3. Check WasenderAPI Dashboard

Go to your session logs in the WasenderAPI dashboard. You should see:
- Webhook delivery attempts
- Success/failure status
- Response codes (should be 200)

---

## 🐛 Troubleshooting

### ❌ "Webhooks Not Receiving Messages"

**Check 1: Is your server publicly accessible?**
```bash
# Test from another device or online tool
curl https://your-webhook-url/webhook/health

# Should return: { "status": "ok", "timestamp": "..." }
```

**Check 2: Is the webhook URL correct?**
- Must be `https://` (not `http://`) for production
- Must end with `/webhook/whatsapp`
- No typos in the URL

**Check 3: Are events selected in dashboard?**
- Go to WasenderAPI dashboard
- Verify `messages.received` or `messages.upsert` is checked
- Save settings again

**Check 4: Is your server running?**
```bash
# Check server status
curl http://localhost:3000/webhook/health
```

### ❌ "Getting 404 Error"

Your webhook endpoint is not accessible.

**Solution**:
```bash
# Verify server is running
cd "/Users/daviddandanell/Whtaapp - website"
npm start

# Check if webhook endpoint exists
curl -X POST http://localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Should return: { "status": "received" } or similar
```

### ❌ "Using ngrok But Still Not Working"

**Common ngrok issues**:

1. **ngrok session expired**
   ```bash
   # Restart ngrok
   pkill ngrok
   ngrok http 3000
   # Update webhook URL in WasenderAPI dashboard
   ```

2. **Free ngrok URL changes every restart**
   - You must update the webhook URL in WasenderAPI dashboard each time
   - Consider upgrading to ngrok paid plan for a fixed URL
   - Or deploy to production with a permanent domain

3. **ngrok not forwarding**
   ```bash
   # Check ngrok web interface
   open http://localhost:4040
   # Shows all requests to your ngrok URL
   ```

### ❌ "Receiving Webhooks But Not Processing"

**Check message processor**:

1. Check server logs for errors:
   ```
   ❌ Error processing message: ...
   ```

2. Verify database is accessible:
   ```bash
   ls -la data/assistant.db
   ```

3. Check if auto-reply is enabled:
   - Go to Settings in dashboard
   - Verify "Auto Reply" is ON
   - Check "Active Hours" settings

4. Check if number is whitelisted:
   - Go to Whitelist in dashboard
   - Add the test number if not already there

---

## 📱 Testing Complete Flow

### Full End-to-End Test

1. **Whitelist a test number**:
   ```
   Dashboard → Whitelist → Add Number
   Number: +628112656869
   Name: Test Number
   ```

2. **Enable auto-reply**:
   ```
   Dashboard → Settings
   Auto Reply: ON
   Reply Delay: 2 seconds
   ```

3. **Send a test message** from WhatsApp:
   ```
   "Hey, how are you?"
   ```

4. **Expected flow**:
   ```
   ✅ Server receives webhook
   ✅ Checks whitelist (approved)
   ✅ Fetches knowledge base
   ✅ Generates AI response (Grok)
   ✅ Sends reply via WasenderAPI
   ✅ Logs in message history
   ```

5. **Verify**:
   - Check WhatsApp for AI reply
   - Check Dashboard → Inbox for conversation
   - Check Dashboard → Messages for both messages

---

## 🌐 Production Deployment Webhook Setup

### Using a Real Domain

1. **Deploy your server** to a hosting provider:
   - Heroku, DigitalOcean, AWS, etc.
   - Ensure it has a public URL with SSL (https)

2. **Get your server URL**:
   ```
   https://your-app-name.herokuapp.com
   ```

3. **Configure webhook**:
   ```
   https://your-app-name.herokuapp.com/webhook/whatsapp
   ```

4. **Advantages**:
   - ✅ Permanent URL (no need to update)
   - ✅ SSL certificate (required by most APIs)
   - ✅ Always accessible
   - ✅ Professional setup

### Environment Variables for Production

Make sure your production server has these `.env` variables:
```env
WASENDER_API_KEY=your_wasender_api_key_here
WASENDER_API_URL=https://wasenderapi.com/api
GROK_API_KEY=your_xai_grok_api_key_here
GROK_API_URL=https://api.x.ai/v1
PORT=3000
```

---

## 📊 Webhook Payload Examples

### Incoming Text Message
```json
{
  "event": "messages.received",
  "data": {
    "messages": [{
      "from": "628112656869@s.whatsapp.net",
      "message": {
        "conversation": "Hello, how are you?"
      },
      "key": {
        "remoteJid": "628112656869@s.whatsapp.net",
        "fromMe": false,
        "id": "ABC123XYZ"
      },
      "messageTimestamp": "1698765432"
    }]
  }
}
```

### Message Status Update
```json
{
  "event": "message.status",
  "data": {
    "jid": "628112656869@s.whatsapp.net",
    "status": "read",
    "messageId": "ABC123XYZ"
  }
}
```

### Session Status Change
```json
{
  "event": "session.status",
  "data": {
    "status": "connected"
  }
}
```

---

## 🔐 Security Best Practices

### 1. Verify Webhook Source (Optional but Recommended)

Add IP whitelist or signature verification:
```javascript
// In webhook.js
router.post('/whatsapp', (req, res, next) => {
  // Verify request is from WasenderAPI
  const allowedIPs = ['IP_FROM_WASENDER'];
  const clientIP = req.ip;
  
  // Or verify webhook signature (if WasenderAPI provides one)
  const signature = req.headers['x-webhook-signature'];
  
  next();
});
```

### 2. Rate Limiting

Already implemented in your server:
```javascript
// Webhook rate limiter: 100 requests per 15 minutes
```

### 3. Validate Payload

Your webhook already validates:
- ✅ Phone number exists
- ✅ Message text exists
- ✅ Message is not from us (fromMe: false)

---

## ✅ Webhook Configuration Checklist

Before going live, verify:

- [ ] Server is running and accessible
- [ ] Webhook URL is publicly accessible (test with curl)
- [ ] SSL certificate is valid (https://)
- [ ] Webhook URL configured in WasenderAPI dashboard
- [ ] Events selected: messages.received, messages.upsert
- [ ] Webhook returns 200 status code
- [ ] Test message sent and received
- [ ] AI auto-reply working
- [ ] Messages logged in dashboard
- [ ] Error handling tested

---

## 🎉 Success Indicators

You'll know webhooks are working when:

✅ Server logs show: `📨 Webhook received`  
✅ Dashboard shows new messages in real-time  
✅ AI replies automatically to whitelisted numbers  
✅ Conversations appear in Inbox  
✅ Message history updates instantly  

---

## 📞 Need Help?

If webhooks still aren't working after following this guide:

1. **Check server logs** for error messages
2. **Check WasenderAPI dashboard** for webhook delivery status
3. **Use ngrok** web interface (http://localhost:4040) to see incoming requests
4. **Test webhook endpoint** manually with curl
5. **Verify API key** and session status

---

**Last Updated**: October 30, 2025  
**Status**: 📝 Guide Complete  
**Next Step**: Configure webhooks in WasenderAPI dashboard!

