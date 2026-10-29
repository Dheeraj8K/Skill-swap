import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X, Calendar, Clock, Sparkles, Send, Video } from 'lucide-react';
import './Modal.css';

function SendRequestModal({ targetUser, onClose, onSuccess }) {
  const { user: currentUser } = useAuth();
  const [skillOffering, setSkillOffering] = useState(
    currentUser?.skillsOffering?.[0]?.name || 'Web Development'
  );
  const [skillRequesting, setSkillRequesting] = useState(
    targetUser?.skillsOffering?.[0]?.name || ''
  );
  const [duration, setDuration] = useState('45 mins');
  const [scheduledDate, setScheduledDate] = useState('');
  const [message, setMessage] = useState(
    `Hi ${targetUser.firstName}, I love your work with ${targetUser?.skillsOffering?.[0]?.name || 'your field'}. Would you be open to a skill swap session?`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillOffering || !skillRequesting) {
      setError('Please choose both skills for the exchange');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createRequest({
        receiverId: targetUser.id,
        skillOffering,
        skillRequesting,
        duration,
        scheduledDate: scheduledDate || 'Flexible / To be agreed',
        message
      });

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send swap request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-badge">
              <Sparkles size={16} /> Skill Swap Request
            </div>
            <h2>Propose Exchange with {targetUser.firstName}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Recipient summary */}
        <div className="recipient-pill">
          <img src={targetUser.avatar} alt={targetUser.firstName} className="recipient-avatar" />
          <div className="recipient-info">
            <span className="recipient-name">{targetUser.firstName} {targetUser.lastName}</span>
            <span className="recipient-sub">
              ⭐ {targetUser.rating} ({targetUser.reviewCount || 0} reviews) • {targetUser.location}
            </span>
          </div>
          {targetUser.videoAvailable && (
            <span className="video-ready-badge">
              <Video size={13} /> Video Ready
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner">{error}</div>}

          {/* Skill exchange selector */}
          <div className="exchange-selection-box">
            <div className="exchange-col">
              <label>Skill You Will Teach</label>
              <select
                value={skillOffering}
                onChange={(e) => setSkillOffering(e.target.value)}
                required
              >
                {currentUser?.skillsOffering && currentUser.skillsOffering.length > 0 ? (
                  currentUser.skillsOffering.map((s, i) => (
                    <option key={i} value={s.name}>
                      {s.name} ({s.level || 'Intermediate'})
                    </option>
                  ))
                ) : (
                  <option value="General Coding & Tech">General Coding & Tech</option>
                )}
              </select>
            </div>

            <div className="exchange-divider">
              <span>↔</span>
            </div>

            <div className="exchange-col">
              <label>Skill You Want to Learn</label>
              <select
                value={skillRequesting}
                onChange={(e) => setSkillRequesting(e.target.value)}
                required
              >
                {targetUser.skillsOffering && targetUser.skillsOffering.length > 0 ? (
                  targetUser.skillsOffering.map((s, i) => (
                    <option key={i} value={s.name}>
                      {s.name} ({s.level || 'Intermediate'})
                    </option>
                  ))
                ) : (
                  <option value="Any Skill">Any Skill</option>
                )}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label><Clock size={15} /> Session Duration</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="30 mins">30 mins (Quick Intro)</option>
                <option value="45 mins">45 mins (Recommended)</option>
                <option value="60 mins">60 mins (Deep Dive)</option>
              </select>
            </div>

            <div className="form-group">
              <label><Calendar size={15} /> Proposed Day / Time</label>
              <select
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              >
                <option value="">Choose an available slot...</option>
                {targetUser.availability?.map((av, idx) => (
                  <optgroup key={idx} label={av.day}>
                    {av.slots?.map((slot, sIdx) => (
                      <option key={sIdx} value={`${av.day} @ ${slot}`}>
                        {av.day} @ {slot}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="Flexible / As agreed">Flexible / Coordinate via Chat</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Personalized Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce your background and what you're excited to learn together..."
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit-request" disabled={loading}>
              <Send size={16} /> {loading ? 'Sending Proposal...' : 'Send Swap Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendRequestModal;
