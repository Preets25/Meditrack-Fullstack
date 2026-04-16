# Meditrack - Full Stack Medicine Tracking Application

Meditrack is a comprehensive healthcare tracking ecosystem built with the MERN stack (MongoDB, Express, React, Node) and React Native for mobile.

## Prerequisites
Ensure the following are installed and running smoothly:
- **Node.js** (v16+ recommended)
- **MongoDB** (Local instance running via MongoDB Compass or Cloud URI)
- **Redis Server** (Usually running on port 6379 natively. Required for Password OTP logic.)

---

## 1. Running the Backend Server (Express/Node)

The backend acts as the core REST API that serves both web and mobile variations.

1. Open a new terminal.
2. Navigate into the backend directory:
   ```bash
   cd meditrack-backend
   ```
3. Create a `.env` file containing fundamental environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/meditrack
   JWT_SECRET=your_super_secret_jwt_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```
4. Install exactly dependencies using NPM:
   ```bash
   npm install
   ```
5. Boot up the server:
   ```bash
   npm run dev
   # Or "node server.js"
   ```
You should observe console logs confirming Database Connection, Redis connectivity, and the Cron reminder job initializing!

---

## 2. Running the Web Frontend (React/Vite)

The dashboard interfaces cleanly with the running backend.

1. Open a **second** isolated terminal window.
2. Navigate precisely into the frontend workspace:
   ```bash
   cd meditrack-frontend
   ```
3. Initialize the NPM packages initially:
   ```bash
   npm install
   ```
4. Start the Vite development hot-reload server:
   ```bash
   npm run dev
   ```
*(Note: I noticed your frontend development server is currently already running! You can view it live in your browser at `http://localhost:5173`)*

---

## 3. Running the Mobile Application (React Native Expo)

If you wish to view and run the mobile ecosystem scaffold:

1. Open a **third** isolated terminal map.
2. Target the newly created mobile folder:
   ```bash
   cd meditrack-mobile
   ```
3. Guarantee its specific expo dependencies are structured safely:
   ```bash
   npm install
   ```
4. Instantiate the Metro Bundler logic mapping native devices:
   ```bash
   npx expo start
   # Or simply: npm start
   ```
You can download the **Expo Go** application on your iOS/Android phone. Simply scan the QR code that generates identically in your command-line terminal to load the application directly to your actual device, or press `a`/`i` to launch an Android/iOS emulator!
