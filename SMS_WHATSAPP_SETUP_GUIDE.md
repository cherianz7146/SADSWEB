# SMS/WhatsApp Alerts Setup Guide

## 🎯 **What's Been Implemented**

Your SADS project now has **intelligent SMS/WhatsApp/Voice alerts**! 🚨

### **Features Added:**

1. ✅ **Smart Alert System**
   - 🔴 **Critical Alerts** (Elephant, Tiger, Leopard) → SMS + WhatsApp + Voice Call
   - 🟡 **Warning Alerts** (Wild Boar, Hyena) → SMS + WhatsApp
   - 🟢 **Info Alerts** (Deer, Rabbit) → SMS only

2. ✅ **Automatic Detection Integration**
   - Alerts sent automatically when animals detected
   - Sent to detecting manager + all admins

3. ✅ **User Preferences**
   - Enable/disable SMS, WhatsApp, calls individually
   - Critical-only mode
   - Quiet hours (no alerts during sleep time)

4. ✅ **Phone Number Management**
   - Add phone number in user profile
   - E.164 format validation (+1234567890)

5. ✅ **Test Alerts**
   - Test SMS, WhatsApp, or voice calls
   - Verify setup before live use

---

## 🚀 **Setup Instructions**

### **Step 1: Get Twilio Account** (5 minutes)

1. **Sign up for Twilio** (free trial with $15 credit):
   ```
   https://www.twilio.com/try-twilio
   ```

2. **Verify your phone number** during signup

3. **Get your credentials** from dashboard:
   - Account SID (like: `ACxxxxxxxxxxxxx`)
   - Auth Token (like: `your_secret_token`)
   - Phone Number (like: `+1234567890`)

---

### **Step 2: Configure Environment** (2 minutes)

1. **Create `.env` file** in `backend/` folder:
   ```bash
   cd backend
   copy .env.example .env    # Windows
   # or
   cp .env.example .env      # Mac/Linux
   ```

2. **Edit `backend/.env`** and add Twilio credentials:
   ```env
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_WHATSAPP_NUMBER=+14155238886
   ```

3. **Save the file**

---

### **Step 3: Restart Backend** (1 minute)

```bash
cd backend
npm start
```

You should see:
```
✅ Twilio client initialized
Server listening on port 5000
```

---

### **Step 4: Add Phone Number** (2 minutes)

#### **Option A: Via Database (Quick)**
```javascript
// In MongoDB compass or shell
db.users.updateOne(
  { email: "your-email@example.com" },
  { 
    $set: { 
      phone: "+1234567890",  // Your phone number in E.164 format
      alertPreferences: {
        enableSMS: true,
        enableWhatsApp: true,
        enableCalls: true,
        criticalOnly: false,
        quietHours: {
          enabled: false,
          start: "22:00",
          end: "07:00"
        }
      }
    } 
  }
)
```

