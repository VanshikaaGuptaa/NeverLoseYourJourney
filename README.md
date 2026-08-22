# Never Lose Your Journey

## What is this?
**Never Lose Your Journey** is a smart multi-step form application designed to **never lose your data**, no matter what goes wrong. 

Have you ever spent 10 minutes filling out a long form on a government or bank website, only for your internet to blink out, your session to expire, or the server to crash—forcing you to start all over again? This application solves that problem!

It automatically saves your progress as you type. If your internet dies, if your login expires, or if you accidentally refresh the page, you will safely pick right back up exactly where you left off. 

---

## Features
- **Auto-Save:** Your data is saved automatically in the background every time you type. No need to click "Save".
- **Disaster Recovery:** If your session expires while you are typing, you will be asked to log in again, and then immediately returned to your form with zero data loss.
- **Offline Protection:** If the network goes down, the app detects it and protects your work.
- **Modern Design:** Beautiful dark/light mode interface with smooth animations and clean layouts.

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

*(Note: The app has a fake login system for demonstration purposes. You can type literally anything in the email and password fields to log in!)*

---

## How to Test and See the Magic

Because this app is built to survive disasters, we added a special **Control Panel** floating on the bottom right of the screen. You can use it to intentionally break the app and watch how it recovers!

Here is a fun script to test out the resilience features:

### 1. Test Auto-Save & Navigation
Fill out the first page and click "Next". Click "Back" to return to the first page. Notice how your data is perfectly remembered without you having to click a "Save" button.

### 2. Test Session Expiry (The "Kicked Out" Scenario)
Go to Step 2 or 3 and type some data. 
Click **"Expire Auth"** in the control panel. 
Now, type one more letter in the form. The app will realize your login session is dead and kick you to the login screen. 
Log back in (again, any fake email/password works). **Boom!** You are immediately brought back to the exact step you were on, and your data is exactly as you left it.

### 3. Test Network Failure
Progress through the form until you reach the final **Submit** page (Step 6).
Click **"Network Fail"** on the control panel. This simulates your internet connection dying exactly as you try to submit.
Click the **Submit** button. Normally, an app would crash, throw an ugly error, or kick you out. Here, the app intercepts the failure, keeps you perfectly safe on the page, and gently warns you that the submission failed.

### 4. Test Browser Refresh
Go to any step, type some data, and just hit **Refresh (F5)** on your browser. You won't lose your data and you will stay on the same step.
