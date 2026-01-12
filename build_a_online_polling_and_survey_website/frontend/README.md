# Online Polling and Survey Website - Frontend

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API URL:
   - The API URL is set to `http://localhost:5000/api` in the components
   - Update if your backend runs on a different port

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Features Implemented

✅ User Authentication (Login/Register)
✅ Create Polls with Multiple Options
✅ Real-Time Voting with WebSocket
✅ Live Results Visualization (Bar/Pie Charts)
✅ Poll Expiration Management
✅ Anonymous Voting Option
✅ Multiple/Single Choice Support

### Project Structure

```
src/
├── component/
│   ├── CreatePoll.jsx    # Poll creation form
│   ├── PollDetail.jsx    # Poll details & voting
│   └── PollsList.jsx     # List all polls
├── context/
│   ├── AuthContext.jsx   # Authentication state
│   └── SocketContext.jsx # WebSocket connection
├── pages/
│   └── AuthPage.jsx      # Login/Register page
├── styles/               # Component styles
└── App.jsx              # Main app component
```

### Technologies Used

- React 19.2
- Vite (Build tool)
- Axios (HTTP client)
- Socket.io Client (Real-time)
- Chart.js & React-Chartjs-2 (Visualizations)

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

