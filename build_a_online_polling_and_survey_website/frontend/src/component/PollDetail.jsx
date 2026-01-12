import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import '../styles/PollDetail.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = 'http://localhost:5000/api';

export const PollDetail = ({ pollId, onClose }) => {
  const [poll, setPoll] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { token, user } = useAuth();
  const { socket } = useSocket();

  const pollUrl = `${window.location.origin}/poll/${pollId}`;

  /* ================= FETCH POLL ================= */
  useEffect(() => {
    fetchPoll();

    if (socket) {
      socket.emit('join_poll', pollId);
      socket.on('vote_update', handleVoteUpdate);

      return () => {
        socket.emit('leave_poll', pollId);
        socket.off('vote_update', handleVoteUpdate);
      };
    }
  }, [pollId, socket]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/polls/${pollId}`);
      setPoll(res.data.poll);
    } catch {
      setError('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  /* ================= SOCKET UPDATE ================= */
  const handleVoteUpdate = (data) => {
    if (data.pollId === pollId) {
      setPoll(prev => ({
        ...prev,
        totalVotes: data.totalVotes,
        answers: prev.answers.map(a => {
          const updated = data.results.find(r => r.id === a._id);
          return updated ? { ...a, votes: Number(updated.votes) } : a;
        })
      }));
    }
  };

  /* ================= VOTE ================= */
  const handleVote = async () => {
    if (!selectedAnswers.length) {
      setError('Please select at least one option');
      return;
    }

    setVoting(true);
    setError('');

    try {
      if (socket && token) {
        socket.emit('vote_on_poll', {
          pollId,
          answerIds: selectedAnswers,
          isAnonymous
        });

        socket.once('vote_success', () => {
          setSuccess('Vote submitted!');
          setHasVoted(true);
          setSelectedAnswers([]);
        });

        socket.once('vote_error', d => setError(d.message));
      } else {
        const res = await axios.post(
          `${API_URL}/polls/${pollId}/vote`,
          { answerIds: selectedAnswers, isAnonymous },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPoll(prev => ({
          ...prev,
          totalVotes: res.data.pollResults.reduce((sum, r) => sum + Number(r.votes), 0),
          answers: prev.answers.map(a => {
            const updated = res.data.pollResults.find(r => r.id === a._id);
            return updated ? { ...a, votes: Number(updated.votes) } : a;
          })
        }));

        setHasVoted(true);
        setSelectedAnswers([]);
        setSuccess('Vote submitted!');
      }
    } catch {
      setError('Voting failed');
    } finally {
      setVoting(false);
    }
  };

  /* ================= DELETE POLL (ADMIN) ================= */
  const handleDeletePoll = async () => {
    if (!window.confirm('Delete this poll permanently?')) return;

    try {
      await axios.delete(`${API_URL}/polls/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Poll deleted');
      onClose();
    } catch {
      setError('Failed to delete poll');
    }
  };

  /* ================= HELPERS ================= */
  const toggleAnswer = (id) => {
    if (!poll.allowMultiple) setSelectedAnswers([id]);
    else {
      setSelectedAnswers(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  if (loading) return <div className="poll-loading">Loading poll...</div>;
  if (!poll) return <div className="poll-loading">Poll not found</div>;

  const isExpired = poll.isExpired || new Date(poll.expiresAt) <= new Date();

  const chartData = {
    labels: poll.answers.map(a => a.text),
    datasets: [{
      label: 'Votes',
      data: poll.answers.map(a => Number(a.votes)),
      backgroundColor: [
        'rgba(54,162,235,0.7)',
        'rgba(75,192,192,0.7)',
        'rgba(153,102,255,0.7)',
        'rgba(255,159,64,0.7)',
        'rgba(255,99,132,0.7)',
        'rgba(255,206,86,0.7)'
      ]
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    indexAxis: 'y'
  };

  /* ================= UI ================= */
  return (
    <div className="poll-detail-container">
      <button className="close-btn" onClick={onClose}>×</button>

      <div className="poll-detail-card">
        <h2 className="poll-question">{poll.question}</h2>
        {poll.description && <p className="poll-description">{poll.description}</p>}

        <div className="poll-meta">
          <span className="poll-category">{poll.category}</span>
          <span className={`poll-status ${isExpired ? 'closed' : 'active'}`}>
            {isExpired ? 'Closed' : 'Active'}
          </span>
          <span className="poll-total-votes">Total Votes: {poll.totalVotes}</span>
        </div>

        {/* SHARE */}
        <div className="poll-share">
          <button onClick={() => navigator.clipboard.writeText(pollUrl)}>Copy Link</button>
          <a href={`https://wa.me/?text=Vote here: ${pollUrl}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${pollUrl}`} target="_blank" rel="noreferrer">Facebook</a>
        </div>

        {/* ADMIN */}
        {user?.role === 'admin' && (
          <button className="delete-poll-btn" onClick={handleDeletePoll}>Delete Poll</button>
        )}

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {/* VOTING */}
        {!isExpired && token && !hasVoted && (
          <div className="voting-section">
            {poll.answers.map(a => (
              <label key={a._id} className="answer-option">
                <input
                  type={poll.allowMultiple ? 'checkbox' : 'radio'}
                  checked={selectedAnswers.includes(a._id)}
                  onChange={() => toggleAnswer(a._id)}
                />
                <span>{a.text}</span>
              </label>
            ))}

            <label className="anonymous-checkbox">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              Vote anonymously
            </label>

            <button className="vote-btn" onClick={handleVote} disabled={voting || !selectedAnswers.length}>
              {voting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        )}

        {/* RESULTS */}
        {(hasVoted || isExpired || !token) && (
          <div className="chart-wrapper">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};
