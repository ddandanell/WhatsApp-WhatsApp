# 🤖 WhatsApp AI Assistant with Knowledge Center

A complete WhatsApp AI assistant powered by Grok AI that automatically responds to messages using your custom knowledge base. Built with Node.js, Express, SQLite, and a beautiful web interface.

## ✨ Features

- **🤖 AI-Powered Responses**: Uses Grok AI to generate intelligent, context-aware responses
- **📚 Knowledge Base Management**: Easy-to-use web interface to manage your knowledge entries
- **⚙️ Customizable Settings**: 
  - On/Off toggle for auto-replies
  - Response delays for natural conversation
  - Active hours scheduling
  - AI temperature control
  - Custom system prompts
- **💬 Message History**: Track all conversations and responses
- **📊 Dashboard**: View statistics and system status at a glance
- **🔒 Secure**: Basic authentication protects your admin panel
- **📱 Webhook Support**: Real-time message reception via WasenderAPI

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- A WasenderAPI account with connected WhatsApp number
- Grok AI API key from x.ai

### Installation

1. **Clone or navigate to the project directory**
```bash
cd "/Users/daviddandanell/Whtaapp - website"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# WhatsApp API Configuration
WASENDER_API_KEY=your_wasender_api_key_here
WASENDER_API_URL=https://wasenderapi.com/api

# Grok AI Configuration
GROK_API_KEY=your_xai_grok_api_key_here
GROK_API_URL=https://api.x.ai/v1

# Server Configuration
PORT=3000
NODE_ENV=development

# Admin Authentication (CHANGE THESE!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_secure_password

# Database
DATABASE_PATH=./data/assistant.db
```

**⚠️ IMPORTANT**: Change the `ADMIN_PASSWORD` to a secure password!

4. **Start the server**
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

5. **Access the admin interface**

Open your browser and go to: `http://localhost:3000`

When prompted, enter your admin credentials (default: `admin` / `change_this_secure_password`)

## 📋 Setup Guide

### Step 1: Configure Your Knowledge Base

1. Navigate to the **Knowledge Base** section in the admin panel
2. Click **"➕ Add Knowledge"**
3. Fill in:
   - **Title**: A descriptive title for the knowledge entry
   - **Content**: The detailed information
   - **Category**: Group related knowledge (e.g., "Products", "Services", "FAQ")
   - **Tags**: Keywords for better searching (comma-separated)
4. Click **"💾 Save"**

**Example Knowledge Entry:**
- **Title**: Business Hours
- **Content**: We are open Monday to Friday, 9 AM to 6 PM EST. Closed on weekends and public holidays.
- **Category**: General Info
- **Tags**: hours, schedule, availability

### Step 2: Configure Settings

Go to the **Settings** page and configure:

#### Auto-Reply Settings
- **Enable Auto-Reply**: Toggle on/off to control automatic responses
- **Response Delay**: Set seconds to wait before replying (makes it more natural)
- **Active Hours**: Set time range when the bot should respond

#### AI Configuration
- **AI Creativity (Temperature)**: 
  - Lower (0.1-0.3): More focused and consistent
  - Medium (0.4-0.7): Balanced
  - Higher (0.8-1.0): More creative and varied
- **System Prompt**: Define how the AI should behave
  - Example: "You are a professional customer service assistant for XYZ Company. Be helpful, concise, and friendly."

Click **"💾 Save Settings"** when done.

### Step 3: Configure Webhook in WasenderAPI

1. Log in to your WasenderAPI dashboard: https://wasenderapi.com/whatsapp/manage/27183
2. Navigate to **Webhook Settings**
3. Set your webhook URL to: `https://your-domain.com/webhook/whatsapp`
   - For local testing with ngrok: `https://your-ngrok-url.ngrok.io/webhook/whatsapp`
4. Save the webhook configuration

### Step 4: Test the System

1. Send a WhatsApp message to your connected number
2. Check the **Dashboard** to see if the message was received
3. View the **Message History** to see the AI's response
4. Adjust settings as needed

## 🌐 Deployment

### Using ngrok (for testing)

```bash
# Install ngrok: https://ngrok.com/
ngrok http 3000
```

Copy the HTTPS URL provided by ngrok and use it as your webhook URL in WasenderAPI.

### Production Deployment

We recommend deploying to:

#### Option 1: Railway.app
1. Create account at https://railway.app/
2. Create new project from GitHub or local files
3. Add environment variables from `.env`
4. Deploy!

#### Option 2: Render.com
1. Create account at https://render.com/
2. Create new Web Service
3. Connect your repository
4. Add environment variables
5. Deploy!

