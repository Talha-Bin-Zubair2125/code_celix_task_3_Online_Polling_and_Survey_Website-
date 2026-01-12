import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PollsList.css';

const API_URL = 'http://localhost:5000/api';

export const PollsList = ({ onSelectPoll }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPolls();
  }, [category, status, search]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const response = await axios.get(`${API_URL}/polls?${params.toString()}`);
      setPolls(response.data.polls);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="polls-list-container">
      <div className="filters">
        <input
          type="text"
          placeholder="Search polls..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="Sports">Sports</option>
          <option value="Politics">Politics</option>
          <option value="Technology">Technology</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="filter-select"
        >
          <option value="active">Active Polls</option>
          <option value="closed">Closed Polls</option>
          <option value="all">All Polls</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading polls...</div>
      ) : polls.length === 0 ? (
        <div className="no-polls">No polls found. Be the first to create one!</div>
      ) : (
        <div className="polls-grid">
          {polls.map(poll => (
            <div
              key={poll._id}
              className={`poll-card ${poll.isExpired ? 'expired' : ''}`}
              onClick={() => onSelectPoll(poll._id)}
            >
              <div className="poll-card-header">
                <h3>{poll.question}</h3>
                <span className={`badge ${poll.isExpired ? 'closed' : 'active'}`}>
                  {poll.isExpired ? 'Closed' : 'Active'}
                </span>
              </div>

              {poll.description && (
                <p className="poll-card-description">{poll.description.substring(0, 100)}...</p>
              )}

              <div className="poll-card-stats">
                <span className="category-badge">{poll.category}</span>
                <span className="votes">Votes: {poll.totalVotes}</span>
              </div>

              <div className="poll-card-footer">
                <small className="creator">By {poll.creatorName}</small>
                <small className="date">
                  {new Date(poll.expiresAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
