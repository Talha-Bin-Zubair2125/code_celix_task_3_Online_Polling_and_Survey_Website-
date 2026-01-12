# Online Polling and Survey Website

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Setup Steps

#### 1. Backend Setup
```bash
cd backend
npm install
```

Configure `.env` file with your MongoDB URI and JWT secret.

Start the backend server:
```bash
npm run dev
```
Server runs on: http://localhost:5000

#### 2. Frontend Setup
```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

### 📋 Completed Features (Your Assignment)

#### ✅ Feature 1: User Authentication
- User registration with validation
- JWT-based login system
- Secure password hashing (bcryptjs)
- Protected routes with middleware
- Session management with token storage

#### ✅ Feature 2: Create Polls/Surveys
- Create polls with question & description
- Multiple answer options (minimum 2)
- Set expiration date and time
- Single choice or multiple choice polls
- Category selection
- Automatic poll deactivation after expiration

#### ✅ Feature 3: Real-Time Voting
- WebSocket integration using Socket.io
- Real-time vote updates for all users
- Live results visualization (Bar/Pie charts)
- Join/leave poll rooms
- Duplicate vote prevention
- Anonymous voting option

### 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io (WebSocket)
- JWT Authentication
- bcryptjs

**Frontend:**
- React 19.2
- Vite
- Socket.io Client
- Axios
- Chart.js + React-Chartjs-2

### 📁 Project Structure

```
task/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── middlewares/    # Auth middleware
│   ├── sockets/        # WebSocket handlers
│   ├── index.js        # Server entry point
│   ├── .env           # Environment variables
│   └── package.json    # Dependencies
│
└── frontend/
    ├── src/
    │   ├── component/  # React components
    │   ├── context/    # Auth & Socket contexts
    │   ├── pages/      # Page components
    │   └── styles/     # CSS files
    ├── index.html
    └── package.json    # Dependencies
```

### 🧪 Testing Your Features

1. **Test Authentication:**
   - Register a new account
   - Login with credentials
   - Verify token storage in localStorage

2. **Test Poll Creation:**
   - Create a poll with 2+ options
   - Set expiration date in future
   - Try single/multiple choice
   - Verify poll appears in list

3. **Test Real-Time Voting:**
   - Open poll in multiple browser tabs
   - Vote in one tab
   - Watch real-time updates in other tabs
   - Check live chart updates
   - Test anonymous voting

### 🔑 Environment Variables

Backend `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/polling-app
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 📊 API Endpoints

**Authentication:**
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

**Polls:**
- GET `/api/polls` - Get all polls
- POST `/api/polls` - Create poll
- GET `/api/polls/:id` - Get single poll
- POST `/api/polls/:id/vote` - Vote on poll
- GET `/api/polls/user/created` - Get user's polls
- DELETE `/api/polls/:id` - Delete poll

**WebSocket Events:**
- `join_poll` - Join poll room
- `leave_poll` - Leave poll room
- `vote_on_poll` - Cast vote
- `vote_update` - Receive updates
- `vote_success` - Vote confirmed
- `vote_error` - Error message

### ✨ Your Implementation Highlights

1. **Secure Authentication:** JWT tokens with proper validation
2. **Data Validation:** Input validation on both frontend & backend
3. **Real-Time Updates:** Socket.io for instant vote broadcasting
4. **Visual Results:** Chart.js integration for data visualization
5. **Expiration Management:** Automatic poll closure system
6. **Flexible Voting:** Support for both single & multiple choice
7. **Vote Tracking:** Prevents duplicate votes per user
8. **Anonymous Option:** Privacy-focused voting feature

---

**Status:** All 3 assigned features are fully implemented and ready for testing! 🎉
