# 🚀 **Twilio SMS/WhatsApp Alerts - QUICK START**

## ⏱️ **15 Minute Setup**

### **Step 1: Get Twilio (5 min)**

1. **Sign up**: https://www.twilio.com/try-twilio
2. **Verify your phone** during signup
3. **Get credentials** from dashboard:
   - Copy **Account SID** (starts with AC...)
   - Copy **Auth Token**
   - Copy **Phone Number** (starts with +1...)

---

### **Step 2: Configure (2 min)**

**Create `backend/.env` file:**

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+14155238886

# Other existing config...
MONGO_URI=mongodb://localhost:27017/sads
JWT_SECRET=your-jwt-secret
PORT=5000
```

**Save the file!**

---

### **Step 3: Restart Backend (1 min)**

```bash
cd backend
npm start
```

**Look for:**
```
✅ Twilio client initialized
Server listening on port 5000
```

✅ **If you see this, Twilio is working!**

---

### **Step 4: Add Phone Number (2 min)**

**Option A - Via UI (Recommended):**
1. Login to SADS
2. Click "Alert Settings" in sidebar
3. Enter your phone: `+919876543210` (India) or `+14155551234` (USA)
4. Click "Save Phone Number"

**Option B - Via Database:**
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { phone: "+919876543210" } }
)
```

---

### **Step 5: Test! (2 min)**

**In Alert Settings page:**
1. Click "Test SMS" button
2. Check your phone 📱
3. ✅ **SMS received? Success!**

**Or test via API:**
```bash
curl -X POST http://localhost:5000/api/alerts/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel": "sms"}'
```

---

## 📱 **Phone Number Format**

**CRITICAL:** Use E.164 format (with country code)!

| Country   | Format             | Example          |
|-----------|--------------------|------------------|
| India     | +91XXXXXXXXXX      | +919876543210    |
| USA       | +1XXXXXXXXXX       | +14155551234     |
| UK        | +44XXXXXXXXXX      | +447700900123    |
| Australia | +61XXXXXXXXX       | +61412345678     |

---

## 🚨 **Alert Levels**

| Animal Type      | Confidence | Alerts Sent               |
|------------------|------------|---------------------------|
| Elephant, Tiger  | ≥80%       | SMS + WhatsApp + Call 🔴  |
| Wild Boar        | Any        | SMS + WhatsApp 🟡         |
| Other animals    | <70%       | SMS only 🟢               |

---

## ⚙️ **Customize Alerts**

**In Alert Settings page:**

- ✅ **Enable SMS** - Text message alerts
- ✅ **Enable WhatsApp** - WhatsApp messages
- ✅ **Enable Calls** - Voice calls (critical only)
- ✅ **Critical Only** - Only elephant/tiger alerts
- ✅ **Quiet Hours** - No alerts 10 PM - 7 AM

---

## 🎯 **How It Works**

```
Camera detects elephant
    ↓
Saved to database
    ↓
System: "This is CRITICAL!"
    ↓
Send SMS ✅
Send WhatsApp ✅
Make voice call ✅
    ↓
You get alert in 2 seconds! 📱
```

---

## 🐛 **Troubleshooting**

### **SMS not working?**
1. Check `.env` has correct Twilio credentials
2. Restart backend: `npm start`
3. Verify phone number format: must start with `+`
4. Check Twilio console: https://console.twilio.com

### **"Twilio not configured"?**
- Missing `.env` file
- Wrong credentials in `.env`
- Backend not restarted after adding credentials

### **Phone number rejected?**
- Must be E.164 format: `+919876543210`
- Include country code
- No spaces or hyphens

---

## 💰 **Costs**

**Free Trial:**
- $15 credit free
- ~500 SMS messages
- Valid for 1 year

**After Trial:**
- SMS: $0.0075 each
- WhatsApp: $0.005 each
- Voice: $0.02/minute

**For production:** Upgrade to send to any number (free trial requires verified numbers)

---

## ✅ **Verification**

Check these:
- [ ] Twilio account created ✅
- [ ] Credentials in `.env` ✅
- [ ] Backend shows "Twilio client initialized" ✅
- [ ] Phone number added to profile ✅
- [ ] Test SMS received ✅
- [ ] Ready for live alerts! 🎉

---

## 🆘 **Need Help?**

1. **Check backend console** for errors
2. **Check Twilio logs**: https://console.twilio.com/logs
3. **Read full guide**: `SMS_WHATSAPP_SETUP_GUIDE.md`
4. **Test with curl** (see examples above)

---

## 🎉 **Success!**

Once test SMS works, you're done! 

**Live detections will now automatically send alerts to your phone!** 🦁📱

---

**Start detecting wildlife safely! 🐘🐯🚨**