#### Option 3: DigitalOcean App Platform
1. Create account at https://www.digitalocean.com/
2. Create new App
3. Connect repository
4. Configure environment variables
5. Deploy!

**Important**: After deployment, update your webhook URL in WasenderAPI with your production domain.

## 📖 Usage Guide

### Dashboard
- View system status and toggle auto-reply on/off
- See message statistics
- View recent conversations

### Knowledge Base
- Add, edit, and delete knowledge entries
- Search through your knowledge base
- Organize by categories and tags

### Settings
- Control when and how the bot responds
- Customize AI behavior and personality
- Set active hours and response delays

### Message History
- View all received messages
- See AI-generated responses
- Track response times and knowledge usage

## 🔧 Troubleshooting

### Messages not being received
1. Check that webhook URL is correct in WasenderAPI dashboard
2. Verify server is running and accessible
3. Check server logs for errors

### AI not responding
1. Verify Grok API key is correct in `.env`
2. Check that auto-reply is enabled in settings
3. Verify active hours settings
4. Check logs for API errors

### Authentication issues
1. Clear browser cache and session storage
2. Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
3. Restart the server

### Database issues
```bash
# Reset the database (WARNING: This deletes all data!)
rm -rf data/assistant.db
npm start  # Will recreate database with default settings
```

## 📁 Project Structure

```
/
├── server/
│   ├── database/
│   │   ├── init.js          # Database initialization
│   │   └── models.js        # Database operations
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   └── validator.js     # Input validation
│   ├── routes/
│   │   ├── admin.js         # Admin API endpoints
│   │   └── webhook.js       # WhatsApp webhook handler
│   ├── services/
│   │   ├── grok.js          # Grok AI integration
│   │   ├── whatsapp.js      # WasenderAPI integration
│   │   ├── knowledge.js     # Knowledge base service
│   │   └── messageProcessor.js  # Message handling logic
│   └── server.js            # Main Express app
├── public/
│   ├── css/
│   │   └── styles.css       # Admin interface styles
│   ├── js/
│   │   └── app.js           # Frontend JavaScript
│   └── index.html           # Admin interface HTML
├── data/
│   └── assistant.db         # SQLite database (auto-created)
├── package.json
├── .env                     # Environment variables
├── .gitignore
└── README.md
```

## 🔐 Security Notes

1. **Change default password**: Always change `ADMIN_PASSWORD` in `.env`
2. **Use HTTPS**: In production, always use HTTPS
3. **Keep API keys secret**: Never commit `.env` to version control
4. **Regular backups**: Backup your `data/assistant.db` file regularly

## 🆘 Support

For issues with:
- **WasenderAPI**: Visit https://wasenderapi.com/support
- **Grok AI**: Visit https://console.x.ai/
- **This application**: Check server logs and ensure all environment variables are set correctly

## 📝 API Endpoints

### Admin API (requires authentication)

- `GET /api/knowledge` - Get all knowledge entries
- `POST /api/knowledge` - Create new knowledge entry
- `PUT /api/knowledge/:id` - Update knowledge entry
- `DELETE /api/knowledge/:id` - Delete knowledge entry
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings
- `GET /api/messages` - Get message history
- `GET /api/stats` - Get statistics

### Webhook API (no auth required)

- `POST /webhook/whatsapp` - Receive WhatsApp messages
- `GET /webhook/health` - Health check

## 🎯 Best Practices

1. **Knowledge Base Tips**:
   - Keep entries concise and focused
   - Use clear, descriptive titles
   - Organize with categories
   - Add relevant tags for better matching

2. **System Prompt Tips**:
   - Define the AI's role clearly
   - Set expectations for response style
   - Include any important guidelines
   - Mention the knowledge base usage

3. **Response Settings**:
   - Use 2-5 second delay for natural feel
   - Set active hours to match your availability
   - Start with temperature 0.7, adjust as needed

## 📊 Database Schema

### knowledge_base
- `id` - Auto-increment primary key
- `title` - Entry title
- `content` - Full content
- `category` - Category name
- `tags` - Comma-separated tags
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### settings
- `key` - Setting name (primary key)
- `value` - Setting value

### message_history
- `id` - Auto-increment primary key
- `from_number` - Sender phone number
- `message_text` - Received message
- `response_text` - AI response
- `timestamp` - Message timestamp
- `response_time` - Time taken to respond
- `knowledge_used` - Whether knowledge was used
- `status` - Message status (received/replied)

## 📄 License

ISC

## 🙏 Acknowledgments

- Built with Express.js
- AI powered by Grok (xAI)
- WhatsApp integration via WasenderAPI
- Database powered by SQLite

---

**Enjoy your AI-powered WhatsApp assistant!** 🎉

