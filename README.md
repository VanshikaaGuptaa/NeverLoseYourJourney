# Resilient Journey

## What is this?
**Resilient Journey** is a smart multi-step form application designed to **never lose your data**, no matter what goes wrong. 

Have you ever spent 10 minutes filling out a long form on a government or bank website, only for your internet to blink out, your session to expire, or the server to crash—forcing you to start all over again? This application solves that problem!

It automatically saves your progress as you type. If your internet dies, if your login expires, or if you accidentally refresh the page, you will safely pick right back up exactly where you left off. 

---

## Key Features

- **Offline Resilience & Sync Queue:** If the network goes down, the app detects it and queues your auto-saves locally. When you come back online, it synchronizes your data automatically behind the scenes with zero data loss.
- **Smart OTP Authentication:** A frictionless two-step login system. Once you authenticate with an OTP, your device is granted a 15-minute "Trusted Session" grace period. If you accidentally disconnect or drop your session, you can log back in immediately without being forced to re-enter an OTP.
- **Auto-Save:** Your data is saved automatically in the background every time you type. No need to click "Save".
- **Disaster Recovery:** If your session expires while you are typing, you will be asked to log in again, and then immediately returned to your form exactly where you left it.
- **Dynamic Progress Tracking:** A beautiful 6-step progress bar that keeps you informed of your current step, completed steps, and upcoming steps.
- **Real-Time Telemetry:** The Resilience Dashboard gives you a live view of your authentication status, network connectivity, and background auto-save operations.

---

## How to Start the App (For Beginners)

You don't need to be an expert to run this! We have packaged everything using **Docker**, which sets up the entire application for you with one command.

1. Make sure you have **Docker Desktop** installed and running on your computer.
2. Open a terminal (Command Prompt or PowerShell) in this folder.
3. Run the following command:
   ```bash
   docker compose up --build -d
   ```
4. Wait a minute or two for everything to build and start.
5. Open your web browser and go to: **http://localhost**

*(Note: The app has a fake login system for demonstration purposes. You can type literally anything in the UID and password fields to log in!)*

---

## How to Test and See the Magic

Because this app is built to survive disasters, we added a special **Control Panel** floating on the bottom right of the screen. You can use it to intentionally break the app and watch how it recovers!

Here is a fun script to test out the resilience features:

### 1. Test Smart OTP & Grace Period
Log in using any UID and password. You will be asked for an OTP. **(Press F12 to open your Browser Console—the demo OTP is printed there in green!)** Enter the OTP. 
Now, click **"Expire Auth"** on the control panel to kill your session, and log in again. You will bypass the OTP screen entirely because of the 15-minute grace period!
*(Pro Tip: Try logging in from an Incognito window—the system will recognize it as an untrusted device and demand an OTP!)*

### 2. Test Auto-Save Queue (Offline Mode)
Go to any form step and type some data. 
Click **"Fail Autosave"** or **"Network Fail"** on the control panel.
Continue typing. Notice how the app doesn't crash? The Resilience Dashboard will show that it is queuing your data.
Click **"Reset All"** to simulate the internet returning, and watch the dashboard automatically sync your queued data to the server!

### 3. Test Session Expiry (The "Kicked Out" Scenario)
Type some data in the form. 
Click **"Expire Auth"** in the control panel. 
Now, type one more letter in the form. The app will realize your login session is dead and kick you to the login screen. 
Log back in. **Boom!** You are immediately brought back to the exact step you were on, with all your data intact.

### 4. Test Browser Refresh
Go to any step, type some data, and just hit **Refresh (F5)** on your browser. You won't lose your data and you will stay on the same step.
