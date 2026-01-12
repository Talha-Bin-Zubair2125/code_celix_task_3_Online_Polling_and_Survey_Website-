import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Login, Register } from './pages/AuthPage';
import { CreatePoll } from './component/CreatePoll';
import { PollsList } from './component/PollsList';
import { PollDetail } from './component/PollDetail';
import './App.css';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('browse');
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePollCreated = () => {
    setCurrentView('browse');
    setRefreshKey(prev => prev + 1);
  };

  const handleSelectPoll = (pollId) => {
    setSelectedPollId(pollId);
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>📊 Polling & Survey Platform</h1>
        </header>
        {authMode === 'login' ? (
          <Login onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📊 Polling & Survey Platform</h1>
        <div className="header-right">
          <span className="user-info">Welcome, {user?.username}!</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${currentView === 'browse' ? 'active' : ''}`}
          onClick={() => setCurrentView('browse')}
        >
          Browse Polls
        </button>
        <button
          className={`nav-btn ${currentView === 'create' ? 'active' : ''}`}
          onClick={() => setCurrentView('create')}
        >
          Create Poll
        </button>
      </nav>

      <main className="app-main">
        {currentView === 'browse' && (
          <div key={refreshKey}>
            <PollsList onSelectPoll={handleSelectPoll} />
          </div>
        )}
        {currentView === 'create' && (
          <CreatePoll onPollCreated={handlePollCreated} />
        )}
      </main>

      {selectedPollId && (
        <PollDetail
          pollId={selectedPollId}
          onClose={() => setSelectedPollId(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
