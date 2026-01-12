# Online Polling and Survey Website - Backend

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Change to a strong secret key
     - `PORT`: Server port (default: 5000)
     - `CLIENT_URL`: Frontend URL (default: http://localhost:5173)

### Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

#### Polls
- `GET /api/polls` - Get all polls
- `GET /api/polls/:id` - Get single poll
- `POST /api/polls` - Create poll (Protected)
- `POST /api/polls/:id/vote` - Vote on poll (Protected)
- `GET /api/polls/user/created` - Get user's polls (Protected)
- `DELETE /api/polls/:id` - Delete poll (Protected)

### WebSocket Events

#### Client → Server
- `join_poll` - Join a poll room
- `leave_poll` - Leave a poll room
- `vote_on_poll` - Cast vote in real-time
- `request_poll_data` - Request current poll data

#### Server → Client
- `vote_update` - Broadcast vote updates
- `vote_success` - Vote successful
- `vote_error` - Vote error
- `poll_data_update` - Poll data response
- `poll_data_error` - Poll data error

### Features Implemented
✅ User Authentication (JWT)
✅ Create Polls with Expiration
✅ Real-Time Voting (WebSocket)
✅ Vote Tracking & Results
✅ Anonymous Voting Option
✅ Multiple/Single Choice Polls