#### **Option B: Via API (Recommended)**
```bash
# Test with curl or Postman
curl -X PATCH http://localhost:5000/api/alerts/phone \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

---

### **Step 5: Test Alerts** (2 minutes)

#### **Test SMS:**
```bash
curl -X POST http://localhost:5000/api/alerts/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "sms"}'
```

#### **Test WhatsApp:**
```bash
curl -X POST http://localhost:5000/api/alerts/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "whatsapp"}'
```

#### **Test Voice Call:**
```bash
curl -X POST http://localhost:5000/api/alerts/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "call"}'
```

---

## 📱 **Phone Number Format**

**IMPORTANT**: Phone numbers MUST be in E.164 format:

✅ **Correct:**
- `+919876543210` (India)
- `+14155551234` (USA)
- `+447700900123` (UK)
- `+61412345678` (Australia)

❌ **Wrong:**
- `9876543210` (missing country code)
- `09876543210` (leading zero)
- `+91 98765 43210` (spaces)
- `+91-9876543210` (hyphens)

---

## 🌍 **Country Codes**

| Country       | Code  | Example           |
|---------------|-------|-------------------|
| India         | +91   | +919876543210     |
| USA           | +1    | +14155551234      |
| UK            | +44   | +447700900123     |
| Australia     | +61   | +61412345678      |
| Canada        | +1    | +14165551234      |
| Singapore     | +65   | +6591234567       |
| UAE           | +971  | +971501234567     |

---

## 🚨 **Alert Levels Explained**

### **Critical (🔴)**
**Animals**: Elephant, Tiger, Leopard, Bear, Lion
**Actions**: 
- ✅ Sends SMS immediately
- ✅ Sends WhatsApp message
- ✅ Makes voice call
- Message: "CRITICAL ALERT!"

**When**: These animals are dangerous and require immediate response

---

### **Warning (🟡)**
**Animals**: Wild Boar, Hyena, Wolf, Crocodile
**Actions**:
- ✅ Sends SMS
- ✅ Sends WhatsApp message
- ❌ No voice call

**When**: These animals need attention but aren't immediately life-threatening

---

### **Info (🟢)**
**Animals**: Deer, Rabbit, Mongoose, etc.
**Actions**:
- ✅ Sends SMS only
- ❌ No WhatsApp
- ❌ No voice call

**When**: Informational detections, no immediate action needed

---

## ⚙️ **Alert Preferences**

Users can customize their alert settings:

### **Enable/Disable Channels:**
```javascript
{
  enableSMS: true,          // Receive SMS alerts
  enableWhatsApp: true,     // Receive WhatsApp messages
  enableCalls: true,        // Receive voice calls (critical only)
  criticalOnly: false       // Only get critical alerts (ignore warnings/info)
}
```

### **Quiet Hours:**
```javascript
{
  quietHours: {
    enabled: true,
    start: "22:00",         // 10 PM
    end: "07:00"            // 7 AM
  }
}
```

During quiet hours, only CRITICAL alerts with voice calls will go through.

---

## 💰 **Twilio Free Tier**

**What you get:**
- $15 free credit on signup
- Valid for 1 year
- Enough for ~500 SMS messages
- Limited numbers (must verify recipients)

**Costs after free credit:**
- SMS: $0.0075 per message (India)
- WhatsApp: $0.005 per message
- Voice calls: $0.02 per minute

**Pro Tip**: For production, upgrade to paid plan to send to any number

---

## 🔧 **API Endpoints**

### **Get Alert Settings**
```
GET /api/alerts/settings
```

### **Update Phone Number**
```
PATCH /api/alerts/phone
Body: { "phone": "+919876543210" }
```

### **Update Preferences**
```
PATCH /api/alerts/preferences
Body: {
  "enableSMS": true,
  "enableWhatsApp": true,
  "enableCalls": false,
  "criticalOnly": true,
  "quietHours": {
    "enabled": true,
    "start": "23:00",
    "end": "06:00"
  }
}
```

### **Send Test Alert**
```
POST /api/alerts/test
Body: { "channel": "sms" | "whatsapp" | "call" }
```

### **Send Custom Alert** (Admin only)
```
POST /api/alerts/custom
Body: {
  "managerIds": ["user_id_1", "user_id_2"],
  "message": "Custom message here",
  "channel": "sms" | "whatsapp" | "call"
}
```

---

## 🐛 **Troubleshooting**

### **Issue: "Twilio not configured"**
**Solution**: Check `.env` file has correct Twilio credentials

### **Issue: SMS not received**
**Solutions**:
1. Check phone number format (must be E.164)
2. Verify number is verified in Twilio (free tier requirement)
3. Check Twilio console for delivery logs

### **Issue: WhatsApp not received**
**Solutions**:
1. User must send "JOIN" message to Twilio WhatsApp sandbox first
2. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
3. Send "join <sandbox-name>" to WhatsApp number

### **Issue: Voice call not working**
**Solutions**:
1. Check Twilio Voice is enabled in your account
2. Verify phone number can receive calls
3. Check Twilio call logs

---

## 📊 **How It Works**

### **Detection Flow:**
```
1. Camera detects animal
   ↓
2. Detection saved to database
   ↓
3. System checks animal type and confidence
   ↓
4. Determines alert level (Critical/Warning/Info)
   ↓
5. Checks user's alert preferences
   ↓
6. Sends appropriate alerts (SMS/WhatsApp/Call)
   ↓
7. Logs results
```

### **Smart Decisions:**
```javascript
if (animal === 'elephant' && confidence >= 0.80) {
  → Send CRITICAL alert (SMS + WhatsApp + Call)
} else if (animal === 'wild boar' || confidence >= 0.70) {
  → Send WARNING alert (SMS + WhatsApp)
} else {
  → Send INFO alert (SMS only)
}
```

---

## 🎯 **Next Steps**

### **Now:**
1. ✅ Get Twilio account
2. ✅ Add credentials to `.env`
3. ✅ Test alerts
4. ✅ Add phone numbers to users

### **Soon** (Next Features to Build):
1. 📱 Frontend UI for alert settings
2. 📊 Alert history page
3. 🔔 Alert acknowledgment system
4. 📈 Alert analytics dashboard
5. 👥 Group alerts (notify all managers in zone)

---

## 📞 **Support**

### **Twilio Support:**
- Documentation: https://www.twilio.com/docs
- Support: https://support.twilio.com

### **SADS Support:**
- Check console logs for errors
- Review Twilio delivery logs
- Test with curl commands first

---

## ✅ **Verification Checklist**

- [ ] Twilio account created
- [ ] Free credit available ($15)
- [ ] Phone number obtained
- [ ] Credentials added to `.env`
- [ ] Backend restarted
- [ ] Test SMS sent successfully
- [ ] Phone number added to user profile
- [ ] Live detection triggers alert
- [ ] Alert received on phone

---

## 🎉 **Success!**

If you received a test SMS, congratulations! 🎊

Your wildlife detection system now has **real-time SMS/WhatsApp alerts** to keep managers safe and informed!

---

**Questions or issues? Check the troubleshooting section or review the console logs!**



