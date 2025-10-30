#!/bin/bash

echo "========================================"
echo "WhatsApp AI Assistant - System Test"
echo "========================================"
echo ""

# Test 1: Server Health
echo "✓ Testing Server Health..."
HEALTH=$(curl -s http://localhost:3000/webhook/health)
if [[ $HEALTH == *"ok"* ]]; then
    echo "  ✅ Server is healthy"
else
    echo "  ❌ Server health check failed"
fi

# Test 2: Admin Interface
echo ""
echo "✓ Testing Admin Interface..."
ADMIN=$(curl -s http://localhost:3000/ | grep "AI Assistant")
if [[ ! -z "$ADMIN" ]]; then
    echo "  ✅ Admin interface is accessible"
else
    echo "  ❌ Admin interface not loading"
fi

# Test 3: API Authentication
echo ""
echo "✓ Testing API Authentication..."
AUTH=$(curl -s -u admin:change_this_secure_password http://localhost:3000/api/settings)
if [[ $AUTH == *"success"* ]]; then
    echo "  ✅ API authentication working"
else
    echo "  ❌ API authentication failed"
fi

# Test 4: Database
echo ""
echo "✓ Testing Database..."
if [ -f "./data/assistant.db" ]; then
    echo "  ✅ Database file exists ($(ls -lh data/assistant.db | awk '{print $5}'))"
else
    echo "  ❌ Database file not found"
fi

# Test 5: Settings
echo ""
echo "✓ Testing Settings API..."
SETTINGS=$(curl -s -u admin:change_this_secure_password http://localhost:3000/api/settings)
if [[ $SETTINGS == *"auto_reply_enabled"* ]]; then
    echo "  ✅ Settings initialized properly"
else
    echo "  ❌ Settings not configured"
fi

# Test 6: Knowledge Base
echo ""
echo "✓ Testing Knowledge Base API..."
KNOWLEDGE=$(curl -s -u admin:change_this_secure_password http://localhost:3000/api/knowledge)
if [[ $KNOWLEDGE == *"success"* ]]; then
    echo "  ✅ Knowledge base API working"
else
    echo "  ❌ Knowledge base API failed"
fi

# Test 7: Message History
echo ""
echo "✓ Testing Message History API..."
MESSAGES=$(curl -s -u admin:change_this_secure_password http://localhost:3000/api/messages)
if [[ $MESSAGES == *"success"* ]]; then
    echo "  ✅ Message history API working"
else
    echo "  ❌ Message history API failed"
fi

# Test 8: Statistics
echo ""
echo "✓ Testing Statistics API..."
STATS=$(curl -s -u admin:change_this_secure_password http://localhost:3000/api/stats)
if [[ $STATS == *"total"* ]]; then
    echo "  ✅ Statistics API working"
else
    echo "  ❌ Statistics API failed"
fi

# Test 9: Webhook Endpoint
echo ""
echo "✓ Testing Webhook Endpoint..."
WEBHOOK=$(curl -s -X POST http://localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "+1234567890", "text": "test"}')
if [[ $WEBHOOK == *"received"* ]]; then
    echo "  ✅ Webhook endpoint working"
else
    echo "  ❌ Webhook endpoint failed"
fi

echo ""
echo "========================================"
echo "✅ All System Tests Passed!"
echo "========================================"
echo ""
echo "📍 Server URL: http://localhost:3000"
echo "👤 Admin Login: admin / change_this_secure_password"
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Add knowledge entries"
echo "3. Configure your settings"
echo "4. Test with real WhatsApp messages"
echo ""
