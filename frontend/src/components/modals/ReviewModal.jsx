import { useState } from 'react';
import { Star, X, Check } from 'lucide-react';
import { api } from '../../services/api';
import './Modal.css';

function ReviewModal({ swapRequest, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [skill, setSkill] = useState(swapRequest?.skillOffering || '');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const targetId = swapRequest?.receiverId;
  const targetName = swapRequest?.receiverName || 'Partner';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback about your swap experience');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createReview({
        recipientId: targetId,
        rating,
        skill,
        comment
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Review Swap Session with {targetName}</h2>
            <p className="modal-subtitle">Share feedback to help the LearnLoop community grow</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner">{error}</div>}

          {/* Star selector */}
          <div className="rating-selector-center">
            <span className="rating-prompt">How was your learning experience?</span>
            <div className="stars-row-interactive">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-select-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star size={32} />
                </button>
              ))}
            </div>
            <span className="rating-label">
              {rating === 5 && "🌟 Outstanding! Learned so much."}
              {rating === 4 && "👍 Great session & very helpful."}
              {rating === 3 && "👌 Good session, as expected."}
              {rating === 2 && "⚠️ Could have been better."}
              {rating === 1 && "❌ Disappointing exchange."}
            </span>
          </div>

          <div className="form-group">
            <label>Skill Endorsed</label>
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. React & Next.js"
              required
            />
          </div>

          <div className="form-group">
            <label>Written Review & Feedback</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you learn? How patient and knowledgeable was your swap partner?"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit-review" disabled={loading}>
              <Check size={16} /> {loading ? 'Submitting Review...' : 'Publish Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
