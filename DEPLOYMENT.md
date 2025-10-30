# 🚀 Deployment Guide

This guide will help you deploy your WhatsApp AI Assistant to production.

## Pre-Deployment Checklist

- [ ] All API keys configured in `.env`
- [ ] Admin password changed from default
- [ ] Knowledge base populated with relevant information
- [ ] Settings configured (active hours, delays, etc.)
- [ ] Webhook tested locally with ngrok

## Deployment Options

### Option 1: Railway.app (Recommended)

**Pros**: Easy deployment, automatic HTTPS, free tier available

1. **Create Railway Account**
   - Go to https://railway.app/
   - Sign up with GitHub or email

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo" or "Empty Project"

3. **Configure Project**
   - If using GitHub: Connect your repository
   - If empty project: Use Railway CLI to deploy

4. **Add Environment Variables**
   Go to Variables tab and add:
   ```
   WASENDER_API_KEY=your_key_here
   WASENDER_API_URL=https://wasenderapi.com/api
   GROK_API_KEY=your_key_here
   GROK_API_URL=https://api.x.ai/v1
   PORT=3000
   NODE_ENV=production
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD=your_secure_password
   DATABASE_PATH=./data/assistant.db
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Get your deployment URL (e.g., `https://your-app.railway.app`)

6. **Configure Webhook**
   - Go to WasenderAPI dashboard
   - Set webhook URL to: `https://your-app.railway.app/webhook/whatsapp`

### Option 2: Render.com

**Pros**: Free tier, easy setup, automatic deploys

1. **Create Render Account**
   - Go to https://render.com/
   - Sign up with GitHub or email

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Or use "Deploy a Web Service from a Git URL"

3. **Configure Service**
   - Name: `whatsapp-ai-assistant`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   In the Environment tab, add all variables from `.env`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Get your URL (e.g., `https://your-app.onrender.com`)

6. **Configure Webhook**
   - Set webhook in WasenderAPI to your Render URL

### Option 3: DigitalOcean App Platform

**Pros**: Reliable, scalable, good performance

1. **Create DigitalOcean Account**
   - Go to https://www.digitalocean.com/
   - Sign up and verify account

2. **Create App**
   - Go to Apps
   - Click "Create App"
   - Choose GitHub or GitLab

3. **Configure App**
   - Select repository
   - Choose branch (main/master)
   - Configure build settings:
     - Build Command: `npm install`
     - Run Command: `npm start`

4. **Add Environment Variables**
   Add all variables from `.env` file

5. **Choose Plan**
   - Basic plan is sufficient for most use cases
   - $5/month tier recommended

6. **Deploy**
   - Review and create
   - Wait for deployment
   - Get your app URL

7. **Configure Webhook**
   Update WasenderAPI with your DigitalOcean app URL

### Option 4: VPS (DigitalOcean Droplet, Linode, etc.)

**Pros**: Full control, flexible, cost-effective for high traffic

1. **Create VPS**
   - Choose Ubuntu 22.04 LTS
   - Minimum 1GB RAM recommended

