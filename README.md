# Personalized Learning & Certification Planner

A comprehensive full-stack application for creating personalized learning roadmaps, recommending certifications, and tracking learning progress. Built with React Native (Expo), Next.js, Node.js, and PostgreSQL.

## 🚀 Features

- **User Onboarding**: Collect user background, skills, goals, and time availability
- **AI-Powered Roadmaps**: Generate personalized study roadmaps using OpenAI GPT-4
- **Certification Recommendations**: Get tailored certification suggestions with explanations
- **YouTube Integration**: Automatically curate relevant videos and playlists for each topic
- **Progress Tracking**: Track weekly learning progress with detailed analytics
- **Multi-Platform**: Web dashboard (Next.js) and mobile app (React Native/Expo)

---

## 🚀 Quick Start

**For deployment and setup instructions, see [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)**

This guide covers:
- Deploying backend to Render
- Setting up Firebase Authentication
- Configuring mobile and web apps
- Complete step-by-step instructions

---

## 📚 Complete Beginner's Guide - Step by Step Installation

This guide will walk you through everything you need to install and set up this project from scratch, even if you've never done this before!

### Step 1: Install Required Software

#### 1.1 Install Node.js (Required)

**What is Node.js?** It's a runtime that lets you run JavaScript on your computer.

**How to install:**
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (Long Term Support - the stable one)
3. Run the installer and follow the instructions
4. **Important**: Check the box that says "Automatically install necessary tools" if prompted
5. Restart your computer after installation

**Verify installation:**
- Open **Command Prompt** (Windows) or **Terminal** (Mac/Linux)
- Type: `node --version`
- You should see something like `v20.x.x`
- Type: `npm --version`
- You should see something like `10.x.x`

✅ **If you see version numbers, you're good to go!**

#### 1.2 Install Git (Required)

**What is Git?** It's a version control system that helps manage code.

**How to install:**
1. Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Download for your operating system
3. Run the installer
4. **Important**: Use default settings during installation
5. Restart your computer

**Verify installation:**
- Open Command Prompt or Terminal
- Type: `git --version`
- You should see something like `git version 2.x.x`

✅ **If you see a version number, you're good!**

#### 1.3 Install Docker Desktop (Optional - for easier backend setup)

**What is Docker?** It packages applications so they run the same way everywhere.

**How to install:**
1. Go to [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Download Docker Desktop for your OS
3. Install and restart your computer
4. Open Docker Desktop and make sure it's running (you'll see a whale icon in your system tray)

