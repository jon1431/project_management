# 🔧 WSL QR Code Fix - Testing Guide

## Problem
QR codes don't work properly in WSL (Windows Subsystem for Linux) due to network configuration.

## ✅ Solutions (Pick One)

### Solution 1: Test on Web Browser (RECOMMENDED - Fastest)

```bash
# In your project directory
npm start
```

When you see the menu, press **`w`**

The app will open in your browser at: `http://localhost:8081`

**Advantages:**
- ✅ Instant - no phone needed
- ✅ Easy debugging with browser DevTools (F12)
- ✅ No QR code issues
- ✅ Fast refresh

---

### Solution 2: Use Tunnel Mode (For Phone Testing)

```bash
npx expo start --tunnel
```

This creates a proper tunnel that works with WSL and generates a working QR code!

**Advantages:**
- ✅ QR code will work
- ✅ Test on real device
- ⚠️ Slightly slower than normal mode

**Steps:**
1. Run command above
2. Wait for QR code to appear
3. Scan with Expo Go app
4. App loads on your phone

---

### Solution 3: Android Emulator (No QR needed)

```bash
# Make sure Android Studio is installed and emulator is running
npm run android
```

**Advantages:**
- ✅ No QR code needed
- ✅ Fast testing
- ✅ Debugging tools

**Requirements:**
- Android Studio installed
- Emulator created and running

---

### Solution 4: Manual URL Entry

1. Start normally:
```bash
npm start
```

2. Look for the line in terminal like:
```
› Metro waiting on exp://192.168.x.x:8081
```

3. Open **Expo Go** app on phone
4. Tap "Enter URL manually"
5. Type the exp:// URL
6. App loads

---

## 🎯 Quick Start for Testing Right Now

### For Immediate Testing (Recommended):

```bash
# Option 1: Web Browser (Easiest)
npm start
# Press 'w' when menu appears

# Option 2: Tunnel for Phone
npx expo start --tunnel
# Scan the QR code that appears
```

---

## 🌐 Testing in Browser Step-by-Step

1. **Open Terminal** in your project folder:
```bash
cd /mnt/c/Users/User/Desktop/Year2/Sem1/Project_mangement/project_management
```

2. **Start the app:**
```bash
npm start
```

3. **Wait for Metro bundler menu** (shows after ~10 seconds)

4. **Press `w`** to open web

5. **Browser opens automatically** or go to: `http://localhost:8081`

6. **Test the app:**
   - Click "Continue Anonymously"
   - Submit a test report
   - Check profile, etc.

---

## 🐛 Troubleshooting

### Issue: "Port 8081 already in use"
```bash
# Kill the process
npx kill-port 8081

# Or restart with different port
npm start -- --port 8082
```

### Issue: Web page doesn't load
```bash
# Clear cache
npm start -- --clear

# Or manually open
# In browser: http://localhost:8081
```

### Issue: Tunnel doesn't work
```bash
# Install tunnel dependencies
npm install -g @expo/ngrok

# Try again
npx expo start --tunnel
```

### Issue: "Metro bundler not starting"
```bash
# Clear everything
rm -rf node_modules
npm install --legacy-peer-deps
npm start
```

---

## 📱 Alternative: Test on Windows Directly

Since you're on WSL, you can also run the app directly in Windows:

1. **Open PowerShell or Command Prompt** (not WSL terminal)
2. **Navigate to project:**
```powershell
cd C:\Users\User\Desktop\Year2\Sem1\Project_mangement\project_management
```
3. **Start app:**
```powershell
npm start
```
4. **QR code should work properly from Windows!**

---

## ✅ Recommended Testing Flow for WSL

```bash
# 1. First deploy rules (do once)
firebase login
firebase deploy --only firestore

# 2. For development - use web
npm start
# Press 'w'

# 3. For phone testing - use tunnel
npx expo start --tunnel
# Scan QR
```

---

## 🎬 Video Demo Alternative

If all else fails, you can also:
1. Record screen while testing on web
2. Use Android Studio emulator for demo
3. Or follow tunnel mode instructions above

---

## 📞 Need More Help?

**Check these:**
1. Make sure you're in the right directory
2. Try web mode first (simplest)
3. Use tunnel mode for phone
4. Or run from Windows PowerShell directly

**Common WSL Issues:**
- Networking between WSL and Windows can be tricky
- QR codes rely on proper network discovery
- Web mode bypasses all these issues
- Tunnel mode creates proper connection

---

**Start with web mode - it's the easiest!** 🚀

```bash
npm start
# Press 'w'
```