2. **Connect via SSH**
   ```bash
   ssh root@your_server_ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install Git**
   ```bash
   sudo apt-get install git
   ```

5. **Clone Repository**
   ```bash
   cd /var/www
   git clone your_repository_url
   cd your_project_directory
   ```

6. **Install Dependencies**
   ```bash
   npm install
   ```

7. **Create .env file**
   ```bash
   nano .env
   # Paste your environment variables
   # Save with Ctrl+X, Y, Enter
   ```

8. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

9. **Start Application**
   ```bash
   pm2 start server/server.js --name whatsapp-assistant
   pm2 save
   pm2 startup
   ```

10. **Install Nginx**
    ```bash
    sudo apt-get install nginx
    ```

11. **Configure Nginx**
    ```bash
    sudo nano /etc/nginx/sites-available/whatsapp-assistant
    ```
    
    Add:
    ```nginx
    server {
        listen 80;
        server_name your_domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

12. **Enable Site**
    ```bash
    sudo ln -s /etc/nginx/sites-available/whatsapp-assistant /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

13. **Install SSL Certificate (Let's Encrypt)**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d your_domain.com
    ```

14. **Configure Webhook**
    Set webhook to: `https://your_domain.com/webhook/whatsapp`

## Post-Deployment Steps

### 1. Verify Deployment

Test the following endpoints:

```bash
# Health check
curl https://your-domain.com/webhook/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Access Admin Panel

1. Go to `https://your-domain.com`
2. Login with your admin credentials
3. Verify all sections load correctly

### 3. Configure Webhook

1. Log in to WasenderAPI: https://wasenderapi.com/whatsapp/manage/27183
2. Navigate to Webhook Settings
3. Enter your webhook URL: `https://your-domain.com/webhook/whatsapp`
4. Select events: "Message Received"
5. Save configuration

### 4. Test End-to-End

1. Send a test message to your WhatsApp number
2. Check Dashboard for incoming message
3. Verify AI response was sent
4. Check Message History

### 5. Populate Knowledge Base

1. Go to Knowledge Base section
2. Add at least 5-10 entries covering common topics
3. Organize with categories and tags
4. Test with relevant questions

### 6. Configure Settings

1. Set active hours based on your timezone
2. Adjust response delay (2-5 seconds recommended)
3. Customize system prompt for your use case
4. Set AI temperature (start with 0.7)

## Monitoring & Maintenance

### Logs

**Railway/Render**: Check logs in the platform dashboard

**VPS with PM2**:
```bash
pm2 logs whatsapp-assistant
pm2 monit
```

### Database Backup

**Automated backup script**:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp ./data/assistant.db ./backups/assistant_$DATE.db
# Keep only last 7 days
find ./backups -name "assistant_*.db" -mtime +7 -delete
```

Schedule with cron:
```bash
crontab -e
# Add: 0 0 * * * /path/to/backup.sh
```

### Updates

**For Git deployments**:
```bash
cd /path/to/project
git pull
npm install
pm2 restart whatsapp-assistant
```

**For Railway/Render**: Push to main branch, auto-deploys

### Performance Monitoring

Monitor these metrics:
- Response time
- Message volume
- API errors
- Database size
- Memory usage

## Troubleshooting

### Webhook Not Receiving Messages

1. Check webhook URL is HTTPS
2. Verify URL is publicly accessible
3. Check server logs for incoming requests
4. Test webhook with curl:
   ```bash
   curl -X POST https://your-domain.com/webhook/whatsapp \
     -H "Content-Type: application/json" \
     -d '{"from": "+1234567890", "text": "test"}'
   ```

### High Response Times

1. Check Grok API latency
2. Optimize knowledge base queries
3. Consider caching frequent queries
4. Upgrade server resources

### Database Locked Errors

SQLite can have lock issues under high concurrency. Solutions:
1. Add WAL mode (already configured)
2. Reduce concurrent requests
3. Consider PostgreSQL for high traffic

### API Rate Limits

If hitting rate limits:
1. Add rate limiting to incoming webhooks
2. Queue messages for processing
3. Upgrade API plan if needed

## Security Best Practices

1. **Change Default Password**: Always use a strong admin password
2. **Use HTTPS**: Never use HTTP in production
3. **Secure API Keys**: Store in environment variables, never in code
4. **Regular Updates**: Keep dependencies updated
5. **Monitor Logs**: Check for suspicious activity
6. **Backup Regularly**: Automate database backups
7. **Rate Limiting**: Already configured, adjust if needed

## Scaling Considerations

### For High Traffic

1. **Use PostgreSQL**: Replace SQLite for better concurrency
2. **Add Redis**: Cache frequent knowledge queries
3. **Load Balancer**: Distribute traffic across multiple instances
4. **Queue System**: Use Bull or RabbitMQ for message processing
5. **CDN**: Serve static files through CDN

### Estimated Capacity

With basic setup:
- ~1000 messages/day: Single instance sufficient
- ~10,000 messages/day: Consider scaling
- ~100,000+ messages/day: Requires architecture changes

## Cost Estimates

### Hosting
- Railway/Render Free Tier: $0 (limited resources)
- Railway Pro: $5-20/month
- DigitalOcean Basic: $6/month
- DigitalOcean Production: $12-24/month

### APIs
- WasenderAPI: Check their pricing
- Grok AI: Check x.ai pricing

### Total Estimated Cost
- Small usage: $10-30/month
- Medium usage: $50-100/month
- High usage: $200+/month

## Support Resources

- **WasenderAPI Docs**: https://wasenderapi.com/docs
- **Grok AI Docs**: https://console.x.ai/docs
- **Express.js Docs**: https://expressjs.com/
- **Node.js Docs**: https://nodejs.org/

## Next Steps

After successful deployment:
1. ✅ Monitor first 24 hours closely
2. ✅ Collect user feedback
3. ✅ Refine knowledge base
4. ✅ Adjust AI settings
5. ✅ Set up automated backups
6. ✅ Document any custom changes

---

**Need Help?** Check logs first, then review the troubleshooting section. Most issues are related to configuration or network connectivity.