**Note**: You can also run the backend without Docker (we'll show you how).

---

### Step 2: Get API Keys

You'll need two API keys for this project to work:

#### 2.1 Get OpenAI API Key

**What is this?** This is used to generate personalized learning roadmaps using AI.

**How to get it:**
1. Go to [https://platform.openai.com/](https://platform.openai.com/)
2. Click **"Sign up"** to create an account (or **"Log in"** if you have one)
3. Once logged in, click your profile icon (top right) → **"View API keys"**
4. Click **"Create new secret key"**
5. **Copy the key immediately** - you won't see it again!
6. Save it somewhere safe (we'll use it later)

**Cost**: OpenAI charges per use. The free tier gives you $5 credit to start.

#### 2.2 Get YouTube Data API Key

**What is this?** This is used to find and curate YouTube videos for learning.

**How to get it:**
1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click the project dropdown (top left) → **"New Project"**
4. Name it "Learning Planner" → Click **"Create"**
5. Wait a few seconds, then select your new project from the dropdown
6. Go to **"APIs & Services"** → **"Library"** (left sidebar)
7. Search for **"YouTube Data API v3"**
8. Click on it → Click **"Enable"**
9. Go to **"APIs & Services"** → **"Credentials"**
10. Click **"Create Credentials"** → **"API Key"**
11. **Copy the API key** - save it somewhere safe

**Cost**: YouTube API is free with generous quotas (10,000 requests per day).

---

### Step 3: Set Up Render PostgreSQL Database

**What is Render?** It's a cloud platform that hosts databases and applications for free.

**Why Render?** It's free, easy to use, and perfect for learning projects.

#### 3.1 Create Render Account

1. Go to [https://render.com/](https://render.com/)
2. Click **"Get Started for Free"**
3. Sign up with your email or GitHub account
4. Verify your email if needed

#### 3.2 Create PostgreSQL Database

1. Once logged in, click **"New +"** button (top right)
2. Select **"PostgreSQL"**
3. Fill in the form:
   - **Name**: `learning-planner-db` (or any name you like)
   - **Database**: `learning_planner` (or leave default)
   - **User**: Leave default (or choose your own)
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 15 (or latest)
   - **Plan**: **Free** (perfect for learning!)
4. Click **"Create Database"**
5. Wait 2-3 minutes for it to be created

#### 3.3 Get Database Connection Details

1. Once created, click on your database name
2. You'll see connection details. Look for:
   - **Internal Database URL** (we'll use this)
   - Or individual fields:
     - **Host**: Something like `dpg-xxxxx-a.render.com`
     - **Port**: `5432`
     - **Database name**: Usually `learning_planner` or similar
     - **User**: Your database user
     - **Password**: Your database password (click "Show" to reveal)

**Important**: Copy these details - you'll need them in the next step!

---

### Step 4: Set Up the Project

#### 4.1 Download/Clone the Project

**Option A: If you have the project folder already**
- Navigate to the project folder in File Explorer (Windows) or Finder (Mac)

**Option B: If you need to clone from Git**
- Open Command Prompt or Terminal
- Navigate to where you want the project: `cd Desktop` (or your preferred location)
- Clone the project: `git clone <repository-url>`
- Navigate into it: `cd "Ai Study Planner"`

#### 4.2 Configure Backend Environment Variables

**Easy Way (Recommended):**
1. Navigate to the `backend` folder
2. **Copy the template file** to `.env`:
   - **Windows**: `copy env.template .env` (in Command Prompt)
   - **Mac/Linux**: `cp env.template .env` (in Terminal)
3. Your `.env` file is now ready with all your API keys and database connection!

**Manual Way:**
1. Navigate to the `backend` folder
2. **Create a new file** named `.env`
   - On Windows: Right-click → New → Text Document → Rename to `.env` (make sure to show file extensions)
   - On Mac/Linux: `touch .env` in terminal
3. Open the `.env` file with a text editor (Notepad, VS Code, etc.)
4. Copy the content from `env.template` or see the example below

5. Fill in your values (your actual credentials are already in `backend/env.template` - just copy it to `.env`):

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration - Using Render PostgreSQL External URL
# Get this from your Render PostgreSQL database dashboard
DATABASE_URL=postgresql://username:password@host:port/database

# Alternative: Individual parameters (uncomment if you prefer)
# DB_HOST=your-database-host
# DB_PORT=5432
# DB_NAME=your-database-name
# DB_USER=your-database-user
# DB_PASSWORD=your-database-password

# JWT Configuration
JWT_SECRET=
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=

# YouTube API Configuration
YOUTUBE_API_KEY=

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:8081
```

**Quick Setup**: Your credentials are already configured! Just copy `backend/env.template` to `backend/.env`:
- **Windows**: `copy backend\env.template backend\.env`
- **Mac/Linux**: `cp backend/env.template backend/.env`

**Important Notes:**
- ✅ Your API keys and database connection are already set up in the template
- ✅ The connection string uses Render's Internal Database URL (perfect for deployment)
- 🔒 Never commit the `.env` file to GitHub (it's already in .gitignore)

6. **Save the file**

#### 4.3 Install Backend Dependencies

1. Open Command Prompt or Terminal
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   This will take 1-2 minutes. You'll see lots of text scrolling - that's normal!

4. Run database migrations (creates tables):
   ```bash
   npm run migrate
   ```
   You should see: "Database migration completed successfully"

✅ **If you see success messages, your backend is set up!**

#### 4.4 Start the Backend Server

**Choose one option:**

**Option A: Deploy to Render (Recommended - Backend runs online)**
👉 **Skip to [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions**
- Your backend will run online 24/7
- Apps can connect from anywhere
- No need to keep your computer running

**Option B: Run Locally (For Testing)**
1. Make sure you're in the `backend` folder
2. Run:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```
3. You should see: "Server running on port 3001"
4. **Keep this terminal window open!** The server needs to keep running.

✅ **Your backend is now running locally!**

**Note**: If you deploy to Render, you can skip the local setup and go straight to deployment.

---

### Step 5: Set Up Web Dashboard

#### 5.1 Configure Web Environment

1. Navigate to the `web` folder
2. Create a new file named `.env.local`
3. Open it and add:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
4. Save the file

#### 5.2 Install Web Dependencies

1. Open a **new** Command Prompt or Terminal window
2. Navigate to the web folder:
   ```bash
   cd web
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   This will take 2-3 minutes.

#### 5.3 Configure Web Dashboard

**If using online backend (Render):**
1. Make sure `web/.env.local` has:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
   Replace with your actual Render backend URL

**If using local backend:**
1. Make sure `web/.env.local` has:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

#### 5.4 Start Web Dashboard

1. Still in the `web` folder, run:
   ```bash
   npm run dev
   ```
2. You should see: "Ready on http://localhost:3000"
3. Open your web browser
4. Go to: [http://localhost:3000](http://localhost:3000)

✅ **Your web dashboard should now be open in your browser!**

---

### Step 6: Set Up Mobile App (Optional)

#### 6.1 Install Expo CLI

1. Open a **new** terminal window
2. Install Expo CLI globally:
   ```bash
   npm install -g expo-cli
   ```

#### 6.2 Configure Mobile App API URL

1. Navigate to `mobile/src/config/api.ts`
2. Open the file
3. **If using online backend (Render - Recommended):**
   - Update the production URL:
   ```typescript
   const API_URL = __DEV__ 
     ? 'http://localhost:3001'  // Local development
     : 'https://your-backend.onrender.com'; // UPDATE THIS with your Render URL
   ```

4. **If using local backend:**
   - For testing on your phone:
     - Find your computer's IP address:
       - Windows: Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
       - Mac/Linux: Open Terminal, type `ifconfig`, look for "inet"
     - Update: `const API_URL = 'http://YOUR_IP_ADDRESS:3001';`
     - Example: `const API_URL = 'http://192.168.1.100:3001';`
   - For iOS Simulator: Keep `http://localhost:3001`
   - For Android Emulator: Use `http://10.0.2.2:3001`

#### 6.3 Install Mobile Dependencies

1. Navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

#### 6.4 Start Mobile App

1. Still in the `mobile` folder, run:
   ```bash
   npm start
   ```
2. You'll see a QR code in the terminal
3. **Option A: Use Expo Go app on your phone**
   - Install "Expo Go" from App Store (iOS) or Play Store (Android)
   - Scan the QR code with the app
   - The app will load on your phone

4. **Option B: Use Simulator/Emulator**
   - Press `i` for iOS simulator (Mac only)
   - Press `a` for Android emulator (requires Android Studio)

✅ **Your mobile app should now be running!**

---

## 🎉 You're All Set!

Now you should have:
- ✅ Backend API running (locally or on Render)
- ✅ Web dashboard running on port 3000
- ✅ Mobile app running (optional)

### Test the Application

1. **Open the web dashboard**: [http://localhost:3000](http://localhost:3000)
2. **Create an account**: Click "Sign Up" and create a new account
3. **Complete your profile**: Fill in your background, skills, and goals
4. **Generate a roadmap**: Click "Generate Roadmap" and wait (it uses AI, so it takes 10-30 seconds)
5. **Explore**: Check out certifications, progress tracking, and YouTube resources!

### 🚀 Next Step: Deploy Backend Online

**Want your apps to work from anywhere?** Deploy your backend to Render!

👉 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions**

This will let you:
- Access your app from any device
- Share it with friends
- Use it without keeping your computer running

---

## 📁 Project Structure

```
Ai Study Planner/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # LLM and YouTube services
│   │   ├── database/ # Database schema and migrations
│   │   └── middleware/ # Auth middleware
│   └── Dockerfile
├── web/              # Next.js web dashboard
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   └── lib/          # Utilities and API client
├── mobile/           # React Native Expo app
│   └── src/
│       ├── screens/  # App screens
│       ├── context/  # React context providers
│       └── config/   # API configuration
└── docker-compose.yml # Docker orchestration (optional)
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express
- **PostgreSQL** database (hosted on Render)
- **OpenAI API** for roadmap generation
- **YouTube Data API** for video curation
- **JWT** authentication

### Web Dashboard
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** for data visualization

### Mobile App
- **React Native** with Expo
- **TypeScript**
- **React Navigation**

---

## 🔧 Common Commands Reference

### Backend Commands
```bash
cd backend
npm install          # Install dependencies (first time only)
npm run migrate      # Create database tables
npm start            # Start server
npm run dev          # Start with auto-reload
```

### Web Dashboard Commands
```bash
cd web
npm install          # Install dependencies (first time only)
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

### Mobile App Commands
```bash
cd mobile
npm install          # Install dependencies (first time only)
npm start            # Start Expo development server
npm run android      # Start Android emulator
npm run ios          # Start iOS simulator (Mac only)
```

---

## 🆘 Troubleshooting

### "npm: command not found"
- **Problem**: Node.js is not installed or not in PATH
- **Solution**: Reinstall Node.js and restart your computer

### "Cannot connect to database"
- **Problem**: Database credentials are wrong or Render database is paused
- **Solution**: 
  - Check your `.env` file has correct Render database credentials
  - Go to Render dashboard and make sure your database is running (not paused)
  - Free Render databases pause after 90 days of inactivity - just click "Resume"

### "Port 3001 already in use"
- **Problem**: Another application is using port 3001
- **Solution**: 
  - Close other applications using that port
  - Or change the port in `backend/.env`: `PORT=3002` (and update web `.env.local` too)

### "OpenAI API error"
- **Problem**: API key is wrong or you've run out of credits
- **Solution**:
  - Check your API key in `backend/.env`
  - Go to [OpenAI Usage](https://platform.openai.com/usage) to check your credits

### "YouTube API error"
- **Problem**: API key is wrong or quota exceeded
- **Solution**:
  - Check your API key in `backend/.env`
  - Make sure YouTube Data API v3 is enabled in Google Cloud Console

### Backend won't start
- **Problem**: Dependencies not installed or database connection failed
- **Solution**:
  - Run `npm install` in the backend folder
  - Check your `.env` file has all required values
  - Make sure Render database is running

### Web dashboard shows errors
- **Problem**: Backend is not running or API URL is wrong
- **Solution**:
  - Make sure backend is running on port 3001
  - Check `web/.env.local` has correct `NEXT_PUBLIC_API_URL`
  - Open browser console (F12) to see specific errors

### Mobile app can't connect
- **Problem**: Wrong API URL or backend not accessible
- **Solution**:
  - Make sure backend is running
  - Check `mobile/src/config/api.ts` has correct URL
  - For phone testing, use your computer's IP address (not localhost)
  - Make sure phone and computer are on the same WiFi network

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User Profile
- `GET /api/users/profile` - Get user profile
- `POST /api/users/profile` - Create/update profile

### Roadmaps
- `GET /api/roadmaps` - Get all roadmaps
- `GET /api/roadmaps/:id` - Get roadmap by ID
- `POST /api/roadmaps/generate` - Generate new roadmap

### Certifications
- `GET /api/certifications/recommended` - Get recommended certifications
- `PATCH /api/certifications/:id/status` - Update certification status

### Progress
- `POST /api/progress/topic` - Log topic progress
- `GET /api/progress/roadmap/:id` - Get roadmap progress
- `POST /api/progress/weekly` - Update weekly progress
- `GET /api/progress/weekly/:id` - Get weekly progress

### YouTube
- `GET /api/youtube/topic/:topicId` - Get resources for topic
- `GET /api/youtube/search/:topicId` - Search and save resources

---

## 🗄️ Database Schema

The database includes the following main tables:
- `users` - User accounts
- `user_profiles` - User background and preferences
- `roadmaps` - Generated learning roadmaps
- `roadmap_topics` - Topics within roadmaps
- `certifications` - Available certifications
- `user_certifications` - User certification recommendations
- `youtube_resources` - Curated YouTube videos/playlists
- `learning_progress` - Topic-level progress tracking
- `weekly_progress` - Weekly progress summaries

---

## 🚀 Deploy Backend Online (Recommended Setup)

**Want your backend to run online so your apps work from anywhere?** 

We've created a complete deployment guide! 

👉 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions**

### Quick Overview:

1. **Deploy Backend to Render** (Free tier available!)
   - Connect your GitHub repository
   - Render automatically builds and deploys
   - Get a URL like: `https://your-backend.onrender.com`

2. **Update Your Apps**:
   - **Web**: Update `web/.env.local` with your Render backend URL
   - **Mobile**: Update `mobile/src/config/api.ts` with your Render backend URL

3. **That's it!** Your apps now connect to the online backend.

### Why Deploy Online?

✅ **Access from anywhere** - No need to run backend on your computer  
✅ **Share with others** - Friends can use your app  
✅ **Always available** - Backend runs 24/7 (on paid plans)  
✅ **Production ready** - Real-world setup  

**Note**: Free Render tier may spin down after inactivity, but it's perfect for learning and testing!

---

## 🚢 Production Deployment (Advanced)

### Backend
1. Deploy to Render, Heroku, or similar platform
2. Set environment variables in your hosting platform
3. Make sure `NODE_ENV=production`
4. Update CORS_ORIGIN with your production URLs
5. **See DEPLOYMENT.md for detailed instructions**

### Web Dashboard
1. Deploy to Vercel (recommended for Next.js):
   - Connect your GitHub repository
   - Vercel will auto-detect Next.js
   - Add environment variable: `NEXT_PUBLIC_API_URL=your-backend-url`
2. Or deploy to Netlify, Railway, etc.

### Mobile App
1. Build with EAS Build: `eas build`
2. Submit to App Store / Play Store
3. Update API URL to production backend

---

## 📞 Need Help?

If you're stuck:
1. Check the Troubleshooting section above
2. Make sure all steps were followed correctly
3. Check that all services are running
4. Look at error messages in the terminal/console
5. Verify all API keys and database credentials are correct

---

## 📄 License

MIT License

---

**Built with ❤️ for learners, by learners.**

Happy coding! 🚀
