import { Star, MapPin, Calendar, CheckCircle2, Video, Award, MessageSquare, ArrowRight, X } from 'lucide-react';
import './Modal.css';

function UserProfileModal({ user, reviews = [], onClose, onRequestSwap, onStartChat }) {
  if (!user) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card user-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Profile Header Banner */}
        <div className="user-detail-hero">
          <div className="user-detail-avatar-wrap">
            <img src={user.avatar} alt={user.firstName} className="user-detail-avatar" />
            {user.videoAvailable && (
              <span className="online-indicator-large" title="Available for Instant Video Call">
                <Video size={14} />
              </span>
            )}
          </div>
          <div className="user-detail-hero-content">
            <div className="user-detail-name-row">
              <h2>{user.firstName} {user.lastName}</h2>
              {user.videoAvailable && (
                <span className="video-badge-pill">
                  <span className="pulse-dot"></span> Live Video Ready
                </span>
              )}
            </div>
            <p className="user-detail-headline">{user.headline}</p>
            <div className="user-detail-meta">
              <span><MapPin size={14} /> {user.location}</span>
              <span><Star size={14} className="star-icon" /> {user.rating} ({user.reviewCount || reviews.length} reviews)</span>
              <span><CheckCircle2 size={14} /> {user.completedSwaps || 0} Swaps Completed</span>
            </div>
          </div>
        </div>

        <div className="user-detail-body">
          {/* Bio */}
          <div className="detail-section">
            <h3>About</h3>
            <p className="detail-bio">{user.bio}</p>
          </div>

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div className="detail-section">
              <h3>Achievements & Badges</h3>
              <div className="badges-row">
                {user.badges.map((badge, idx) => (
                  <span key={idx} className="badge-tag">
                    <Award size={13} /> {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills Grid */}
          <div className="skills-split-grid">
            <div className="skill-box offering-box">
              <h4>Skills I Offer to Teach</h4>
              <div className="skill-tags-group">
                {user.skillsOffering?.map((skill, idx) => (
                  <div key={idx} className="skill-pill-detailed">
                    <span className="skill-pill-name">{skill.name}</span>
                    <span className="skill-pill-level">{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="skill-box learning-box">
              <h4>Skills I Want to Learn</h4>
              <div className="skill-tags-group">
                {user.skillsLearning?.map((skill, idx) => (
                  <div key={idx} className="skill-pill-detailed learning">
                    <span className="skill-pill-name">{skill.name}</span>
                    <span className="skill-pill-level">{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          {user.availability && user.availability.length > 0 && (
            <div className="detail-section">
              <h3><Calendar size={16} /> Weekly Availability Slots</h3>
              <div className="availability-grid">
                {user.availability.map((av, idx) => (
                  <div key={idx} className="avail-card">
                    <span className="avail-day">{av.day}</span>
                    <div className="avail-slots">
                      {av.slots?.map((slot, sIdx) => (
                        <span key={sIdx} className="slot-chip">{slot}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="detail-section">
            <h3>Community Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="empty-subtext">No reviews yet. Be the first to swap skills with {user.firstName}!</p>
            ) : (
              <div className="reviews-list-compact">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="review-card-item">
                    <div className="review-header-row">
                      <img src={rev.reviewerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"} alt={rev.reviewerName} className="rev-avatar" />
                      <div>
                        <strong>{rev.reviewerName}</strong>
                        <div className="rev-stars">
                          {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                          <span className="rev-skill-tag">• {rev.skill}</span>
                        </div>
                      </div>
                      <span className="rev-time">{rev.createdAt}</span>
                    </div>
                    <p className="rev-text">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="user-detail-footer">
          <button className="btn-chat-action" onClick={() => onStartChat(user)}>
            <MessageSquare size={16} /> Send Direct Message
          </button>
          <button className="btn-swap-action" onClick={() => onRequestSwap(user)}>
            Propose Skill Swap <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
