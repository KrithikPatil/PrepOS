# 🎯 PrepOS - AI-Powered CAT Exam Preparation Platform

<div align="center">

![PrepOS Logo](https://img.shields.io/badge/PrepOS-CAT%202025-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47a248?style=flat-square&logo=mongodb)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285f4?style=flat-square&logo=google)

**Intelligent exam preparation with multi-agent AI analysis**

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
  - [Linux/macOS](#linuxmacos-setup)
  - [Windows](#windows-setup)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [AI Agents](#-ai-agents)

---

## ✨ Features

- 🧠 **4 AI Agents** - Architect, Detective, Tutor, Strategist
- 📝 **CAT Mock Tests** - Full-length and sectional tests
- 📊 **Performance Analytics** - Section-wise and topic-wise analysis
- 🗺️ **Personalized Roadmap** - AI-generated study plans
- 🔐 **Google OAuth** - Secure authentication
- 🎨 **Premium Dark UI** - Modern, responsive design

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, CSS3, React Router |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Database | MongoDB 7.x |
| AI | Google Gemini (gemini-2.5-pro, gemini-2.5-flash) |
| Auth | Google OAuth 2.0, JWT |

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/KrithikPatil/PrepOS.git
cd PrepOS

# Install frontend
npm install

# Setup backend
cd server
python -m venv venv
source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Start both servers
cd ..
npm start &
cd server && python -m uvicorn main:app --port 3001
```

---

## 📖 Detailed Setup

### Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **MongoDB** 7.x (local or Atlas)
- **Git**

---

### Linux/macOS Setup

#### 1. Install Prerequisites

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm python3 python3-pip python3-venv mongodb-org git

# macOS (with Homebrew)
brew install node python@3.11 mongodb-community git
```

#### 2. Clone Repository

```bash
git clone https://github.com/KrithikPatil/PrepOS.git
cd PrepOS
```

#### 3. Setup Frontend

```bash
# Install Node dependencies
npm install

# Verify installation
npm --version
```

#### 4. Setup Backend

```bash
# Navigate to server
cd server

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python --version
pip list
```

#### 5. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
nano .env
```

**Required variables in `server/.env`:**
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-key-here

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Google OAuth (optional for dev)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### 6. Start MongoDB

```bash
# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb-community
```

#### 7. Run Database Migration

```bash
cd server
source venv/bin/activate
python -m db.migrate
```

#### 8. Start Servers

**Terminal 1 - Backend:**
```bash
cd PrepOS/server
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd PrepOS
npm start
```

#### 9. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Docs: http://localhost:3001/docs

---

### Windows Setup

#### 1. Install Prerequisites

**Option A: Using Chocolatey (Recommended)**
```powershell
# Install Chocolatey first (Run PowerShell as Admin)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install dependencies
choco install nodejs python311 mongodb git -y
```

**Option B: Manual Installation**
- Node.js: https://nodejs.org/
- Python 3.11: https://www.python.org/downloads/
- MongoDB: https://www.mongodb.com/try/download/community
- Git: https://git-scm.com/download/win

#### 2. Clone Repository

```powershell
git clone https://github.com/KrithikPatil/PrepOS.git
cd PrepOS
```

#### 3. Setup Frontend

```powershell
# Install Node dependencies
npm install
```

#### 4. Setup Backend

```powershell
# Navigate to server
cd server

# Create Python virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

#### 5. Configure Environment

```powershell
# Copy example env file
copy .env.example .env

# Edit with notepad or your editor
notepad .env
```

Fill in the same variables as shown in the Linux section.

#### 6. Start MongoDB

```powershell
# If installed as a service, it should auto-start
# Or start manually:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

#### 7. Run Database Migration

```powershell
cd server
.\venv\Scripts\activate
python -m db.migrate
```

#### 8. Start Servers

**Terminal 1 - Backend (PowerShell):**
```powershell
cd PrepOS\server
.\venv\Scripts\activate
python -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

**Terminal 2 - Frontend (PowerShell):**
```powershell
cd PrepOS
npm start
```

#### 9. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

---

## 📁 Project Structure

```
PrepOS/
├── public/                 # Static assets
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (Auth, Theme)
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   └── hooks/              # Custom React hooks
├── server/                 # Python backend
│   ├── agents/             # AI agents (Architect, Detective, etc.)
│   ├── api/routes/         # FastAPI route handlers
│   ├── config/             # App configuration
│   └── db/                 # Database models and migrations
├── .env.example            # Environment template
└── README.md               # This file
```

---

## 🔌 API Documentation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/google` | GET | Start Google OAuth |
| `/api/auth/dev-login` | POST | Dev login (debug mode) |
| `/api/tests/` | GET | List available tests |
| `/api/tests/{id}` | GET | Get test with questions |
| `/api/tests/{id}/submit` | POST | Submit test answers |
| `/api/agents/analyze` | POST | Start AI analysis |
| `/api/students/profile` | GET | Get user profile |
| `/api/students/roadmap` | GET | Get study roadmap |

Full API docs: http://localhost:3001/docs

---

## 🤖 AI Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| **Architect** | gemini-2.5-pro | Generates personalized practice questions |
| **Detective** | gemini-2.5-flash | Analyzes mistakes and time patterns |
| **Tutor** | gemini-2.5-pro | Provides Socratic explanations |
| **Strategist** | gemini-2.5-flash | Creates personalized roadmaps |

---

## 🔑 Getting API Keys

### Gemini API Key
1. Go to https://aistudio.google.com/apikey
2. Create a new API key
3. Add to `server/.env` as `GEMINI_API_KEY`

### Google OAuth (Optional)
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add credentials to `server/.env`

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
Made with ❤️ for CAT aspirants
</div>
