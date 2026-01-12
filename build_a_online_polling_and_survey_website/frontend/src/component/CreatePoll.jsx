import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/CreatePoll.css";

const API_URL = "http://localhost:5000/api";

export const CreatePoll = ({ onPollCreated }) => {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [answers, setAnswers] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [category, setCategory] = useState("Other");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const addAnswer = () => {
    setAnswers([...answers, ""]);
  };

  const removeAnswer = (index) => {
    if (answers.length > 2) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  };

  const updateAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!question.trim() || answers.some((a) => !a.trim())) {
      setError("Please fill in all fields");
      return;
    }

    if (!expiresAt) {
      setError("Please select an expiration date");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/polls`,
        {
          question,
          description,
          answers: answers.filter((a) => a.trim()),
          expiresAt,
          allowMultiple,
          category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reset form
      setQuestion("");
      setDescription("");
      setAnswers(["", ""]);
      setExpiresAt("");
      setAllowMultiple(false);
      setAllowSingle(false);
      setCategory("Other");

      if (onPollCreated) onPollCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-poll-container">
      <div className="create-poll-card">
        <h2>Create a New Poll</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="question">Question *</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context (optional)"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Answer Options *</label>
            {answers.map((answer, index) => (
              <div key={index} className="answer-input-group">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => updateAnswer(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                  disabled={loading}
                />
                {answers.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeAnswer(index)}
                    className="remove-btn"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAnswer}
              className="add-answer-btn"
              disabled={loading}
            >
              + Add Option
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiresAt">Expires At *</label>
              <input
                type="datetime-local"
                id="expiresAt"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                <option value="Sports">Sports</option>
                <option value="Politics">Politics</option>
                <option value="Technology">Technology</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          {/* Checkbox */}
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => {
                  setAllowMultiple(e.target.checked)
                  console.log(allowMultiple);
                }}
                disabled={loading}
              />
              Allow Multiple Answers
            </label>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </form>
      </div>
    </div>
  );
};
